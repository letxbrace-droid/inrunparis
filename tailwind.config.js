/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent:     '#ff4103',
        'accent-2': '#ff5a1f',
        // CSS-variable backed — respond to data-theme switches at runtime
        bg: {
          grouped:   'var(--bg-grouped)',
          base:      'var(--bg-base)',
          secondary: 'var(--bg-secondary)',
          tertiary:  'var(--bg-tertiary)',
          elevated:  'var(--bg-elevated)',
          glass:     'var(--bg-glass)',
        },
        ink: {
          primary:   'var(--ink-primary)',
          secondary: 'var(--ink-secondary)',
          muted:     'var(--ink-muted)',
        },
        separator: {
          DEFAULT: 'var(--separator)',
          strong:  'var(--separator-strong)',
        },
        wa:       'var(--wa)',
        positive: 'var(--positive)',
        info:     'var(--info)',
      },
      fontFamily: {
        body:  ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        brand: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        spring:     'cubic-bezier(.32,1.2,.55,1)',
        'out-expo': 'cubic-bezier(.16,1,.3,1)',
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
        fadeUp:    { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        navIn:     { from: { opacity: 0, transform: 'translateX(-24px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        floatY:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        'slide-up':   'slideUp 0.44s cubic-bezier(.32,1,.55,1) both',
        'slide-left': 'slideLeft 0.34s cubic-bezier(.16,1,.3,1) both',
        'fade-in':    'fadeIn 0.2s ease both',
        'fade-up':    'fadeUp 0.5s cubic-bezier(.16,1,.3,1) both',
        'nav-in':     'navIn 0.45s cubic-bezier(.16,1,.3,1) both',
        float:        'floatY 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
