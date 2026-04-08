'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, MessageSquare, Building2, Stethoscope, Edit,
  Trash2, Plus, Calendar, Loader2
} from 'lucide-react'
import Header from '@/components/layout/Header'
import Tag from '@/components/ui/Tag'
import Badge from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import VisitTimeline from '@/components/visits/VisitTimeline'
import Modal from '@/components/ui/Modal'
import VisitForm from '@/components/visits/VisitForm'
import { useAuth } from '@/contexts/AuthContext'
import type { Doctor, Visit } from '@/types'

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [showVisitModal, setShowVisitModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function fetchDoctor() {
    const res = await fetch(`/api/doctors/${params.id}`)
    if (!res.ok) { router.push('/doctors'); return }
    const data = await res.json()
    setDoctor(data.doctor)
  }

  async function fetchVisits() {
    const res = await fetch(`/api/visits?doctor_id=${params.id}&limit=50`)
    const data = await res.json()
    setVisits(data.visits || [])
  }

  useEffect(() => {
    Promise.all([fetchDoctor(), fetchVisits()]).finally(() => setLoading(false))
  }, [params.id])

  async function handleAddVisit(data: any) {
    setSaving(true)
    const res = await fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setShowVisitModal(false)
      await fetchVisits()
      await fetchDoctor()
    }
    setSaving(false)
  }

  async function handleDelete() {
    const res = await fetch(`/api/doctors/${params.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/doctors')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
      </div>
    )
  }

  if (!doctor) return null

  const avgRating = doctor.satisfactions && doctor.satisfactions.length > 0
    ? doctor.satisfactions.reduce((sum, s) => sum + s.rating, 0) / doctor.satisfactions.length
    : null

  return (
    <div>
      {/* Back */}
      <Link href="/doctors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        返回醫師列表
      </Link>

      <Header
        title={`${doctor.name}${doctor.title ? ` ${doctor.title}` : ''}`}
        subtitle={[doctor.specialty, doctor.hospital].filter(Boolean).join(' · ')}
        actions={
          <div className="flex gap-2">
            <Link href={`/doctors/${doctor.id}/edit`} className="btn-secondary">
              <Edit className="w-4 h-4" />
              編輯
            </Link>
            {user?.role === 'admin' && (
              <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-4 h-4" />
                刪除
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Doctor Info */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">聯絡方式</h3>
            <div className="space-y-3">
              {doctor.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${doctor.phone}`} className="text-primary-700 hover:underline">{doctor.phone}</a>
                </div>
              )}
              {doctor.line_id && (
                <div className="flex items-center gap-3 text-sm">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{doctor.line_id}</span>
                </div>
              )}
              {doctor.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${doctor.email}`} className="text-primary-700 hover:underline truncate">{doctor.email}</a>
                </div>
              )}
              {!doctor.phone && !doctor.line_id && !doctor.email && (
                <p className="text-sm text-gray-400">尚未填寫聯絡方式</p>
              )}
            </div>
          </div>

          {/* Tags */}
          {doctor.tags && doctor.tags.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">標籤</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.tags.map((tag) => <Tag key={tag.id} tag={tag} />)}
              </div>
            </div>
          )}

          {/* Clinical Prefs */}
          {(doctor.surgical_preferences || doctor.common_devices || doctor.consultation_habits) && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">臨床偏好</h3>
              <div className="space-y-3 text-sm">
                {doctor.surgical_preferences && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">手術偏好</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{doctor.surgical_preferences}</p>
                  </div>
                )}
                {doctor.common_devices && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">常用醫材</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{doctor.common_devices}</p>
                  </div>
                )}
                {doctor.consultation_habits && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">看診習慣</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{doctor.consultation_habits}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Satisfaction summary */}
          {doctor.satisfactions && doctor.satisfactions.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">滿意度摘要</h3>
              {avgRating !== null && (
                <div className="flex items-center gap-2 mb-3">
                  <StarRating value={Math.round(avgRating)} readonly />
                  <span className="text-sm text-gray-500">{avgRating.toFixed(1)} / 5.0</span>
                </div>
              )}
              <div className="space-y-2">
                {doctor.satisfactions.slice(0, 5).map((sat) => (
                  <div key={sat.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{sat.service_type}</span>
                    <StarRating value={sat.rating} readonly size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {doctor.notes && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">備註</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{doctor.notes}</p>
            </div>
          )}
        </div>

        {/* Right: Visit Timeline */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-800">
                拜訪紀錄
                <span className="ml-2 text-sm font-normal text-gray-400">({visits.length} 筆)</span>
              </h3>
              <button className="btn-primary text-sm" onClick={() => setShowVisitModal(true)}>
                <Plus className="w-4 h-4" />
                新增拜訪紀錄
              </button>
            </div>
            <VisitTimeline visits={visits} />
          </div>
        </div>
      </div>

      {/* Visit Modal */}
      <Modal open={showVisitModal} onClose={() => setShowVisitModal(false)} title="新增拜訪紀錄" size="lg">
        <VisitForm
          doctorId={doctor.id}
          onSubmit={handleAddVisit}
          onCancel={() => setShowVisitModal(false)}
          loading={saving}
        />
      </Modal>

      {/* Confirm Delete */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="確認刪除" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          確定要刪除「{doctor.name}」的所有資料嗎？此操作無法復原，包含所有拜訪紀錄都會一起刪除。
        </p>
        <div className="flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>取消</button>
          <button className="btn-danger" onClick={handleDelete}>確認刪除</button>
        </div>
      </Modal>
    </div>
  )
}
