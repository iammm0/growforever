from pydantic import BaseModel, Field

class TextGenRequest(BaseModel):
    prompt: str = Field(..., description="提示文本")
    max_tokens: int | None = Field(None, description="生成的最大 token 数")

class TextGenResponse(BaseModel):
    text: str = Field(..., description="生成的文本")
