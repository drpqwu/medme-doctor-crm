import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const db = getDb()
    const user = db
      .prepare('SELECT id, username, display_name, role, created_at FROM users WHERE id = ?')
      .get(payload.userId) as any

    if (!user) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    return Response.json({ user })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
