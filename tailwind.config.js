import colors from 'tailwindcss/colors'

// Base neutral for the whole site. Swap this one line to retune the mood:
//   colors.stone   -> warm grey (calm, soft)
//   colors.slate   -> cold grey (calm, cool/blue)
//   colors.neutral -> true grey (neutral)
//   colors.zinc    -> original (cool, faintly blue)
// Warm grey (stone hue) light surfaces, dimmed so nothing reads as bright white.
// 50-300 are custom toned-down values; 400+ stay stone so text colours
// and dark mode remain untouched.
const grey = {
  ...colors.stone,
  50: '#e8e5e1',  // inputs, brightest inset
  100: '#dedad5', // tiles + cards
  200: '#d0ccc5', // chips, tags, hover fills
  300: '#beb9b1', // page background + soft borders
}

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
        grey,
        // two personalities: blue on warm light grey, dark green accents on jet black
        accent: {
          DEFAULT: '#2563eb', // blue-600 (light mode)
          light: '#3b82f6',   // blue-500 (decorative)
          dark: '#059669',    // emerald-600 (dark mode, deep green, AA on black)
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        blink: 'blink 1.1s step-end infinite',
        'glow-in': 'glowIn 0.9s ease-out forwards',
        'glow-in-green': 'glowInGreen 0.9s ease-out forwards',
        'glow-green': 'glowGreen 1.1s ease-out',
        // directional page transitions for box-mode grid navigation
        'slide-from-right': 'slideFromRight 0.4s ease-out both',
        'slide-from-left': 'slideFromLeft 0.4s ease-out both',
        'slide-from-top': 'slideFromTop 0.4s ease-out both',
        'slide-from-bottom': 'slideFromBottom 0.4s ease-out both',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideFromRight: {
          '0%': { opacity: '0', transform: 'translateX(36px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideFromLeft: {
          '0%': { opacity: '0', transform: 'translateX(-36px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideFromTop: {
          '0%': { opacity: '0', transform: 'translateY(-36px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideFromBottom: {
          '0%': { opacity: '0', transform: 'translateY(36px)' },
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
        glowInGreen: {
          '0%': { textShadow: '0 0 0 rgba(5,150,105,0)' },
          '40%': { textShadow: '0 0 30px rgba(5,150,105,0.95), 0 0 12px rgba(4,120,87,0.7)' },
          '100%': { textShadow: '0 0 16px rgba(5,150,105,0.45)' },
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
