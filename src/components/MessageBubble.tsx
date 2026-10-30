import { AlertCircle } from 'lucide-react'
import type { ChatMessage } from '../lib/types'
import Logo from './Logo'
import MarkdownMessage from './MarkdownMessage'
import TypingIndicator from './TypingIndicator'

interface MessageBubbleProps {
  message: ChatMessage
  streaming: boolean
}

export default function MessageBubble({ message, streaming }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-surface px-4 py-3 text-[15px] leading-6 text-ink">
          {message.content}
        </div>
      </div>
    )
  }

  const showTyping = streaming && message.content.length === 0 && !message.error

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <Logo size={32} className="mt-0.5" />
      <div className="min-w-0 flex-1 pt-0.5">
        {showTyping ? (
          <TypingIndicator />
        ) : message.error ? (
          <div className="flex items-start gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-[13.5px] leading-5 text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message.content}</span>
          </div>
        ) : (
          <MarkdownMessage content={message.content} />
        )}
      </div>
    </div>
  )
}
