import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'
import type { RecentActivity } from '@/types'

interface ActivityFeedProps {
  activities: RecentActivity[]
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">尚無活動紀錄</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Link key={`${activity.type}-${activity.id}`} href={`/doctors/${activity.doctor_id}`}>
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 text-primary-700 text-sm font-semibold">
              {activity.doctor_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {activity.doctor_name}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDistanceToNow(new Date(activity.created_at), { locale: zhTW, addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                <span className="text-primary-700">{activity.user_name}</span>
                {' '}新增拜訪紀錄：{activity.content}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
