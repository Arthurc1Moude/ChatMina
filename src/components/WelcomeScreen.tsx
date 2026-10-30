import { BookOpenText, PenLine, ListChecks, CalendarRange } from 'lucide-react'
import Logo from './Logo'

interface WelcomeScreenProps {
  onSuggestion: (prompt: string) => void
}

const SUGGESTIONS = [
  {
    icon: BookOpenText,
    title: 'Explain how a small language model works in simple terms.',
  },
  {
    icon: PenLine,
    title: 'Write a short, polite introduction for a formal meeting.',
  },
  {
    icon: ListChecks,
    title: 'Summarize the key points of a short article.',
  },
  {
    icon: CalendarRange,
    title: 'Help me plan a focused study schedule for one week.',
  },
]

export default function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col items-center justify-center px-5 py-10 md:px-6">
        <Logo size={52} />
        <h1 className="mt-5 text-center text-[26px] font-700 tracking-tight text-ink md:text-[30px]">
          Welcome to ChatMina
        </h1>
        <p className="mt-2.5 max-w-[520px] text-center text-[14.5px] leading-6 text-ink-muted">
          Select a model and begin a conversation, or start with one of the prompts below.
        </p>

        <div className="mt-9 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => {
            const Icon = suggestion.icon
            return (
              <button
                key={suggestion.title}
                type="button"
                onClick={() => onSuggestion(suggestion.title)}
                className="flex items-start gap-3 rounded-2xl bg-white p-4 text-left transition-all hover:bg-hover"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[13.5px] leading-5 text-ink-soft">{suggestion.title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
