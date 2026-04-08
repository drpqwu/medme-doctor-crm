'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import StarRating from '@/components/ui/StarRating'

interface SatisfactionItem {
  service_type: string
  rating: number
  issue_items: string
  reason: string
}

interface VisitFormProps {
  doctorId: number
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const SERVICE_TYPES = ['產品品質', '技術支援', '配送服務', '客服響應', '培訓教育', '其他']

export default function VisitForm({ doctorId, onSubmit, onCancel, loading }: VisitFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [visitDate, setVisitDate] = useState(today)
  const [content, setContent] = useState('')
  const [nextFollowup, setNextFollowup] = useState('')
  const [nextFollowupDate, setNextFollowupDate] = useState('')
  const [satisfactions, setSatisfactions] = useState<SatisfactionItem[]>([])

  function addSatisfaction() {
    setSatisfactions((prev) => [
      ...prev,
      { service_type: SERVICE_TYPES[0], rating: 5, issue_items: '', reason: '' },
    ])
  }

  function removeSatisfaction(idx: number) {
    setSatisfactions((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateSatisfaction(idx: number, key: keyof SatisfactionItem, value: any) {
    setSatisfactions((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      doctor_id: doctorId,
      visit_date: visitDate,
      content,
      next_followup: nextFollowup || null,
      next_followup_date: nextFollowupDate || null,
      satisfactions,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="label">拜訪日期 *</label>
          <input className="input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="label">拜訪內容 *</label>
        <textarea
          className="input resize-none"
          rows={4}
          placeholder="記錄本次拜訪的內容、討論事項、醫師反應..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">下次跟進事項</label>
          <input className="input" placeholder="需要提供的資料、後續追蹤事項..." value={nextFollowup} onChange={(e) => setNextFollowup(e.target.value)} />
        </div>
        <div>
          <label className="label">跟進日期</label>
          <input className="input" type="date" value={nextFollowupDate} onChange={(e) => setNextFollowupDate(e.target.value)} />
        </div>
      </div>

      {/* Satisfaction */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">服務滿意度（選填）</h3>
          <button type="button" onClick={addSatisfaction} className="btn-secondary text-xs py-1.5">
            <Plus className="w-3.5 h-3.5" />
            新增評分
          </button>
        </div>

        <div className="space-y-3">
          {satisfactions.map((sat, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <select
                  className="input w-auto text-sm"
                  value={sat.service_type}
                  onChange={(e) => updateSatisfaction(idx, 'service_type', e.target.value)}
                >
                  {SERVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <StarRating value={sat.rating} onChange={(v) => updateSatisfaction(idx, 'rating', v)} />
                  <button type="button" onClick={() => removeSatisfaction(idx)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {sat.rating < 4 && (
                <>
                  <div>
                    <label className="label text-xs">不滿意項目</label>
                    <input className="input text-sm" placeholder="具體問題..." value={sat.issue_items} onChange={(e) => updateSatisfaction(idx, 'issue_items', e.target.value)} />
                  </div>
                  <div>
                    <label className="label text-xs">原因說明</label>
                    <textarea className="input text-sm resize-none" rows={2} placeholder="詳細說明..." value={sat.reason} onChange={(e) => updateSatisfaction(idx, 'reason', e.target.value)} />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <button type="button" onClick={onCancel} className="btn-secondary">取消</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? '儲存中...' : '新增紀錄'}
        </button>
      </div>
    </form>
  )
}
