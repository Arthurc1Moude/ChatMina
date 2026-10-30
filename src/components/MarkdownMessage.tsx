import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface MarkdownMessageProps {
  content: string
}

function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="prose-mina">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default memo(MarkdownMessage)
