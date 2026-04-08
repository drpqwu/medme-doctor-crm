import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'purple'
  subtitle?: string
}

const colorMap = {
  blue: { bg: 'bg-primary-50', icon: 'bg-primary-800', text: 'text-primary-800' },
  green: { bg: 'bg-green-50', icon: 'bg-green-600', text: 'text-green-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-700' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-700' },
}

export default function StatsCard({ title, value, icon: Icon, color = 'blue', subtitle }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className={clsx('rounded-xl p-5 flex items-center gap-4', c.bg)}>
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', c.icon)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={clsx('text-3xl font-bold', c.text)}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
