/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy (deep navy layers)
        surface: {
          DEFAULT: '#0b1326',
          dim: '#0b1326',
          bright: '#31394d',
          'container-lowest': '#060e20',
          'container-low': '#131b2e',
          container: '#171f33',
          'container-high': '#222a3d',
          'container-highest': '#2d3449',
        },
        // Primary (Amber signal)
        primary: {
          DEFAULT: '#ffc174',
          container: '#f59e0b',
          fixed: '#ffddb8',
          'fixed-dim': '#ffb95f',
        },
        'on-primary': '#472a00',
        'on-primary-container': '#613b00',
        // Secondary (Slate structural)
        secondary: {
          DEFAULT: '#b7c8e1',
          container: '#3a4a5f',
          fixed: '#d3e4fe',
          'fixed-dim': '#b7c8e1',
        },
        'on-secondary': '#213145',
        'on-secondary-container': '#a9bad3',
        // Tertiary
        tertiary: {
          DEFAULT: '#bfcde6',
          container: '#a3b2ca',
          fixed: '#d5e3fd',
          'fixed-dim': '#b9c7e0',
        },
        // On-surface
        'on-surface': '#dae2fd',
        'on-surface-variant': '#d8c3ad',
        'on-background': '#dae2fd',
        // Outline
        outline: {
          DEFAULT: '#a08e7a',
          variant: '#534434',
        },
        // Error
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        'on-error': '#690005',
        'on-error-container': '#ffdad6',
        // Inverse
        'inverse-surface': '#dae2fd',
        'inverse-on-surface': '#283044',
        'inverse-primary': '#855300',
        // Surface tint
        'surface-tint': '#ffb95f',
        // Brand (kept for compatibility)
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        headline: ['Manrope', 'DM Sans', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
};
