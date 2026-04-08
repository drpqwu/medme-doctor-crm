'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Filter, X, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import DoctorCard from '@/components/doctors/DoctorCard'
import Modal from '@/components/ui/Modal'
import DoctorForm from '@/components/doctors/DoctorForm'
import Tag from '@/components/ui/Tag'
import type { Doctor, Tag as TagType } from '@/types'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTagId, setSelectedTagId] = useState('')
  const [tags, setTags] = useState<TagType[]>([])
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    if (search) params.set('search', search)
    if (selectedTagId) params.set('tag_id', selectedTagId)

    const res = await fetch(`/api/doctors?${params}`)
    const data = await res.json()
    setDoctors(data.doctors || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, selectedTagId, page])

  useEffect(() => { fetchDoctors() }, [fetchDoctors])

  useEffect(() => {
    fetch('/api/tags').then((r) => r.json()).then((d) => setTags(d.tags || []))
  }, [])

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [search, selectedTagId])

  async function handleCreate(data: any) {
    setSaving(true)
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setShowModal(false)
      fetchDoctors()
    }
    setSaving(false)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <Header
        title="醫師管理"
        subtitle={`共 ${total} 位醫師`}
        actions={
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            新增醫師
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="搜尋姓名、科別、醫院..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedTagId('')}
            className={`btn-secondary text-xs py-1.5 ${!selectedTagId ? 'bg-primary-50 border-primary-300 text-primary-700' : ''}`}
          >
            全部
          </button>
          {tags.slice(0, 6).map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(String(tag.id) === selectedTagId ? '' : String(tag.id))}
              className={`btn-secondary text-xs py-1.5 ${String(tag.id) === selectedTagId ? 'ring-2 ring-offset-1' : ''}`}
              style={String(tag.id) === selectedTagId ? { borderColor: tag.color, color: tag.color, ringColor: tag.color } : {}}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">👨‍⚕️</p>
          <p className="text-lg font-medium">尚無醫師資料</p>
          <p className="text-sm mt-1">按右上角「新增醫師」開始建立</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>上一頁</button>
          <span className="flex items-center px-4 text-sm text-gray-600">{page} / {totalPages}</span>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一頁</button>
        </div>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="新增醫師" size="xl">
        <DoctorForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} loading={saving} />
      </Modal>
    </div>
  )
}
