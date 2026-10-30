import { useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { cn } from '../lib/utils'

interface ComposerProps {
  isStreaming: boolean
  onSend: (text: string) => void
  onStop: () => void
}

const MAX_HEIGHT = 200

export default function Composer({ isStreaming, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function resize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }

  function submit() {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue('')
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (el) el.style.height = 'auto'
    })
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const canSend = value.trim().length > 0 && !isStreaming

  return (
    <div className="mx-auto w-full max-w-[760px] px-5 pb-4 md:px-6 md:pb-5">
      <div
        className={cn(
          'flex items-end gap-2 rounded-3xl bg-white p-2.5 pl-5 transition-shadow',
          'shadow-soft focus-within:shadow-pop',
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message ChatMina…"
          aria-label="Message input"
          className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-ink placeholder:text-ink-faint focus:outline-none"
        />
        {isStreaming ? (
          <button
            type="button"
            aria-label="Stop generating"
            onClick={onStop}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink-soft"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Send message"
            onClick={submit}
            disabled={!canSend}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all',
              canSend
                ? 'bg-brand text-white hover:bg-brand-strong'
                : 'cursor-not-allowed bg-surface text-ink-faint',
            )}
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-[11.5px] text-ink-faint">
        Press Enter to send · Shift + Enter for a new line
      </p>
    </div>
  )
}
