
import {Button, Stack, Typography} from '@mui/material'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import React from "react";

interface ExpandOptionsPopoverProps {
    trigger: React.ReactNode
    onExpand: (mode: 'depth' | 'free' | 'tag') => void
}

export function ExpandOptionsPopover({ trigger, onExpand }: ExpandOptionsPopoverProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent>
                <Typography variant="h6" gutterBottom>
                    选择展开模式
                </Typography>
                <Stack spacing={1}>
                    <Button onClick={() => onExpand('depth')} variant="contained" color="success">
                        🔎 深度相关展开
                    </Button>
                    <Button onClick={() => onExpand('free')} variant="contained" color="primary">
                        🌍 自由发散展开
                    </Button>
                    <Button onClick={() => onExpand('tag')} variant="contained" color="secondary">
                        🏷️ 标签驱动展开
                    </Button>
                </Stack>
            </PopoverContent>
        </Popover>
    )
}
