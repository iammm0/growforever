"""
Ollama高级代理模块

支持模型切换、负载均衡、缓存等功能。
"""

import asyncio
import hashlib
import json
import time
from typing import Dict, Optional, Any, List
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum

from aiohttp import ClientSession, ClientTimeout

from src.config import get_config, ServiceConfig
from src.logger import setup_logger
from src.utils import hash_prompt

logger = setup_logger(__name__)


class LoadBalancingStrategy(str, Enum):
    """负载均衡策略"""
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED = "weighted"


@dataclass
class OllamaInstance:
    """Ollama实例"""
    url: str
    weight: int = 1
    connections: int = 0
    last_used: float = 0.0
    healthy: bool = True
    response_time: float = 0.0


@dataclass
class CacheEntry:
    """缓存条目"""
    response: str
    timestamp: float
    ttl: int


class OllamaProxy:
    """Ollama高级代理"""
    
    def __init__(self, config: Optional[ServiceConfig] = None):
        """
        初始化Ollama代理
        
        Args:
            config: 服务配置
        """
        self.config = config or get_config()
        self.ollama_config = self.config.ollama
        
        # HTTP会话
        self.session: Optional[ClientSession] = None
        
        # Ollama实例列表
        self.instances: List[OllamaInstance] = []
        self._init_instances()
        
        # 负载均衡
        self.current_instance_index = 0
        self.load_balancing = LoadBalancingStrategy(self.ollama_config.load_balancing)
        
        # 缓存
        self.cache: Dict[str, CacheEntry] = {}
        self.cache_enabled = self.ollama_config.enable_cache
        self.cache_ttl = self.ollama_config.cache_ttl
        
        # 统计信息
        self.stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "errors": 0,
            "instance_stats": defaultdict(lambda: {
                "requests": 0,
                "errors": 0,
                "avg_response_time": 0.0
            })
        }
        
        logger.info(f"Ollama代理初始化，实例数: {len(self.instances)}")
    
    def _init_instances(self):
        """初始化Ollama实例"""
        if self.ollama_config.instances:
            for instance_config in self.ollama_config.instances:
                instance = OllamaInstance(
                    url=instance_config.url,
                    weight=instance_config.weight
                )
                self.instances.append(instance)
        else:
            # 使用默认配置
            instance = OllamaInstance(
                url=self.ollama_config.base_url,
                weight=1
            )
            self.instances.append(instance)
    
    async def initialize(self):
        """初始化HTTP会话"""
        timeout = ClientTimeout(total=self.ollama_config.timeout)
        self.session = ClientSession(timeout=timeout)
        
        # 健康检查
        await self._health_check_all()
    
    async def close(self):
        """关闭HTTP会话"""
        if self.session:
            await self.session.close()
    
    async def _health_check_all(self):
        """对所有实例进行健康检查"""
        tasks = [self._health_check(instance) for instance in self.instances]
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _health_check(self, instance: OllamaInstance) -> bool:
        """
        检查实例健康状态
        
        Args:
            instance: Ollama实例
            
        Returns:
            是否健康
        """
        try:
            start_time = time.time()
            async with self.session.get(f"{instance.url}/api/tags") as response:
                response_time = time.time() - start_time
                instance.response_time = response_time
                instance.healthy = response.status == 200
                return instance.healthy
        except Exception as e:
            logger.warning(f"实例 {instance.url} 健康检查失败: {str(e)}")
            instance.healthy = False
            return False
    
    def _select_instance(self) -> Optional[OllamaInstance]:
        """
        选择Ollama实例（负载均衡）
        
        Returns:
            选中的实例
        """
        # 过滤健康实例
        healthy_instances = [inst for inst in self.instances if inst.healthy]
        if not healthy_instances:
            logger.warning("没有健康的Ollama实例")
            return None
        
        if self.load_balancing == LoadBalancingStrategy.ROUND_ROBIN:
            instance = healthy_instances[self.current_instance_index % len(healthy_instances)]
            self.current_instance_index += 1
            return instance
        
        elif self.load_balancing == LoadBalancingStrategy.LEAST_CONNECTIONS:
            instance = min(healthy_instances, key=lambda x: x.connections)
            return instance
        
        elif self.load_balancing == LoadBalancingStrategy.WEIGHTED:
            # 加权轮询
            total_weight = sum(inst.weight for inst in healthy_instances)
            # 简化实现：按权重选择
            instance = max(healthy_instances, key=lambda x: x.weight / (x.connections + 1))
            return instance
        
        return healthy_instances[0]
    
    def _get_cache_key(self, model: str, prompt: str, **kwargs) -> str:
        """
        生成缓存键
        
        Args:
            model: 模型名称
            prompt: 提示文本
            **kwargs: 其他参数
            
        Returns:
            缓存键
        """
        return hash_prompt(prompt, model, **kwargs)
    
    def _get_from_cache(self, cache_key: str) -> Optional[str]:
        """
        从缓存获取响应
        
        Args:
            cache_key: 缓存键
            
        Returns:
            缓存的响应或None
        """
        if not self.cache_enabled:
            return None
        
        entry = self.cache.get(cache_key)
        if entry is None:
            return None
        
        # 检查TTL
        if time.time() - entry.timestamp > self.cache_ttl:
            del self.cache[cache_key]
            return None
        
        return entry.response
    
    def _set_cache(self, cache_key: str, response: str):
        """
        设置缓存
        
        Args:
            cache_key: 缓存键
            response: 响应内容
        """
        if not self.cache_enabled:
            return
        
        entry = CacheEntry(
            response=response,
            timestamp=time.time(),
            ttl=self.cache_ttl
        )
        self.cache[cache_key] = entry
        
        # 简单的LRU：如果缓存太大，删除最旧的
        if len(self.cache) > 1000:
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k].timestamp)
            del self.cache[oldest_key]
    
    async def generate(
        self,
        model: str,
        prompt: str,
        stream: bool = False,
        **kwargs
    ) -> Any:
        """
        生成文本
        
        Args:
            model: 模型名称
            prompt: 提示文本
            stream: 是否流式输出
            **kwargs: 其他生成参数
            
        Returns:
            生成的文本或流式生成器
        """
        # 检查缓存
        cache_key = self._get_cache_key(model, prompt, **kwargs)
        if not stream:
            cached_response = self._get_from_cache(cache_key)
            if cached_response:
                self.stats["cache_hits"] += 1
                return cached_response
            self.stats["cache_misses"] += 1
        
        # 选择实例
        instance = self._select_instance()
        if instance is None:
            raise RuntimeError("没有可用的Ollama实例")
        
        instance.connections += 1
        instance.last_used = time.time()
        self.stats["total_requests"] += 1
        self.stats["instance_stats"][instance.url]["requests"] += 1
        
        try:
            start_time = time.time()
            
            # 构建请求数据
            request_data = {
                "model": model,
                "prompt": prompt,
                "stream": stream,
                **kwargs
            }
            
            # 发送请求
            url = f"{instance.url}/api/generate"
            async with self.session.post(url, json=request_data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise RuntimeError(f"Ollama请求失败: {error_text}")
                
                if stream:
                    # 流式响应
                    async def stream_generator():
                        async for line in response.content:
                            if line:
                                try:
                                    data = json.loads(line)
                                    if "response" in data:
                                        yield data["response"]
                                    if data.get("done", False):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    
                    return stream_generator()
                else:
                    # 非流式响应
                    data = await response.json()
                    generated_text = data.get("response", "")
                    
                    # 更新响应时间
                    response_time = time.time() - start_time
                    instance.response_time = response_time
                    self.stats["instance_stats"][instance.url]["avg_response_time"] = (
                        (self.stats["instance_stats"][instance.url]["avg_response_time"] *
                         (self.stats["instance_stats"][instance.url]["requests"] - 1) +
                         response_time) / self.stats["instance_stats"][instance.url]["requests"]
                    )
                    
                    # 缓存响应
                    self._set_cache(cache_key, generated_text)
                    
                    return generated_text
        
        except Exception as e:
            self.stats["errors"] += 1
            self.stats["instance_stats"][instance.url]["errors"] += 1
            logger.error(f"Ollama请求失败: {str(e)}", exc_info=True)
            raise
        
        finally:
            instance.connections -= 1
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """
        列出Ollama模型
        
        Returns:
            模型列表
        """
        instance = self._select_instance()
        if instance is None:
            raise RuntimeError("没有可用的Ollama实例")
        
        try:
            url = f"{instance.url}/api/tags"
            async with self.session.get(url) as response:
                if response.status != 200:
                    raise RuntimeError(f"获取模型列表失败: {response.status}")
                
                data = await response.json()
                models = data.get("models", [])
                return [
                    {
                        "name": model.get("name"),
                        "size": model.get("size"),
                        "modified_at": model.get("modified_at")
                    }
                    for model in models
                ]
        
        except Exception as e:
            logger.error(f"获取模型列表失败: {str(e)}", exc_info=True)
            raise
    
    async def pull_model(self, model_name: str) -> Dict[str, Any]:
        """
        拉取Ollama模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            拉取结果
        """
        instance = self._select_instance()
        if instance is None:
            raise RuntimeError("没有可用的Ollama实例")
        
        try:
            url = f"{instance.url}/api/pull"
            request_data = {"name": model_name}
            
            async with self.session.post(url, json=request_data) as response:
                if response.status != 200:
                    raise RuntimeError(f"拉取模型失败: {response.status}")
                
                # 流式读取进度
                result = {"status": "pulling", "progress": []}
                async for line in response.content:
                    if line:
                        try:
                            data = json.loads(line)
                            if "status" in data:
                                result["status"] = data["status"]
                            if "completed" in data:
                                result["completed"] = data["completed"]
                            if "total" in data:
                                result["total"] = data["total"]
                        except json.JSONDecodeError:
                            continue
                
                return result
        
        except Exception as e:
            logger.error(f"拉取模型失败: {str(e)}", exc_info=True)
            raise
    
    def get_stats(self) -> Dict[str, Any]:
        """
        获取统计信息
        
        Returns:
            统计信息字典
        """
        return {
            **self.stats,
            "cache_size": len(self.cache),
            "cache_enabled": self.cache_enabled,
            "instances": [
                {
                    "url": inst.url,
                    "weight": inst.weight,
                    "connections": inst.connections,
                    "healthy": inst.healthy,
                    "response_time": inst.response_time
                }
                for inst in self.instances
            ]
        }

