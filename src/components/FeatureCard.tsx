import { Card, Typography } from '@mui/material'
import styles from '@/styles/grow.module.css'

export default function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
        <Card className={styles.featureCard} elevation={3}>
            <Typography variant="h6" fontWeight="bold" mb={1}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description}
            </Typography>
        </Card>
    )
}