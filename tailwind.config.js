/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        islamic: {
          green: '#10b981',
          dark: '#0f172a',
          light: '#f8fafc'
        }
      },
      fontFamily: {
        'arabic': ['Amiri', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
        'loading-shimmer': 'loading-shimmer 1.5s infinite'
      },
      keyframes: {
        'countdown-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' }
        },
        'loading-shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        }
      }
    },
  },
  plugins: [],
}