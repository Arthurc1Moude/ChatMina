import { cn } from '../lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

export default function Logo({ size = 36, className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="18" fill="#0e7a6e" />
        <path
          d="M16 44V20l10 13 6-8 6 8 10-13v24"
          stroke="#ffffff"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
