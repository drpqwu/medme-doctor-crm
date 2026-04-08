import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()

    const { searchParams } = new URL(req.url)
    const doctorIdStr = searchParams.get('doctor_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const doctor_id = doctorIdStr ? parseInt(doctorIdStr) : undefined

    const { visits, total } = db.getVisits({ doctor_id, page, limit })

    return Response.json({ visits, total, page, limit })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const db = getDb()
    const body = await req.json()

    const {
      doctor_id,
      visit_date,
      content,
      next_followup,
      next_followup_date,
      satisfactions = [],
    } = body

    if (!doctor_id || !visit_date || !content?.trim()) {
      return Response.json(
        { error: '醫師、日期、拜訪內容為必填' },
        { status: 400 }
      )
    }

    if (!db.findDoctor(doctor_id)) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    const visit = db.createVisit({
      doctor_id,
      user_id: payload.userId,
      visit_date,
      content: content.trim(),
      next_followup: next_followup || null,
      next_followup_date: next_followup_date || null,
    })

    for (const sat of satisfactions) {
      if (sat.service_type && sat.rating) {
        db.createSatisfaction({
          doctor_id,
          visit_id: visit.id,
          service_type: sat.service_type,
          rating: sat.rating,
          issue_items: sat.issue_items || null,
          reason: sat.reason || null,
          recorded_by: payload.userId,
        })
      }
    }

    db.touchDoctorUpdatedAt(doctor_id)

    const result = db.getVisitWithMeta(visit.id)!
    return Response.json(
      {
        visit: {
          ...result,
          attachments: [],
          satisfactions: db.getSatisfactionsForVisit(visit.id),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
