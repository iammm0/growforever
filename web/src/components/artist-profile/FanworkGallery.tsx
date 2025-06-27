'use client'

import {
    Box,
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Button,
    CardMedia,
} from '@mui/material'
import Masonry from '@mui/lab/Masonry'
import {Fanwork} from "@/types/Fanwork";

interface Props {
    allWorks: Fanwork[]
    onDeleteAction: (index: number) => void
}

export default function FanworkGallery({ allWorks, onDeleteAction }: Props) {
    return (
        <Box sx={{ width: '100%', px: 2 }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
                {allWorks.map((work, index) => (
                    <Card key={index} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <CardMedia
                            component="img"
                            image={work.image}
                            alt={work.title}
                            sx={{ width: '100%', height: 'auto' }}
                        />

                        <CardContent>
                            <Typography variant="h6">{work.title}</Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ whiteSpace: 'pre-wrap', mb: 1 }}
                            >
                                {work.desc}
                            </Typography>

                            {!!work.tags?.length && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 1 }}>
                                    {work.tags.map((tag, i) => (
                                        <Chip key={i} label={`#${tag}`} size="small" color="success" />
                                    ))}
                                </Box>
                            )}
                        </CardContent>

                        <CardActions>
                            <Button
                                color="error"
                                size="small"
                                onClick={() => {
                                    const confirmed = confirm('确认删除该作品？')
                                    if (confirmed) onDeleteAction(index)
                                }}
                            >
                                删除
                            </Button>
                        </CardActions>
                    </Card>
                ))}
            </Masonry>
        </Box>
    )
}
