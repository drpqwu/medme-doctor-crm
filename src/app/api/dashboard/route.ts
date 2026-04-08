import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()
    const stats = db.getDashboardStats()
    return Response.json(stats)
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
