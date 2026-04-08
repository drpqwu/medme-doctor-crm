import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const db = getDb()
    const u = db.getUserById(payload.userId)

    if (!u) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    return Response.json({
      user: {
        id: u.id,
        username: u.username,
        display_name: u.display_name,
        role: u.role,
        created_at: u.created_at,
      },
    })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
