import type { Config } from 'tailwindcss'

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-dm-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        serif: 'var(--font-dm-serif), ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace',
      },
    },
  },
  plugins: [],
} satisfies Config

export default config
