import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import type { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'
const COOKIE_NAME = 'medme_token'

export interface JwtPayload {
  userId: number
  username: string
  role: 'admin' | 'member'
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // From cookie
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // From Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

export function getCurrentUserFromRequest(req: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

export function requireAuth(req: NextRequest): JwtPayload {
  const user = getCurrentUserFromRequest(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function requireAdmin(req: NextRequest): JwtPayload {
  const user = requireAuth(req)
  if (user.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return user
}

export function authErrorResponse(error: Error) {
  if (error.message === 'Unauthorized') {
    return Response.json({ error: '請先登入' }, { status: 401 })
  }
  if (error.message === 'Forbidden') {
    return Response.json({ error: '權限不足' }, { status: 403 })
  }
  return Response.json({ error: '伺服器錯誤' }, { status: 500 })
}
