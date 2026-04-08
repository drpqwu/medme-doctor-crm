import { NextRequest } from 'next/server'
import { requireAuth, authErrorResponse } from '@/lib/auth'
import getDb from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)
    const db = getDb()

    const { total_doctors } = db.prepare('SELECT COUNT(*) as total_doctors FROM doctors').get() as any

    const { weekly_visits } = db.prepare(`
      SELECT COUNT(*) as weekly_visits FROM visits
      WHERE visit_date >= date('now', '-7 days')
    `).get() as any

    const { pending_followups } = db.prepare(`
      SELECT COUNT(*) as pending_followups FROM visits
      WHERE next_followup_date IS NOT NULL
        AND next_followup_date >= date('now')
        AND next_followup_date <= date('now', '+14 days')
    `).get() as any

    const recent_activities = db.prepare(`
      SELECT
        'visit' as type,
        v.id,
        v.doctor_id,
        d.name as doctor_name,
        v.content,
        COALESCE(u.display_name, '未知') as user_name,
        v.created_at
      FROM visits v
      LEFT JOIN doctors d ON d.id = v.doctor_id
      LEFT JOIN users u ON u.id = v.user_id
      ORDER BY v.created_at DESC
      LIMIT 15
    `).all()

    return Response.json({
      total_doctors,
      weekly_visits,
      pending_followups,
      recent_activities,
    })
  } catch (error: any) {
    return authErrorResponse(error)
  }
}
