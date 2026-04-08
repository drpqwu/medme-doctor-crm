'use client'

import { useEffect, useState } from 'react'
import { Users, CalendarDays, Bell, TrendingUp } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import Header from '@/components/layout/Header'
import type { DashboardStats } from '@/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (r.status === 401) { window.location.href = '/login'; return null }
        return r.json()
      })
      .then((d) => { if (d) setStats(d) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard title="醫師總數" value={stats?.total_doctors ?? 0} icon={Users} color="blue" subtitle="已建立的醫師資料" />
          <StatsCard title="本週拜訪" value={stats?.weekly_visits ?? 0} icon={CalendarDays} color="green" subtitle="近 7 天拜訪次數" />
          <StatsCard title="待跟進" value={stats?.pending_followups ?? 0} icon={Bell} color="orange" subtitle="未來 14 天內需跟進" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-700" />
            最近活動
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <ActivityFeed activities={stats?.recent_activities ?? []} />
          )}
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-800 mb-4">快速操作提示</h2>
          <div className="space-y-3">
            {[
              { icon: '👨‍⚕️', title: '新增醫師', desc: '前往「醫師管理」→「新增醫師」建立醫師資料' },
              { icon: '📝', title: '記錄拜訪', desc: '點入任何醫師頁面，按「新增拜訪紀錄」記錄互動' },
              { icon: '⭐', title: '評分服務', desc: '拜訪記錄時可同步填寫服務滿意度評分' },
              { icon: '🏷️', title: '使用標籤', desc: '為醫師加上標籤，方便分類和篩選' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
