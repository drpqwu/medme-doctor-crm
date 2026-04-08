import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  clearAuthCookie()
  return Response.json({ success: true })
}
