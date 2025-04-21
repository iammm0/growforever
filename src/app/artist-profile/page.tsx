import fs from 'fs/promises'
import path from 'path'

export default async function ArtistProfilePage() {
    const filePath = path.join(process.cwd(), 'data/profile.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const profile = JSON.parse(file)

    return (
        <main style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>
                艺术家主页
            </h1>
            <p><strong>姓名：</strong>{profile.name}</p>
            <p><strong>风格：</strong>{profile.style}</p>
            <p><strong>简介：</strong>{profile.bio}</p>
        </main>
    )
}
