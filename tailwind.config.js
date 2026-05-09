/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          0: '#07080A',
          1: '#0D0F14',
          2: '#14171F',
          3: '#1C2029',
        },
        pulse: {
          400: '#22D1EE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        signal: {
          400: '#A78BFA',
          500: '#8B5CF6',
        },
        gain: '#34D399',
        loss: '#F87171',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
