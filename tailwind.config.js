import colors from 'tailwindcss/colors'

// Base neutral for the whole site. Swap this one line to retune the mood:
//   colors.stone   -> warm grey (calm, soft)
//   colors.slate   -> cold grey (calm, cool/blue)
//   colors.neutral -> true grey (neutral)
//   colors.zinc    -> original (cool, faintly blue)
// Soft cool-grey surfaces on a pure-white page: tiles/cards lift gently off
// the white background while staying in the cool white+blue palette. 50-300
// are custom light-mode values; 400+ stay stone so text colours and dark
// mode are untouched.
const grey = {
  ...colors.stone,
  50: '#ffffff',  // inputs, brightest inset
  100: '#f4f6f9', // tiles + cards
  200: '#e7ecf3', // chips, tags, hover fills
  300: '#d4dbe5', // soft borders + rings
  // 400/500 are the muted text ramp and are darker than stone's, measured
  // rather than picked: on the sunrise theme every surface a label can land
  // on is light (the frosted tile, a white card, a #e7ecf3 chip), and stone's
  // own 400/500 miss WCAG AA on all three at the 10-14px these are used at.
  400: '#6f6862', // micro-labels ("Awarded by", group headings)
  500: '#635c57', // secondary text (dates, org lines, form labels)
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
        // the one expressive face on the site: everything supporting it is
        // technical (Inter, and JetBrains Mono for the gate codes), so the
        // name gets a warm high-contrast serif rather than a third grotesque
        display: ['Fraunces Variable', 'Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sketch: ['Caveat', 'ui-rounded', 'cursive'],
      },
      colors: {
        grey,
        // Deep teal, pulled out of the lake in the photograph. Darker and
        // greener than the water itself, which is what keeps it from sinking
        // into the picture the way the old blue did.
        accent: {
          DEFAULT: '#0f766e', // teal
          light: '#0d9488',   // decorative strokes and fills
          deep: '#115e59',    // pressed / hovered solid, and small type: at
                              // 10px on the navbar's thin glass the DEFAULT
                              // measures 3.6:1, which is under AA
        },
        // Awards keep a token of their own so a placement never depends on
        // whatever the accent happens to be. Amber is complementary to the
        // teal, so a medal still announces itself.
        award: {
          DEFAULT: '#92400e', // amber-800
          soft: '#f59e0b',    // amber-500, for rings and low-alpha fills
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
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
      },
    },
  },
  plugins: [],
}
