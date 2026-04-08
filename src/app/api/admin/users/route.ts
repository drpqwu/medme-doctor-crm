import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    const db = getDb()
    const users = db.getAllUsers().map(u => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))
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
      return Response.json(
        { error: '帳號、密碼、顯示名稱為必填' },
        { status: 400 }
      )
    }

    if (!['admin', 'member'].includes(role)) {
      return Response.json({ error: '無效的角色' }, { status: 400 })
    }

    if (db.getUserByUsername(username.trim())) {
      return Response.json({ error: '帳號已存在' }, { status: 409 })
    }

    const hash = await bcrypt.hash(password, 10)
    const user = db.createUser({
      username: username.trim(),
      password_hash: hash,
      display_name: display_name.trim(),
      role,
    })

    return Response.json(
      {
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          role: user.role,
          created_at: user.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
