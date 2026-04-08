import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()

    const { searchParams } = new URL(req.url)
    const doctorId = searchParams.get('doctor_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let where = ''
    let params: any[] = []

    if (doctorId) {
      where = 'WHERE v.doctor_id = ?'
      params.push(parseInt(doctorId))
    }

    const { total } = db.prepare(`SELECT COUNT(*) as total FROM visits v ${where}`).get(...params) as { total: number }

    const visits = db.prepare(`
      SELECT v.*, u.display_name as user_name, d.name as doctor_name
      FROM visits v
      LEFT JOIN users u ON u.id = v.user_id
      LEFT JOIN doctors d ON d.id = v.doctor_id
      ${where}
      ORDER BY v.visit_date DESC, v.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) as any[]

    // Attach attachments
    const attachQuery = db.prepare('SELECT * FROM attachments WHERE visit_id = ?')
    const satQuery = db.prepare(`
      SELECT s.*, u.display_name as recorder_name
      FROM satisfactions s
      LEFT JOIN users u ON u.id = s.recorded_by
      WHERE s.visit_id = ?
    `)
    for (const visit of visits) {
      visit.attachments = attachQuery.all(visit.id)
      visit.satisfactions = satQuery.all(visit.id)
    }

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

    const { doctor_id, visit_date, content, next_followup, next_followup_date, satisfactions = [] } = body

    if (!doctor_id || !visit_date || !content?.trim()) {
      return Response.json({ error: '醫師、日期、拜訪內容為必填' }, { status: 400 })
    }

    const doctor = db.prepare('SELECT id FROM doctors WHERE id = ?').get(doctor_id)
    if (!doctor) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    const result = db.prepare(`
      INSERT INTO visits (doctor_id, user_id, visit_date, content, next_followup, next_followup_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      doctor_id, payload.userId, visit_date, content.trim(),
      next_followup || null, next_followup_date || null
    )

    const visitId = result.lastInsertRowid as number

    // Insert satisfactions
    const insertSat = db.prepare(`
      INSERT INTO satisfactions (doctor_id, visit_id, service_type, rating, issue_items, reason, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    for (const sat of satisfactions) {
      if (sat.service_type && sat.rating) {
        insertSat.run(doctor_id, visitId, sat.service_type, sat.rating,
          sat.issue_items || null, sat.reason || null, payload.userId)
      }
    }

    // Update doctor updated_at
    db.prepare('UPDATE doctors SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(doctor_id)

    const visit = db.prepare(`
      SELECT v.*, u.display_name as user_name
      FROM visits v LEFT JOIN users u ON u.id = v.user_id
      WHERE v.id = ?
    `).get(visitId) as any

    visit.attachments = []
    visit.satisfactions = db.prepare(`
      SELECT s.*, u.display_name as recorder_name
      FROM satisfactions s LEFT JOIN users u ON u.id = s.recorded_by
      WHERE s.visit_id = ?
    `).all(visitId)

    return Response.json({ visit }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
