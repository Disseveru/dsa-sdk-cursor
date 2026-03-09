/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#0f0f12',
          elevated: '#16161a',
          muted: '#1c1c21',
        },
        accent: {
          DEFAULT: '#22c55e',
          muted: '#16a34a',
          soft: 'rgba(34, 197, 94, 0.1)',
        },
        border: {
          DEFAULT: '#2a2a2e',
          subtle: '#1f1f23',
        },
      },
    },
  },
  plugins: [],
}
