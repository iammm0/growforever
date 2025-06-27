import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const filePath = path.join(process.cwd(), 'data/profile.json')

export async function GET() {
    const content = await readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(content))
}

export async function POST(req: NextRequest) {
    const profile = await req.json()
    await writeFile(filePath, JSON.stringify(profile, null, 2))
    return NextResponse.json({ success: true })
}