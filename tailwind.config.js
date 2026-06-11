/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#2563eb', // blue-600
          light: '#3b82f6',   // blue-500
          dark: '#60a5fa',    // blue-400 (dark mode)
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        blink: 'blink 1.1s step-end infinite',
        'glow-in': 'glowIn 0.9s ease-out forwards',
        'glow-green': 'glowGreen 1.1s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glowIn: {
          '0%': { textShadow: '0 0 0 rgba(96,165,250,0)' },
          '40%': { textShadow: '0 0 30px rgba(96,165,250,0.95), 0 0 12px rgba(59,130,246,0.7)' },
          '100%': { textShadow: '0 0 16px rgba(96,165,250,0.45)' },
        },
        glowGreen: {
          '0%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
          '35%': { boxShadow: '0 0 26px 5px rgba(16,185,129,0.7)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        },
      },
    },
  },
  plugins: [],
}
