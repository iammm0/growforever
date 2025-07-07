import path from 'path'
import fs from 'fs/promises'
import Image from 'next/image'
import styles from './artistModel.module.css'
import {Fanwork} from "../../types/Fanwork";

export default async function ArtistModelPage() {
    const filePath = path.join(process.cwd(), 'data/fanworks.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const fanworks: Fanwork[] = JSON.parse(file)

    return (
        <main className={styles.page}>
            <div className={styles.grid}>
                {fanworks.map((item, i) => (
                    <div className={styles.card} key={i}>
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={500}
                            height={300}
                            className={styles.cardImage}
                        />

                        <div className={styles.cardContent}>
                            <h2 className={styles.cardTitle}>{item.title}</h2>
                            <p className={styles.cardDesc}>{item.desc}</p>

                            {item.tags && item.tags.length > 0 && (
                                <div className={styles.tags}>
                                    {item.tags.map((tag, idx) => (
                                        <span className={styles.tag} key={idx}>#{tag}</span>
                                    ))}
                                </div>
                            )}

                            {item.sourceLink && (
                                <a
                                    href={item.sourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.sourceLink}
                                >
                                    来源链接 ↗
                                </a>
                            )}
                        </div>

                        <div className={styles.meta}>
                            上传时间：{new Date(item.createdAt).toLocaleString()}
                            {item.author && ` · 作者：${item.author}`}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
