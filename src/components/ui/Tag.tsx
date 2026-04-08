import { X } from 'lucide-react'
import type { Tag as TagType } from '@/types'

interface TagProps {
  tag: TagType
  onRemove?: () => void
  small?: boolean
}

export default function Tag({ tag, onRemove, small }: TagProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium"
      style={{
        backgroundColor: tag.color + '20',
        color: tag.color,
        padding: small ? '1px 8px' : '2px 10px',
        fontSize: small ? '11px' : '12px',
        border: `1px solid ${tag.color}40`,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-70 ml-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}
