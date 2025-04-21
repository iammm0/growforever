import { writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('image') as unknown as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filePath = path.join(process.cwd(), 'public/uploads', file.name)
    await writeFile(filePath, buffer)

    return NextResponse.json({ success: true })
}
