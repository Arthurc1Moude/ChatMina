import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../lib/types'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
}

export default function MessageList({ messages, isStreaming }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[760px] px-5 py-8 md:px-6">
        <div className="space-y-8">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} streaming={isStreaming} />
          ))}
        </div>
      </div>
    </div>
  )
}
