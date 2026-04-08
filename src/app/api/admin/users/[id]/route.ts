import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)
    const { display_name, role, password } = await req.json()

    if (!db.getUserById(id)) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    const data: { display_name?: string; role?: 'admin' | 'member'; password_hash?: string } = {
      display_name,
      role,
    }

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10)
    }

    const updated = db.updateUser(id, data)!

    return Response.json({
      user: {
        id: updated.id,
        username: updated.username,
        display_name: updated.display_name,
        role: updated.role,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
      },
    })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)

    if (payload.userId === id) {
      return Response.json({ error: '不能刪除自己的帳號' }, { status: 400 })
    }

    if (!db.getUserById(id)) {
      return Response.json({ error: '使用者不存在' }, { status: 404 })
    }

    db.deleteUser(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
