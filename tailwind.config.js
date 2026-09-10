import colors from 'tailwindcss/colors'

// Base neutral for the whole site. Swap this one line to retune the mood:
//   colors.stone   -> warm grey (calm, soft)
//   colors.slate   -> cold grey (calm, cool/blue)
//   colors.neutral -> true grey (neutral)
//   colors.zinc    -> original (cool, faintly blue)
// Warm neutral surfaces on warm off-white paper. 50-300 were cool blue-greys
// chosen when every surface was frosted glass over a photograph, where the
// mismatch with the warm 400/500 text ramp was invisible. On a flat page it
// is not, so the light end was rewarmed to sit in the same family as the
// type. 400+ stay stone so the measured text colours are untouched.
const grey = {
  ...colors.stone,
  50: '#ffffff',  // cards, inputs, the brightest surface
  100: '#f4f2ef', // subtle fills, chips, image wells
  200: '#e8e5e0', // hairline borders and rings — the workhorse
  300: '#d6d2cb', // stronger borders, the section rule
  // 400/500 are the muted text ramp and are darker than stone's, measured
  // rather than picked. They were measured against frosted glass over a
  // photograph; on the flat page they now sit on they have more headroom,
  // not less, so they carry over unchanged and still pass at 10-14px.
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
        // The paper the whole document is printed on. Barely off-white and
        // faintly warm, so it sits under the Queenstown photograph in the
        // intro rather than cutting against it — a pure #fff page made the
        // seam where the picture ends read as a hard edge.
        page: '#fbfaf9',
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
