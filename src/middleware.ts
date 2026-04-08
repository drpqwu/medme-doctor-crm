import { NextRequest, NextResponse } from 'next/server'

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

  // Check for auth token (cookie existence only - actual verification in API routes)
  const token = req.cookies.get('medme_token')?.value
    if (!token) {
          if (pathname.startsWith('/api/')) {
                  return NextResponse.json({ error: '請先登入' }, { status: 401 })
          }
          return NextResponse.redirect(new URL('/login', req.url))
    }

  return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
