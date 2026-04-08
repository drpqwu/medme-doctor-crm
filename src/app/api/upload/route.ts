import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const db = getDb()

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const visitId = formData.get('visit_id')

    if (!file) {
      return Response.json({ error: '請選擇檔案' }, { status: 400 })
    }
    if (!visitId) {
      return Response.json({ error: '缺少 visit_id' }, { status: 400 })
    }

    const visit = db.prepare('SELECT id FROM visits WHERE id = ?').get(parseInt(visitId as string))
    if (!visit) {
      return Response.json({ error: '拜訪紀錄不存在' }, { status: 404 })
    }

    const uploadDir = path.resolve(UPLOAD_DIR)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const filePath = path.join(uploadDir, safeName)

    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)

    const result = db.prepare(`
      INSERT INTO attachments (visit_id, filename, file_path, file_type, file_size, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(parseInt(visitId as string), file.name, `/uploads/${safeName}`, file.type, file.size, payload.userId)

    const attachment = db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid)
    return Response.json({ attachment }, { status: 201 })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
