import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)

    const doctor = db.prepare(`
      SELECT d.*, MAX(v.visit_date) as last_visit_date, COUNT(DISTINCT v.id) as visit_count
      FROM doctors d
      LEFT JOIN visits v ON v.doctor_id = d.id
      WHERE d.id = ?
      GROUP BY d.id
    `).get(id) as any

    if (!doctor) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    doctor.tags = db.prepare(`
      SELECT t.* FROM tags t JOIN doctor_tags dt ON dt.tag_id = t.id WHERE dt.doctor_id = ?
    `).all(id)

    // Latest satisfactions
    doctor.satisfactions = db.prepare(`
      SELECT s.*, u.display_name as recorder_name
      FROM satisfactions s
      LEFT JOIN users u ON u.id = s.recorded_by
      WHERE s.doctor_id = ?
      ORDER BY s.recorded_at DESC
      LIMIT 10
    `).all(id)

    return Response.json({ doctor })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)
    const body = await req.json()

    const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(id)
    if (!existing) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    const {
      name, specialty, hospital, title, phone, line_id, email, photo_url,
      surgical_preferences, common_devices, consultation_habits, notes, tag_ids = []
    } = body

    if (!name?.trim()) {
      return Response.json({ error: '醫師姓名為必填' }, { status: 400 })
    }

    db.prepare(`
      UPDATE doctors SET
        name = ?, specialty = ?, hospital = ?, title = ?,
        phone = ?, line_id = ?, email = ?, photo_url = ?,
        surgical_preferences = ?, common_devices = ?,
        consultation_habits = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name.trim(), specialty || null, hospital || null, title || null,
      phone || null, line_id || null, email || null, photo_url || null,
      surgical_preferences || null, common_devices || null,
      consultation_habits || null, notes || null, id
    )

    // Update tags: delete old, insert new
    db.prepare('DELETE FROM doctor_tags WHERE doctor_id = ?').run(id)
    const insertTag = db.prepare('INSERT OR IGNORE INTO doctor_tags (doctor_id, tag_id) VALUES (?, ?)')
    for (const tagId of tag_ids) {
      insertTag.run(id, tagId)
    }

    const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as any
    doctor.tags = db.prepare(`
      SELECT t.* FROM tags t JOIN doctor_tags dt ON dt.tag_id = t.id WHERE dt.doctor_id = ?
    `).all(id)

    return Response.json({ doctor })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)

    const existing = db.prepare('SELECT id FROM doctors WHERE id = ?').get(id)
    if (!existing) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    db.prepare('DELETE FROM doctors WHERE id = ?').run(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
