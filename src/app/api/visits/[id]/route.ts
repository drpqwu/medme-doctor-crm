import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)
    const body = await req.json()

    const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(id) as any
    if (!visit) {
      return Response.json({ error: '拜訪紀錄不存在' }, { status: 404 })
    }

    const { visit_date, content, next_followup, next_followup_date } = body

    if (!visit_date || !content?.trim()) {
      return Response.json({ error: '日期和內容為必填' }, { status: 400 })
    }

    db.prepare(`
      UPDATE visits SET
        visit_date = ?, content = ?, next_followup = ?, next_followup_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(visit_date, content.trim(), next_followup || null, next_followup_date || null, id)

    const updated = db.prepare(`
      SELECT v.*, u.display_name as user_name
      FROM visits v LEFT JOIN users u ON u.id = v.user_id
      WHERE v.id = ?
    `).get(id)

    return Response.json({ visit: updated })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)

    const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(id) as any
    if (!visit) {
      return Response.json({ error: '拜訪紀錄不存在' }, { status: 404 })
    }

    db.prepare('DELETE FROM visits WHERE id = ?').run(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
