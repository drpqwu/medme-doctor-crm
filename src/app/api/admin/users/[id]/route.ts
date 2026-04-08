import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)
    const { display_name, role, password } = await req.json()

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
    if (!user) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      db.prepare(`
        UPDATE users SET display_name = ?, role = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(display_name, role, hash, id)
    } else {
      db.prepare(`
        UPDATE users SET display_name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(display_name, role, id)
    }

    const updated = db.prepare(
      'SELECT id, username, display_name, role, created_at, updated_at FROM users WHERE id = ?'
    ).get(id)

    return Response.json({ user: updated })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)

    if (payload.userId === id) {
      return Response.json({ error: '不能刪除自己的帳號' }, { status: 400 })
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
    if (!user) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
