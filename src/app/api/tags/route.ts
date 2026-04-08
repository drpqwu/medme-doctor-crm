import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()
    const tags = db.getAllTagsWithCount()
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

    if (db.getTagByName(name.trim())) {
      return Response.json({ error: '標籤名稱已存在' }, { status: 409 })
    }

    const tag = db.createTag(name.trim(), color || '#1565C0')
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

    db.deleteTag(parseInt(id))
    return Response.json({ success: true })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
