import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)

    const doctor = db.getDoctorById(id)
    if (!doctor) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    return Response.json({ doctor })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAuth(req)
    const db = getDb()
    const id = parseInt(params.id)
    const body = await req.json()

    if (!db.findDoctor(id)) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

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

    db.updateDoctor(id, {
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
    })

    db.setDoctorTags(id, tag_ids)
    const doctor = db.getDoctorWithTags(id)

    return Response.json({ doctor })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(req)
    const db = getDb()
    const id = parseInt(params.id)

    if (!db.findDoctor(id)) {
      return Response.json({ error: '醫師不存在' }, { status: 404 })
    }

    db.deleteDoctor(id)
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
