import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()
    const tags = db.prepare(`
      SELECT t.*, COUNT(dt.doctor_id) as doctor_count
      FROM tags t
      LEFT JOIN doctor_tags dt ON dt.tag_id = t.id
      GROUP BY t.id
      ORDER BY t.name
    `).all()
    return Response.json({ tags })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()
    const { name, color } = await req.json()

    if (!name?.trim()) {
      return Response.json({ error: '標籤名稱為必填' }, { status: 400 })
    }

    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(name.trim())
    if (existing) {
      return Response.json({ error: '標籤名稱已存在' }, { status: 409 })
    }

    const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(
      name.trim(), color || '#1565C0'
    )

    const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(result.lastInsertRowid)
    return Response.json({ tag }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    requireAdmin(req)
    const db = getDb()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return Response.json({ error: '缺少 id' }, { status: 400 })
    }

    db.prepare('DELETE FROM tags WHERE id = ?').run(parseInt(id))
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
