'use client'

import { Star } from 'lucide-react'
import clsx from 'clsx'

interface StarRatingProps {
  value: number
  onChange?: (val: number) => void
  readonly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, readonly, size = 'md' }: StarRatingProps) {
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={clsx(
            'transition-colors',
            readonly ? 'cursor-default' : 'hover:scale-110 cursor-pointer'
          )}
        >
          <Star
            className={clsx(
              sz,
              star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
