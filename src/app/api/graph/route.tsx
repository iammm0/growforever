import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        message: 'Graph API Mock GET Response',
        data: {},
    })
}

export async function POST(request: Request) {
    const body = await request.json()
    return NextResponse.json({
        message: 'Graph API Mock POST Response',
        received: body,
    })
}
