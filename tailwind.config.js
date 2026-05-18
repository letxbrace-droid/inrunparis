/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent:     '#ff4103',
        'accent-2': '#ff5a25',
        bg: {
          base:     '#0C0C0E',
          elevated: '#161618',
          glass:    'rgba(22,22,24,0.82)',
        },
        ink: {
          primary:   '#F5F1E8',
          secondary: '#9A9FA8',
          muted:     '#5A5F68',
        },
        wa: '#25d366',
      },
      fontFamily: {
        brand: ['Fraunces', 'Georgia', 'serif'],
        body:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
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
