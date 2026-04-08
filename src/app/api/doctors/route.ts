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
    const tagIdStr = searchParams.get('tag_id') || ''
    const sort = searchParams.get('sort') || 'updated_at'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const tag_id = tagIdStr ? parseInt(tagIdStr) : undefined

    const { doctors, total } = db.getDoctors({
      search,
      specialty,
      hospital,
      tag_id,
      sort,
      page,
      limit,
    })

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
      name,
      specialty,
      hospital,
      title,
      phone,
      line_id,
      email,
      photo_url,
      surgical_preferences,
      common_devices,
      consultation_habits,
      notes,
      tag_ids = [],
    } = body

    if (!name?.trim()) {
      return Response.json({ error: '醫師姓名為必填' }, { status: 400 })
    }

    const doctor = db.createDoctor({
      name: name.trim(),
      specialty: specialty || null,
      hospital: hospital || null,
      title: title || null,
      phone: phone || null,
      line_id: line_id || null,
      email: email || null,
      photo_url: photo_url || null,
      surgical_preferences: surgical_preferences || null,
      common_devices: common_devices || null,
      consultation_habits: consultation_habits || null,
      notes: notes || null,
      created_by: payload.userId,
    })

    db.setDoctorTags(doctor.id, tag_ids)
    const result = db.getDoctorWithTags(doctor.id)

    return Response.json({ doctor: result }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
