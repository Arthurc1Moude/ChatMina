import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Moon, Crosshair } from 'lucide-react'
import { MODELS } from '../lib/models'
import { cn } from '../lib/utils'

interface ModelPickerProps {
  modelId: string
  onChange: (id: string) => void
  disabled?: boolean
}

function modelIcon(id: string, className: string) {
  return id === 'mina1-luna' ? (
    <Moon className={className} />
  ) : (
    <Crosshair className={className} />
  )
}

export default function ModelPicker({ modelId, onChange, disabled }: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const current = MODELS.find((m) => m.id === modelId) ?? MODELS[0]

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-full px-3.5 py-2 text-[15px] font-600 text-ink transition-colors',
          'hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        {modelIcon(current.id, 'h-4 w-4 text-brand')}
        <span>{current.name}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-ink-faint transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 w-[340px] animate-fade-in rounded-2xl border border-line bg-white p-2 shadow-menu"
        >
          {MODELS.map((model) => {
            const selected = model.id === modelId
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(model.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                  'hover:bg-surface',
                )}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  {modelIcon(model.id, 'h-4 w-4')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[14px] font-600 text-ink">{model.name}</span>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-500 text-ink-muted">
                      {model.tagline}
                    </span>
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-5 text-ink-muted">
                    {model.description}
                  </span>
                </span>
                {selected && <Check className="mt-1 h-4 w-4 shrink-0 text-brand" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
