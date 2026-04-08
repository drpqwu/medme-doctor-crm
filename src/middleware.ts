import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/uploads')
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('medme_token')?.value
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '登入已過期，請重新登入' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.delete('medme_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
