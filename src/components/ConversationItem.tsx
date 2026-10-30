import { MessageSquare, Trash2 } from 'lucide-react'
import type { Conversation } from '../lib/types'
import { cn, formatRelativeTime } from '../lib/utils'

interface ConversationItemProps {
  conversation: Conversation
  active: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function ConversationItem({
  conversation,
  active,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center rounded-xl transition-colors',
        active ? 'bg-brand-soft' : 'hover:bg-hover',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left"
      >
        <MessageSquare
          className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'text-ink-faint')}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-[13.5px]',
              active ? 'font-600 text-brand-text' : 'font-500 text-ink-soft',
            )}
          >
            {conversation.title}
          </span>
          <span className="mt-0.5 block text-[11px] text-ink-faint">
            {formatRelativeTime(conversation.updatedAt)}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label="Delete conversation"
        onClick={() => onDelete(conversation.id)}
        className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint opacity-0 transition-all hover:bg-white hover:text-danger focus:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
