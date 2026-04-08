import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

// ---- Types ----

export interface User {
  id: number
  username: string
  password_hash: string
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
}

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
}

export interface DoctorTag {
  doctor_id: number
  tag_id: number
}

export interface Visit {
  id: number
  doctor_id: number
  user_id: number | null
  visit_date: string
  content: string
  next_followup: string | null
  next_followup_date: string | null
  created_at: string
  updated_at: string
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

interface DataStore {
  users: User[]
  doctors: Doctor[]
  tags: Tag[]
  doctor_tags: DoctorTag[]
  visits: Visit[]
  satisfactions: Satisfaction[]
  attachments: Attachment[]
  seq: Record<string, number>
}

// ---- Storage helpers ----

const DATA_DIR = process.env.VERCEL
  ? '/tmp/medme-data'
  : (process.env.DATA_DIR || './data')
const DATA_FILE = path.join(DATA_DIR, 'medme.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function loadStore(): DataStore {
  ensureDir()
  if (fs.existsSync(DATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    } catch {
      // corrupt file — reinitialize
    }
  }
  return createInitialStore()
}

function saveStore(store: DataStore) {
  ensureDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

function allocId(store: DataStore, collection: string): number {
  store.seq[collection] = (store.seq[collection] || 0) + 1
  return store.seq[collection]
}

function nowStr(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function createInitialStore(): DataStore {
  const store: DataStore = {
    users: [],
    doctors: [],
    tags: [],
    doctor_tags: [],
    visits: [],
    satisfactions: [],
    attachments: [],
    seq: {},
  }

  const hash = bcrypt.hashSync('admin123', 10)
  store.users.push({
    id: allocId(store, 'users'),
    username: 'admin',
    password_hash: hash,
    display_name: '系統管理員',
    role: 'admin',
    created_at: nowStr(),
    updated_at: nowStr(),
  })

  const defaultTags = [
    { name: 'VIP', color: '#d32f2f' },
    { name: '重點客戶', color: '#f57c00' },
    { name: '待開發', color: '#388e3c' },
    { name: '需追蹤', color: '#7b1fa2' },
    { name: '新客戶', color: '#0288d1' },
  ]
  for (const t of defaultTags) {
    store.tags.push({
      id: allocId(store, 'tags'),
      name: t.name,
      color: t.color,
      created_at: nowStr(),
    })
  }

  saveStore(store)
  return store
}

// ---- JsonDb class ----

class JsonDb {
  private store: DataStore

  constructor() {
    this.store = loadStore()
  }

  private save() {
    saveStore(this.store)
  }

  private nextId(collection: string): number {
    return allocId(this.store, collection)
  }

  // ---- Users ----

  getUserByUsername(username: string): User | null {
    return this.store.users.find(u => u.username === username) ?? null
  }

  getUserById(id: number): User | null {
    return this.store.users.find(u => u.id === id) ?? null
  }

  getAllUsers(): User[] {
    return [...this.store.users].sort((a, b) =>
      b.created_at.localeCompare(a.created_at)
    )
  }

  createUser(data: {
    username: string
    password_hash: string
    display_name: string
    role: 'admin' | 'member'
  }): User {
    const user: User = {
      id: this.nextId('users'),
      ...data,
      created_at: nowStr(),
      updated_at: nowStr(),
    }
    this.store.users.push(user)
    this.save()
    return user
  }

  updateUser(
    id: number,
    data: { display_name?: string; role?: 'admin' | 'member'; password_hash?: string }
  ): User | null {
    const user = this.store.users.find(u => u.id === id)
    if (!user) return null
    Object.assign(user, data, { updated_at: nowStr() })
    this.save()
    return user
  }

  deleteUser(id: number): boolean {
    const idx = this.store.users.findIndex(u => u.id === id)
    if (idx === -1) return false
    this.store.users.splice(idx, 1)
    this.save()
    return true
  }

  // ---- Tags ----

  getAllTagsWithCount(): (Tag & { doctor_count: number })[] {
    return this.store.tags
      .map(t => ({
        ...t,
        doctor_count: this.store.doctor_tags.filter(dt => dt.tag_id === t.id).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  getTagByName(name: string): Tag | null {
    return this.store.tags.find(t => t.name === name) ?? null
  }

  getTagsForDoctor(doctorId: number): Tag[] {
    const tagIds = this.store.doctor_tags
      .filter(dt => dt.doctor_id === doctorId)
      .map(dt => dt.tag_id)
    return this.store.tags.filter(t => tagIds.includes(t.id))
  }

  createTag(name: string, color: string): Tag {
    const tag: Tag = {
      id: this.nextId('tags'),
      name,
      color,
      created_at: nowStr(),
    }
    this.store.tags.push(tag)
    this.save()
    return tag
  }

  deleteTag(id: number): boolean {
    const idx = this.store.tags.findIndex(t => t.id === id)
    if (idx === -1) return false
    this.store.tags.splice(idx, 1)
    this.store.doctor_tags = this.store.doctor_tags.filter(dt => dt.tag_id !== id)
    this.save()
    return true
  }

  setDoctorTags(doctorId: number, tagIds: number[]) {
    this.store.doctor_tags = this.store.doctor_tags.filter(
      dt => dt.doctor_id !== doctorId
    )
    for (const tagId of tagIds) {
      if (this.store.tags.some(t => t.id === tagId)) {
        this.store.doctor_tags.push({ doctor_id: doctorId, tag_id: tagId })
      }
    }
    this.save()
  }

  // ---- Doctors ----

  findDoctor(id: number): Doctor | null {
    return this.store.doctors.find(d => d.id === id) ?? null
  }

  getDoctors(filters: {
    search?: string
    specialty?: string
    hospital?: string
    tag_id?: number
    sort?: string
    page?: number
    limit?: number
  }): { doctors: any[]; total: number } {
    const {
      search = '',
      specialty = '',
      hospital = '',
      tag_id,
      sort = 'updated_at',
      page = 1,
      limit = 20,
    } = filters

    let docs = [...this.store.doctors]

    if (search) {
      const s = search.toLowerCase()
      docs = docs.filter(
        d =>
          d.name.toLowerCase().includes(s) ||
          (d.hospital ?? '').toLowerCase().includes(s) ||
          (d.specialty ?? '').toLowerCase().includes(s)
      )
    }
    if (specialty) {
      docs = docs.filter(d => d.specialty === specialty)
    }
    if (hospital) {
      const h = hospital.toLowerCase()
      docs = docs.filter(d => (d.hospital ?? '').toLowerCase().includes(h))
    }
    if (tag_id) {
      const taggedIds = new Set(
        this.store.doctor_tags
          .filter(dt => dt.tag_id === tag_id)
          .map(dt => dt.doctor_id)
      )
      docs = docs.filter(d => taggedIds.has(d.id))
    }

    // Enrich with visit stats
    const enriched = docs.map(d => {
      const visits = this.store.visits.filter(v => v.doctor_id === d.id)
      const last_visit_date =
        visits.length > 0
          ? visits.map(v => v.visit_date).sort().at(-1)!
          : null
      return { ...d, last_visit_date, visit_count: visits.length }
    })

    // Sort
    if (sort === 'last_visit') {
      enriched.sort((a, b) => {
        if (!a.last_visit_date && !b.last_visit_date) return 0
        if (!a.last_visit_date) return 1
        if (!b.last_visit_date) return -1
        return b.last_visit_date.localeCompare(a.last_visit_date)
      })
    } else {
      enriched.sort((a: any, b: any) =>
        (b[sort] ?? '').localeCompare(a[sort] ?? '')
      )
    }

    const total = enriched.length
    const offset = (page - 1) * limit
    const paginated = enriched.slice(offset, offset + limit)

    for (const doc of paginated) {
      doc.tags = this.getTagsForDoctor(doc.id)
    }

    return { doctors: paginated, total }
  }

  getDoctorById(id: number): any | null {
    const doctor = this.store.doctors.find(d => d.id === id)
    if (!doctor) return null

    const visits = this.store.visits.filter(v => v.doctor_id === id)
    const last_visit_date =
      visits.length > 0 ? visits.map(v => v.visit_date).sort().at(-1)! : null

    return {
      ...doctor,
      last_visit_date,
      visit_count: visits.length,
      tags: this.getTagsForDoctor(id),
      satisfactions: this.getSatisfactionsForDoctor(id, 10),
    }
  }

  getDoctorWithTags(id: number): any | null {
    const doctor = this.store.doctors.find(d => d.id === id)
    if (!doctor) return null
    return { ...doctor, tags: this.getTagsForDoctor(id) }
  }

  createDoctor(data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Doctor {
    const doctor: Doctor = {
      id: this.nextId('doctors'),
      ...data,
      created_at: nowStr(),
      updated_at: nowStr(),
    }
    this.store.doctors.push(doctor)
    this.save()
    return doctor
  }

  updateDoctor(
    id: number,
    data: Partial<Omit<Doctor, 'id' | 'created_at'>>
  ): Doctor | null {
    const doctor = this.store.doctors.find(d => d.id === id)
    if (!doctor) return null
    Object.assign(doctor, data, { updated_at: nowStr() })
    this.save()
    return doctor
  }

  touchDoctorUpdatedAt(id: number) {
    const doctor = this.store.doctors.find(d => d.id === id)
    if (doctor) {
      doctor.updated_at = nowStr()
      this.save()
    }
  }

  deleteDoctor(id: number): boolean {
    const idx = this.store.doctors.findIndex(d => d.id === id)
    if (idx === -1) return false
    this.store.doctors.splice(idx, 1)
    this.store.doctor_tags = this.store.doctor_tags.filter(
      dt => dt.doctor_id !== id
    )
    const visitIds = this.store.visits
      .filter(v => v.doctor_id === id)
      .map(v => v.id)
    this.store.visits = this.store.visits.filter(v => v.doctor_id !== id)
    this.store.satisfactions = this.store.satisfactions.filter(
      s => s.doctor_id !== id
    )
    this.store.attachments = this.store.attachments.filter(
      a => !visitIds.includes(a.visit_id)
    )
    this.save()
    return true
  }

  // ---- Visits ----

  findVisit(id: number): Visit | null {
    return this.store.visits.find(v => v.id === id) ?? null
  }

  getVisits(filters: {
    doctor_id?: number
    page?: number
    limit?: number
  }): { visits: any[]; total: number } {
    const { doctor_id, page = 1, limit = 20 } = filters

    let visits = [...this.store.visits]
    if (doctor_id) {
      visits = visits.filter(v => v.doctor_id === doctor_id)
    }

    visits.sort((a, b) => {
      if (b.visit_date !== a.visit_date)
        return b.visit_date.localeCompare(a.visit_date)
      return b.created_at.localeCompare(a.created_at)
    })

    const total = visits.length
    const offset = (page - 1) * limit
    const paginated = visits.slice(offset, offset + limit)

    const enriched = paginated.map(v => {
      const user = this.store.users.find(u => u.id === v.user_id)
      const doctor = this.store.doctors.find(d => d.id === v.doctor_id)
      return {
        ...v,
        user_name: user?.display_name ?? null,
        doctor_name: doctor?.name ?? null,
        attachments: this.store.attachments.filter(a => a.visit_id === v.id),
        satisfactions: this.getSatisfactionsForVisit(v.id),
      }
    })

    return { visits: enriched, total }
  }

  getVisitWithMeta(id: number): any | null {
    const visit = this.store.visits.find(v => v.id === id)
    if (!visit) return null
    const user = this.store.users.find(u => u.id === visit.user_id)
    return { ...visit, user_name: user?.display_name ?? null }
  }

  createVisit(data: Omit<Visit, 'id' | 'created_at' | 'updated_at'>): Visit {
    const visit: Visit = {
      id: this.nextId('visits'),
      ...data,
      created_at: nowStr(),
      updated_at: nowStr(),
    }
    this.store.visits.push(visit)
    this.save()
    return visit
  }

  updateVisit(
    id: number,
    data: {
      visit_date: string
      content: string
      next_followup: string | null
      next_followup_date: string | null
    }
  ): any | null {
    const visit = this.store.visits.find(v => v.id === id)
    if (!visit) return null
    Object.assign(visit, data, { updated_at: nowStr() })
    this.save()
    const user = this.store.users.find(u => u.id === visit.user_id)
    return { ...visit, user_name: user?.display_name ?? null }
  }

  deleteVisit(id: number): boolean {
    const idx = this.store.visits.findIndex(v => v.id === id)
    if (idx === -1) return false
    this.store.visits.splice(idx, 1)
    this.store.satisfactions = this.store.satisfactions.filter(
      s => s.visit_id !== id
    )
    this.store.attachments = this.store.attachments.filter(
      a => a.visit_id !== id
    )
    this.save()
    return true
  }

  // ---- Satisfactions ----

  getSatisfactionsForDoctor(doctorId: number, limit = 10): any[] {
    return this.store.satisfactions
      .filter(s => s.doctor_id === doctorId)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
      .slice(0, limit)
      .map(s => {
        const user = this.store.users.find(u => u.id === s.recorded_by)
        return { ...s, recorder_name: user?.display_name ?? null }
      })
  }

  getSatisfactionsForVisit(visitId: number): any[] {
    return this.store.satisfactions
      .filter(s => s.visit_id === visitId)
      .map(s => {
        const user = this.store.users.find(u => u.id === s.recorded_by)
        return { ...s, recorder_name: user?.display_name ?? null }
      })
  }

  createSatisfaction(
    data: Omit<Satisfaction, 'id' | 'recorded_at'>
  ): Satisfaction {
    const sat: Satisfaction = {
      id: this.nextId('satisfactions'),
      ...data,
      recorded_at: nowStr(),
    }
    this.store.satisfactions.push(sat)
    this.save()
    return sat
  }

  // ---- Attachments ----

  createAttachment(data: Omit<Attachment, 'id' | 'uploaded_at'>): Attachment {
    const att: Attachment = {
      id: this.nextId('attachments'),
      ...data,
      uploaded_at: nowStr(),
    }
    this.store.attachments.push(att)
    this.save()
    return att
  }

  // ---- Dashboard ----

  getDashboardStats(): {
    total_doctors: number
    weekly_visits: number
    pending_followups: number
    recent_activities: any[]
  } {
    const total_doctors = this.store.doctors.length

    const sevenDaysAgo = dateOffset(-7)
    const weekly_visits = this.store.visits.filter(
      v => v.visit_date >= sevenDaysAgo
    ).length

    const today = todayStr()
    const fourteenDaysFromNow = dateOffset(14)
    const pending_followups = this.store.visits.filter(
      v =>
        v.next_followup_date != null &&
        v.next_followup_date >= today &&
        v.next_followup_date <= fourteenDaysFromNow
    ).length

    const recent_activities = [...this.store.visits]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 15)
      .map(v => {
        const doctor = this.store.doctors.find(d => d.id === v.doctor_id)
        const user = this.store.users.find(u => u.id === v.user_id)
        return {
          type: 'visit',
          id: v.id,
          doctor_id: v.doctor_id,
          doctor_name: doctor?.name ?? null,
          content: v.content,
          user_name: user?.display_name ?? '未知',
          created_at: v.created_at,
        }
      })

    return { total_doctors, weekly_visits, pending_followups, recent_activities }
  }
}

// ---- Singleton ----

let _db: JsonDb | null = null

export function getDb(): JsonDb {
  if (!_db) {
    _db = new JsonDb()
  }
  return _db
}

export default getDb
