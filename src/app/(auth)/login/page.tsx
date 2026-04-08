'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登入失敗')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('網路錯誤，請稍後重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-4">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
          <Stethoscope className="w-8 h-8 text-primary-800" />
        </div>
        <h1 className="text-2xl font-bold text-white">醫Me 醫師 CRM</h1>
        <p className="text-primary-200 text-sm mt-1">醫師客戶關係管理系統</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">歡迎登入</h2>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">帳號</label>
            <input
              type="text"
              className="input"
              placeholder="請輸入帳號"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">密碼</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
