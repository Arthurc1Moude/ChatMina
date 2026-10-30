import { Plus } from 'lucide-react'
import type { Conversation } from '../lib/types'
import { cn } from '../lib/utils'
import Logo from './Logo'
import ConversationItem from './ConversationItem'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  collapsed: boolean
  onNew: () => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function Sidebar({
  conversations,
  activeId,
  collapsed,
  onNew,
  onSelect,
  onDelete,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col overflow-hidden border-line bg-sidebar transition-all duration-300 ease-out',
        collapsed
          ? 'w-0 border-r-0 max-md:-translate-x-full'
          : 'w-[284px] border-r max-md:fixed max-md:z-40 max-md:shadow-menu',
      )}
    >
      <div className="flex w-[284px] h-full flex-col">
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div className="leading-tight">
              <p className="text-[15px] font-700 tracking-tight text-ink">ChatMina</p>
              <p className="text-[11px] font-500 text-ink-faint">Conversational interface</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13.5px] font-600 text-ink transition-all hover:bg-hover"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col px-3 pb-3">
          <p className="px-2 pb-2 text-[11px] font-600 uppercase tracking-[0.08em] text-ink-faint">
            Recent
          </p>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
            {conversations.length === 0 ? (
              <p className="px-2 py-6 text-center text-[12.5px] leading-5 text-ink-faint">
                No conversations yet.
                <br />
                Start a new chat to begin.
              </p>
            ) : (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
