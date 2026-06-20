import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'pp-red':        { DEFAULT: '#dc2626', dark: '#b91c1c', light: '#fef2f2' },
        'pp-dark':       { DEFAULT: '#111827', 2: '#1f2937',   3: '#374151' },
        'pp-gray':       '#6b7280',
        'pp-border':     '#e5e7eb',
        'pp-bg':         '#f3f4f6',
        'pp-green':      { DEFAULT: '#16a34a', light: '#f0fdf4' },
        'pp-gold':       { DEFAULT: '#b45309', light: '#fef3c7' },
        'pp-blue':       { DEFAULT: '#2563eb', light: '#eff6ff' },
        'pp-amber':      { DEFAULT: '#d97706', light: '#fffbeb' },
        'pro-sidebar':   '#7f1d1d',
        'ho-sidebar':    '#14532d',
        're-sidebar':    '#451a03',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
