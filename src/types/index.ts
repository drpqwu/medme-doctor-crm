export interface User {
  id: number
  username: string
  display_name: string
  role: 'admin' | 'member'
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: number
  name: string
  specialty: string | null
  hospital: string | null
  title: string | null
  phone: string | null
  line_id: string | null
  email: string | null
  photo_url: string | null
  surgical_preferences: string | null
  common_devices: string | null
  consultation_habits: string | null
  notes: string | null
  created_by: number | null
  created_at: string
  updated_at: string
  tags?: Tag[]
  last_visit_date?: string | null
  visit_count?: number
}

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
}

export interface Visit {
  id: number
  doctor_id: number
  user_id: number
  visit_date: string
  content: string
  next_followup: string | null
  next_followup_date: string | null
  created_at: string
  updated_at: string
  user_name?: string
  attachments?: Attachment[]
  satisfactions?: Satisfaction[]
}

export interface Satisfaction {
  id: number
  doctor_id: number
  visit_id: number | null
  service_type: string
  rating: number
  issue_items: string | null
  reason: string | null
  recorded_by: number | null
  recorded_at: string
  recorder_name?: string
}

export interface Attachment {
  id: number
  visit_id: number
  filename: string
  file_path: string
  file_type: string | null
  file_size: number | null
  uploaded_by: number | null
  uploaded_at: string
}

export interface DashboardStats {
  total_doctors: number
  weekly_visits: number
  pending_followups: number
  recent_activities: RecentActivity[]
}

export interface RecentActivity {
  type: 'visit' | 'doctor_added'
  id: number
  doctor_id: number
  doctor_name: string
  content: string
  user_name: string
  created_at: string
}
