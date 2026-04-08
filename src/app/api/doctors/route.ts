import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const db = getDb()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const specialty = searchParams.get('specialty') || ''
    const hospital = searchParams.get('hospital') || ''
    const tagId = searchParams.get('tag_id') || ''
    const sort = searchParams.get('sort') || 'updated_at'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    let whereClauses: string[] = []
    let params: any[] = []

    if (search) {
      whereClauses.push('(d.name LIKE ? OR d.hospital LIKE ? OR d.specialty LIKE ?)')
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    if (specialty) {
      whereClauses.push('d.specialty = ?')
      params.push(specialty)
    }
    if (hospital) {
      whereClauses.push('d.hospital LIKE ?')
      params.push(`%${hospital}%`)
    }
    if (tagId) {
      whereClauses.push('EXISTS (SELECT 1 FROM doctor_tags dt WHERE dt.doctor_id = d.id AND dt.tag_id = ?)')
      params.push(tagId)
    }

    const whereStr = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const orderStr = sort === 'last_visit' ? 'ORDER BY last_visit_date DESC NULLS LAST' : `ORDER BY d.${sort} DESC`

    const countQuery = `SELECT COUNT(*) as total FROM doctors d ${whereStr}`
    const { total } = db.prepare(countQuery).get(...params) as { total: number }

    const query = `
      SELECT
        d.*,
        MAX(v.visit_date) as last_visit_date,
        COUNT(DISTINCT v.id) as visit_count
      FROM doctors d
      LEFT JOIN visits v ON v.doctor_id = d.id
      ${whereStr}
      GROUP BY d.id
      ${orderStr}
      LIMIT ? OFFSET ?
    `
    const doctors = db.prepare(query).all(...params, limit, offset) as any[]

    // Attach tags
    const tagQuery = db.prepare(`
      SELECT t.* FROM tags t
      JOIN doctor_tags dt ON dt.tag_id = t.id
      WHERE dt.doctor_id = ?
    `)
    for (const doc of doctors) {
      doc.tags = tagQuery.all(doc.id)
    }

    return Response.json({ doctors, total, page, limit })
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
      name, specialty, hospital, title, phone, line_id, email, photo_url,
      surgical_preferences, common_devices, consultation_habits, notes, tag_ids = []
    } = body

    if (!name?.trim()) {
      return Response.json({ error: '醫師姓名為必填' }, { status: 400 })
    }

    const result = db.prepare(`
      INSERT INTO doctors (name, specialty, hospital, title, phone, line_id, email, photo_url,
        surgical_preferences, common_devices, consultation_habits, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(), specialty || null, hospital || null, title || null,
      phone || null, line_id || null, email || null, photo_url || null,
      surgical_preferences || null, common_devices || null,
      consultation_habits || null, notes || null, payload.userId
    )

    const doctorId = result.lastInsertRowid as number

    // Insert tags
    const insertTag = db.prepare('INSERT OR IGNORE INTO doctor_tags (doctor_id, tag_id) VALUES (?, ?)')
    for (const tagId of tag_ids) {
      insertTag.run(doctorId, tagId)
    }

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(doctorId) as any
    doctor.tags = db.prepare(`
      SELECT t.* FROM tags t JOIN doctor_tags dt ON dt.tag_id = t.id WHERE dt.doctor_id = ?
    `).all(doctorId)

    return Response.json({ doctor }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
