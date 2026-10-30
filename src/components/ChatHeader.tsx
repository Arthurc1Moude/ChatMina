import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import ModelPicker from './ModelPicker'

interface ChatHeaderProps {
  modelId: string
  collapsed: boolean
  onModelChange: (id: string) => void
  onToggleSidebar: () => void
}

export default function ChatHeader({
  modelId,
  collapsed,
  onModelChange,
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line bg-canvas px-3 md:px-4">
      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={onToggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-hover"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>
      <ModelPicker modelId={modelId} onChange={onModelChange} disabled={false} />
    </header>
  )
}
