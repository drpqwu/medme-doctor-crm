'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Shield, User, Loader2 } from 'lucide-react'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import type { User as UserType } from '@/types'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

interface UserForm {
  username: string
  display_name: string
  role: 'admin' | 'member'
  password: string
}

const EMPTY_FORM: UserForm = { username: '', display_name: '', role: 'member', password: '' }

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<UserType | null>(null)
  const [form, setForm] = useState<UserForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function fetchUsers() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  function openCreate() {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function openEdit(u: UserType) {
    setEditUser(u)
    setForm({ username: u.username, display_name: u.display_name, role: u.role, password: '' })
    setError('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users'
    const method = editUser ? 'PUT' : 'POST'

    const body = editUser
      ? { display_name: form.display_name, role: form.role, ...(form.password ? { password: form.password } : {}) }
      : form

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || '操作失敗')
    } else {
      setShowModal(false)
      fetchUsers()
    }
    setSaving(false)
  }

  async function handleDelete(u: UserType) {
    if (!confirm(`確定要刪除「${u.display_name}」的帳號嗎？`)) return
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
    if (res.ok) fetchUsers()
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-20 text-gray-400">
        <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg">權限不足</p>
        <p className="text-sm mt-1">此頁面僅限管理員存取</p>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="系統管理"
        subtitle="管理使用者帳號與權限"
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            新增使用者
          </button>
        }
      />

      <div className="card">
        <h2 className="text-base font-semibold text-gray-800 mb-4">使用者列表</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-700" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">使用者</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">帳號</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">角色</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">建立時間</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-semibold">
                          {u.display_name[0]}
                        </div>
                        <span className="font-medium text-gray-800">{u.display_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{u.username}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'admin' ? 'primary' : 'default'}>
                        {u.role === 'admin' ? '管理員' : '一般同仁'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {format(new Date(u.created_at), 'yyyy/MM/dd', { locale: zhTW })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="btn-ghost py-1.5 px-2">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button onClick={() => handleDelete(u)} className="btn-ghost py-1.5 px-2 text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? '編輯使用者' : '新增使用者'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          {!editUser && (
            <div>
              <label className="label">帳號 *</label>
              <input
                className="input"
                placeholder="login_name"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="label">顯示名稱 *</label>
            <input
              className="input"
              placeholder="王小明"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">角色 *</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'member' })}
            >
              <option value="member">一般同仁</option>
              <option value="admin">管理員</option>
            </select>
          </div>
          <div>
            <label className="label">{editUser ? '新密碼（留空不修改）' : '密碼 *'}</label>
            <input
              className="input"
              type="password"
              placeholder="至少 6 個字元"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!editUser}
              minLength={editUser ? 0 : 6}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">取消</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
