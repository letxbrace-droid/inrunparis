/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent:     '#ff4103',
        'accent-2': '#ff5a1f',
        bg: {
          grouped:   '#00101a',
          base:      '#001621',
          secondary: '#0c1e2e',
          tertiary:  '#13283a',
          elevated:  '#16293a',
          glass:     'rgba(0,18,28,0.72)',
        },
        ink: {
          primary:    '#F5F1E8',
          secondary:  'rgba(245,241,232,0.56)',
          tertiary:   'rgba(245,241,232,0.34)',
          muted:      'rgba(245,241,232,0.34)',
          quaternary: 'rgba(245,241,232,0.20)',
        },
        separator: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong:  'rgba(255,255,255,0.11)',
        },
        wa: '#25d366',
      },
      fontFamily: {
        body:  ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        brand: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        cell:  '12px',
        card:  '14px',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'elev-1': '0 1px 3px rgba(0,0,0,0.35)',
        'elev-2': '0 8px 28px rgba(0,0,0,0.5)',
      },
      keyframes: {
        slideUp:   { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        slideLeft: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        navIn:     { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      animation: {
        'slide-up':   'slideUp 0.44s cubic-bezier(.32,1,.55,1) both',
        'slide-left': 'slideLeft 0.34s cubic-bezier(.16,1,.3,1) both',
        'fade-in':    'fadeIn 0.2s ease both',
        'nav-in':     'navIn 0.45s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
}
