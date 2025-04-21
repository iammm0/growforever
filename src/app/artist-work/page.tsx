import fs from 'fs/promises'
import path from 'path'
import Image from 'next/image'

export default async function ArtistWorkPage() {
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    const files = await fs.readdir(uploadsDir)
    const images = files.filter((file) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    )

    return (
        <main style={{ padding: '48px', maxWidth: '1100px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1565c0' }}>
                艺术家作品集
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '24px',
                marginTop: '32px',
            }}>
                {images.map((filename, i) => (
                    <Image
                        key={i}
                        src={`/uploads/${filename}`}
                        alt={`作品 ${i + 1}`}
                        width={240}
                        height={240}
                        style={{
                            borderRadius: '12px',
                            objectFit: 'cover',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        }}
                    />
                ))}
            </div>
        </main>
    )
}