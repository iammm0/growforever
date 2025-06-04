import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    if (!isAdminRoute) return NextResponse.next()

    const auth = request.headers.get('authorization')

    const basicAuth = auth?.split(' ')[1]
    if (!basicAuth) {
        return new Response('Unauthorized', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
        })
    }

    const [user, pwd] = atob(basicAuth).split(':')
    if (
        user === process.env.ADMIN_USERNAME &&
        pwd === process.env.ADMIN_PASSWORD
    ) {
        return NextResponse.next()
    }

    return new Response('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' },
    })
}

export const config = {
    matcher: ['/admin/:path*'],
}
