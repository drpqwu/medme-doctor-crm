import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import getDb from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return Response.json({ error: '請輸入帳號和密碼' }, { status: 400 })
    }

    const db = getDb()
    const user = db.getUserByUsername(username)

    if (!user) {
      return Response.json({ error: '帳號或密碼錯誤' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return Response.json({ error: '帳號或密碼錯誤' }, { status: 401 })
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    setAuthCookie(token)

    return Response.json({
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
