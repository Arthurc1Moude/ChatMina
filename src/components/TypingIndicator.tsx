export default function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1.5" role="status" aria-label="Model is writing">
      <span className="h-2 w-2 rounded-full bg-brand animate-dot-pulse" />
      <span className="h-2 w-2 rounded-full bg-brand animate-dot-pulse [animation-delay:0.18s]" />
      <span className="h-2 w-2 rounded-full bg-brand animate-dot-pulse [animation-delay:0.36s]" />
    </span>
  )
}
