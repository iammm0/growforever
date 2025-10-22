'use client'
import { useState } from 'react'
import { ReactFlowProvider } from 'reactflow'
import GraphCanvas from '../../components/graph/graph-canvas'
import ControlPanel from '../../components/graph/control-panel'
import ConfigDrawer from '../../components/graph/config-drawer'
import Suggest from "@/components/presentation/suggest"

export default function GraphPage() {
    const desktopUrl = typeof window !== 'undefined' ? window.location.href : 'https://growforver.physicistscard.com/graph';

    const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
    const [openPromptDialog, setOpenPromptDialog] = useState(false); // 新增状态，控制提示词对话框的打开

    const handlePromptOpen = () => {
        setOpenPromptDialog(true); // 打开提示词对话框
    };

    const handlePromptClose = () => {
        setOpenPromptDialog(false); // 关闭提示词对话框
    };

    const handleConfigOpen = () => {
        setConfigDrawerOpen(true);
    };

    const handleConfigClose = () => {
        setConfigDrawerOpen(false);
    };

    return (
        <>
            <Suggest desktopUrl={desktopUrl} />
            <div className="relative w-full h-screen overflow-hidden">
                {/* 浮动控制面板 */}
                <ControlPanel
                    onPromptOpen={handlePromptOpen}
                    onConfigOpen={handleConfigOpen}
                />

                {/* 配置抽屉 */}
                <ConfigDrawer
                    open={configDrawerOpen}
                    closeAction={handleConfigClose}
                />

                {/* 图形画布 - 现在占据全屏 */}
                <ReactFlowProvider>
                    <GraphCanvas 
                        promptDialogOpen={openPromptDialog}
                        onPromptDialogOpen={handlePromptOpen}
                        onPromptDialogClose={handlePromptClose}
                    />
                </ReactFlowProvider>
            </div>
        </>
    )
}
