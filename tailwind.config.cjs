/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#030617',
        surface: '#0a1020',
        surfaceAlt: '#050816',
        accent: '#a78bfa',
        accentSoft: '#c084fc',
        accentBlue: '#38bdf8',
        signal: '#f472b6',
        success: '#34d399',
        warning: '#fb923c',
        info: '#22d3ee',
      },
      boxShadow: {
        soft: '0 18px 45px rgba(3,6,17,0.65)',
        glow: '0 0 45px rgba(167,139,250,0.45)',
        'inner-card': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Space Grotesk"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      keyframes: {
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95) translateY(8px)' },
          to: { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
        pulseSoft: {
          from: { transform: 'scale(1)', opacity: 0.9 },
          '50%': { transform: 'scale(1.05)', opacity: 1 },
          to: { transform: 'scale(1)', opacity: 0.9 },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 0.7, transform: 'scale(0.98)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        softPulse: {
          '0%, 100%': { opacity: 0.9, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.02)' },
        },
      },
      animation: {
        scaleIn: 'scaleIn 0.22s ease-out',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 12s ease-in-out infinite',
        'float-slow': 'float-slow 16s ease-in-out infinite',
        'signal-pulse': 'pulse-soft 5s ease-in-out infinite',
        softPulse: 'softPulse 8s ease-in-out infinite',
      },
      dropShadow: {
        glow: '0 0 15px rgba(167,139,250,0.45)',
      },
      transitionProperty: {
        spacing: 'margin, padding',
      },
    },
  },
  plugins: [],
};
