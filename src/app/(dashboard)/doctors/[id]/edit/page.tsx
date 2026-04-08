'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import DoctorForm from '@/components/doctors/DoctorForm'
import type { Doctor } from '@/types'

export default function EditDoctorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/doctors/${params.id}`)
      .then((r) => r.json())
      .then((d) => setDoctor(d.doctor || null))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(data: any) {
    setSaving(true)
    setError('')
    const res = await fetch(`/api/doctors/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      router.push(`/doctors/${params.id}`)
    } else {
      const d = await res.json()
      setError(d.error || '儲存失敗')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-700 animate-spin" />
      </div>
    )
  }

  if (!doctor) {
    return <p className="text-gray-500">找不到此醫師</p>
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/doctors/${params.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        返回醫師頁面
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">編輯醫師資料</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="card">
        <DoctorForm
          initial={doctor}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/doctors/${params.id}`)}
          loading={saving}
        />
      </div>
    </div>
  )
}
