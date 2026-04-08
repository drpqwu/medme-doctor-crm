import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    const db = getDb()
    const users = db.prepare(
      'SELECT id, username, display_name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    ).all()
    return Response.json({ users })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    const db = getDb()
    const { username, password, display_name, role } = await req.json()

    if (!username?.trim() || !password || !display_name?.trim()) {
      return Response.json({ error: '帳號、密碼、顯示名稱為必填' }, { status: 400 })
    }

    if (!['admin', 'member'].includes(role)) {
      return Response.json({ error: '無效的角色' }, { status: 400 })
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim())
    if (existing) {
      return Response.json({ error: '帳號已存在' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const result = db.prepare(`
      INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)
    `).run(username.trim(), hash, display_name.trim(), role)

    const user = db.prepare(
      'SELECT id, username, display_name, role, created_at FROM users WHERE id = ?'
    ).get(result.lastInsertRowid)

    return Response.json({ user }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
