/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral, bright, white-first surfaces
        canvas: '#ffffff',
        sidebar: '#f7f8f8',
        surface: '#f3f5f6',
        hover: '#eceef0',
        line: {
          DEFAULT: '#e6e9ec',
          strong: '#d6dade',
        },
        ink: {
          DEFAULT: '#16181c',
          soft: '#3d434b',
          muted: '#6b7280',
          faint: '#9aa1ab',
        },
        // Single restrained brand accent: deep, formal teal
        brand: {
          DEFAULT: '#0e7a6e',
          strong: '#0a6359',
          soft: '#e6f3f0',
          tint: '#f0f8f6',
          text: '#0b6a60',
        },
        danger: '#bb3a36',
      },
      fontFamily: {
        sans: ['Onest', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontWeight: {
        500: '500',
        600: '600',
        700: '700',
      },
      borderRadius: {
        xs: '10px',
        sm: '14px',
        md: '18px',
        lg: '22px',
        xl: '28px',
        '2xl': '32px',
        '3xl': '38px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 18, 20, 0.04), 0 8px 24px rgba(16, 18, 20, 0.06)',
        menu: '0 4px 16px rgba(16, 18, 20, 0.08), 0 24px 48px rgba(16, 18, 20, 0.10)',
        pop: '0 2px 8px rgba(16, 18, 20, 0.06), 0 16px 40px rgba(16, 18, 20, 0.12)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dot-pulse': {
          '0%, 80%, 100%': { opacity: '0.25', transform: 'scale(0.85)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.28s ease-out both',
        'dot-pulse': 'dot-pulse 1.1s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}
