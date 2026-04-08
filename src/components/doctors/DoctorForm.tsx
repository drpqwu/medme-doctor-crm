'use client'

import { useState, useEffect } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import Tag from '@/components/ui/Tag'
import type { Doctor, Tag as TagType } from '@/types'

interface DoctorFormProps {
  initial?: Partial<Doctor>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function DoctorForm({ initial, onSubmit, onCancel, loading }: DoctorFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    specialty: initial?.specialty || '',
    hospital: initial?.hospital || '',
    title: initial?.title || '',
    phone: initial?.phone || '',
    line_id: initial?.line_id || '',
    email: initial?.email || '',
    surgical_preferences: initial?.surgical_preferences || '',
    common_devices: initial?.common_devices || '',
    consultation_habits: initial?.consultation_habits || '',
    notes: initial?.notes || '',
  })
  const [allTags, setAllTags] = useState<TagType[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(
    initial?.tags?.map((t) => t.id) || []
  )
  const [newTagName, setNewTagName] = useState('')
  const [tagLoading, setTagLoading] = useState(false)

  useEffect(() => {
    fetch('/api/tags').then((r) => r.json()).then((d) => setAllTags(d.tags || []))
  }, [])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleTag(id: number) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function createTag() {
    if (!newTagName.trim()) return
    setTagLoading(true)
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName.trim() }),
    })
    const data = await res.json()
    if (data.tag) {
      setAllTags((prev) => [...prev, data.tag])
      setSelectedTagIds((prev) => [...prev, data.tag.id])
      setNewTagName('')
    }
    setTagLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({ ...form, tag_ids: selectedTagIds })
  }

  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id))
  const unselectedTags = allTags.filter((t) => !selectedTagIds.includes(t.id))

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">基本資料</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">姓名 *</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="王大明" required />
          </div>
          <div>
            <label className="label">科別</label>
            <input className="input" value={form.specialty} onChange={(e) => set('specialty', e.target.value)} placeholder="骨科" />
          </div>
          <div>
            <label className="label">職稱</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="主治醫師" />
          </div>
          <div className="col-span-2">
            <label className="label">醫院 / 診所</label>
            <input className="input" value={form.hospital} onChange={(e) => set('hospital', e.target.value)} placeholder="台大醫院" />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">聯絡方式</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">電話</label>
            <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0912-345-678" />
          </div>
          <div>
            <label className="label">LINE ID</label>
            <input className="input" value={form.line_id} onChange={(e) => set('line_id', e.target.value)} placeholder="doctor_wang" />
          </div>
          <div className="col-span-2">
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="doctor@hospital.com" />
          </div>
        </div>
      </div>

      {/* Clinical Preferences */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">臨床偏好</h3>
        <div className="space-y-3">
          <div>
            <label className="label">手術偏好</label>
            <textarea className="input resize-none" rows={2} value={form.surgical_preferences} onChange={(e) => set('surgical_preferences', e.target.value)} placeholder="偏好微創手術..." />
          </div>
          <div>
            <label className="label">常用醫材</label>
            <textarea className="input resize-none" rows={2} value={form.common_devices} onChange={(e) => set('common_devices', e.target.value)} placeholder="常用螺釘型號..." />
          </div>
          <div>
            <label className="label">看診習慣</label>
            <textarea className="input resize-none" rows={2} value={form.consultation_habits} onChange={(e) => set('consultation_habits', e.target.value)} placeholder="周一、三、五門診..." />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b">標籤</h3>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <Tag key={tag.id} tag={tag} onRemove={() => toggleTag(tag.id)} />
            ))}
          </div>
        )}
        {unselectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {unselectedTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                + {tag.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="新增標籤..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createTag() } }}
          />
          <button
            type="button"
            onClick={createTag}
            disabled={tagLoading || !newTagName.trim()}
            className="btn-secondary px-3"
          >
            {tagLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">備註</label>
        <textarea className="input resize-none" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="其他備註..." />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">取消</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? '儲存中...' : '儲存'}
        </button>
      </div>
    </form>
  )
}
