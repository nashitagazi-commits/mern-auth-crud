/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9FC',       // page background
        surface: '#FFFFFF',      // cards
        line: '#EAE7F3',         // hairline borders
        ink: '#211F2E',          // primary text
        muted: '#7A7690',        // secondary text
        violet: {
          DEFAULT: '#6C5CE7',
          soft: '#EFEAFD',
          dark: '#5340D6',
        },
        coral: {
          DEFAULT: '#FF6B6B',
          soft: '#FFECEC',
        },
        mint: {
          DEFAULT: '#22C199',
          soft: '#E3FAF3',
        },
        amber: {
          DEFAULT: '#FFA630',
          soft: '#FFF3E2',
        },
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 10px rgba(108, 92, 231, 0.06)',
        lift: '0 12px 28px rgba(108, 92, 231, 0.14)',
        glow: '0 0 0 4px rgba(108, 92, 231, 0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.08)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
        pop: {
          '0%': { transform: 'scale(0.96)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease-out both',
        blob: 'blob 12s infinite ease-in-out',
        pop: 'pop 0.25s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
