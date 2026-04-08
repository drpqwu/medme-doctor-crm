'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, X, CalendarDays } from 'lucide-react'
import Header from '@/components/layout/Header'
import VisitTimeline from '@/components/visits/VisitTimeline'
import type { Visit } from '@/types'

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    const res = await fetch(`/api/visits?${params}`)
    const data = await res.json()
    setVisits(data.visits || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page])

  useEffect(() => { fetchVisits() }, [fetchVisits])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <Header
        title="所有拜訪紀錄"
        subtitle={`共 ${total} 筆紀錄`}
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="card">
          <VisitTimeline visits={visits} showDoctor />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>上一頁</button>
          <span className="flex items-center px-4 text-sm text-gray-600">{page} / {totalPages}</span>
          <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一頁</button>
        </div>
      )}
    </div>
  )
}
