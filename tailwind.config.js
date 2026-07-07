/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Stitch / Material You M3 color tokens ─────────────────────────────
      colors: {
        // Primary (deep amber-brown)
        'primary':                    '#9d4300',
        'on-primary':                 '#ffffff',
        'primary-container':          '#f97316',  // saffron — same accent
        'on-primary-container':       '#582200',
        'primary-fixed':              '#ffdbca',
        'primary-fixed-dim':          '#ffb690',
        'on-primary-fixed':           '#341100',
        'on-primary-fixed-variant':   '#783200',
        'inverse-primary':            '#ffb690',

        // Secondary (navy-blue)
        'secondary':                  '#455f87',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#b5d0fd',
        'on-secondary-container':     '#3e5980',
        'secondary-fixed':            '#d5e3ff',
        'secondary-fixed-dim':        '#adc8f5',
        'on-secondary-fixed':         '#001c3b',
        'on-secondary-fixed-variant': '#2d486d',

        // Tertiary (teal)
        'tertiary':                   '#006a61',
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#37ab9e',
        'on-tertiary-container':      '#003934',
        'tertiary-fixed':             '#89f5e7',
        'tertiary-fixed-dim':         '#6bd8cb',
        'on-tertiary-fixed':          '#00201d',
        'on-tertiary-fixed-variant':  '#005049',

        // Error
        'error':                      '#ba1a1a',
        'on-error':                   '#ffffff',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',

        // Surface & Background
        'background':                 '#fff8f2',
        'on-background':              '#1e1b17',
        'surface':                    '#fff8f2',
        'on-surface':                 '#1e1b17',
        'surface-variant':            '#e8e1db',
        'on-surface-variant':         '#584237',
        'surface-tint':               '#9d4300',
        'surface-dim':                '#dfd9d2',
        'surface-bright':             '#fff8f2',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f9f2ec',
        'surface-container':          '#f4ede6',
        'surface-container-high':     '#eee7e0',
        'surface-container-highest':  '#e8e1db',
        'inverse-surface':            '#33302c',
        'inverse-on-surface':         '#f6f0e9',

        // Outline
        'outline':                    '#8c7164',
        'outline-variant':            '#e0c0b1',

        // Legacy aliases for backward compat with existing components
        saffron: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea6900', 700: '#c2500a',
          800: '#9a3d0e', 900: '#7c3210',
        },
        navy: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 500: '#3b6ab0',
          700: '#1e3a5f', 800: '#162d4a', 900: '#0f1e32',
        },
        cream: '#fff8f2',
        parchment: '#fef3e2',
      },

      // ── Typography ─────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['Public Sans', 'Inter', 'system-ui', 'sans-serif'],
        'headline-xl':        ['Public Sans'],
        'headline-xl-mobile': ['Public Sans'],
        'headline-lg':        ['Public Sans'],
        'headline-md':        ['Public Sans'],
        'body-lg':            ['Public Sans'],
        'body-md':            ['Public Sans'],
        'label-md':           ['Public Sans'],
        'label-sm':           ['Public Sans'],
      },
      fontSize: {
        'headline-xl':        ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-xl-mobile': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg':        ['30px', { lineHeight: '38px', fontWeight: '600' }],
        'headline-md':        ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg':            ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':            ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md':           ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '600' }],
        'label-sm':           ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },

      // ── Stitch spacing tokens ───────────────────────────────────────────────
      spacing: {
        'xl':            '80px',
        'lg':            '48px',
        'md':            '24px',
        'base':          '8px',
        'sm':            '12px',
        'xs':            '4px',
        'gutter':        '24px',
        'container-max': '1200px',
      },

      maxWidth: {
        'container-max': '1200px',
      },

      // ── Shadows & Animations ────────────────────────────────────────────────
      boxShadow: {
        'card':      '0 2px 16px rgba(30,58,95,0.08)',
        'card-hover':'0 8px 32px rgba(30,58,95,0.14)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn:  'fadeIn 0.4s ease',
        slideUp: 'slideUp 0.5s ease',
      },
    },
  },
  plugins: [],
}
