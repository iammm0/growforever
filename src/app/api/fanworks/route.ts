import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

const filePath = path.join(process.cwd(), 'data/fanworks.json')

export async function POST(req: NextRequest) {
    const newWork = await req.json()

    try {
        const content = await readFile(filePath, 'utf-8')
        const data = JSON.parse(content)
        data.push(newWork)
        await writeFile(filePath, JSON.stringify(data, null, 2))
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: '保存失败' }, { status: 500 })
    }
}
