import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  className?: string
}

const variants = {
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-700',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
