import { writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    const form = await req.formData()
    const file = form.get('image') as File
    const customName = form.get('filename')?.toString() || file.name

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', customName)

    await writeFile(uploadPath, buffer)

    return NextResponse.json({ url: `/uploads/${customName}` })
}