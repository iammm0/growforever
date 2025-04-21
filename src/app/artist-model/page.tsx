import fs from 'fs/promises'
import path from 'path'
import Image from 'next/image'
import { Fanwork } from '@/types/fanwork'  // 请根据你的项目路径调整

export default async function ArtistModelPage() {
    const filePath = path.join(process.cwd(), 'data/fanworks.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const fanworks: Fanwork[] = JSON.parse(file)

    return (
        <main style={{ padding: '48px', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#6a1b9a' }}>
                模型同人作品
            </h1>

            {fanworks.map((item, i) => (
                <div key={i} style={{ marginBottom: '40px' }}>
                    <h2>{item.title}</h2>
                    <p>{item.desc}</p>
                    <Image
                        src={item.image}
                        alt={item.title}
                        width={400}
                        height={300}
                        style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    />
                </div>
            ))}
        </main>
    )
}