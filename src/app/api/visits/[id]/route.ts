import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)
    const body = await req.json()

    if (!db.findVisit(id)) {
      return Response.json({ error: '拜訪紀錄不存在' }, { status: 404 })
    }

    const { visit_date, content, next_followup, next_followup_date } = body

    if (!visit_date || !content?.trim()) {
      return Response.json({ error: '日期和內容為必填' }, { status: 400 })
    }

    const updated = db.updateVisit(id, {
      visit_date,
      content: content.trim(),
      next_followup: next_followup || null,
      next_followup_date: next_followup_date || null,
    })

    return Response.json({ visit: updated })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)

    if (!db.findVisit(id)) {
      return Response.json({ error: '拜訪紀錄不存在' }, { status: 404 })
    }

    db.deleteVisit(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
