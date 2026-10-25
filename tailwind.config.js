/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effaf3',
          100: '#d7f1e1',
          200: '#b1e3c7',
          300: '#82cfa8',
          400: '#4fb585',
          500: '#2c9a69',
          600: '#1e7b54',
          700: '#186245',
          800: '#154e39',
          900: '#10402f',
          950: '#0a261c',
        },
        gold: {
          50: '#fbf7ea',
          100: '#f5ecc9',
          200: '#ecd994',
          300: '#e0c062',
          400: '#d3a843',
          500: '#bf8c2e',
          600: '#a06d25',
        },
        ink: {
          900: '#101a15',
          800: '#1b2820',
          700: '#33433a',
          600: '#4d5d54',
          500: '#6b7a70',
          400: '#8f9c93',
          300: '#b6c0b9',
        },
        line: '#e9e7de',
        canvas: '#f7f6f1',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,26,21,0.04), 0 4px 16px -6px rgba(16,26,21,0.06)',
        lift: '0 2px 4px rgba(16,26,21,0.05), 0 18px 40px -16px rgba(16,26,21,0.22)',
        ring: '0 0 0 4px rgba(44,154,105,0.14)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        drawerIn: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn .18s ease-out',
        slideUp: 'slideUp .25s ease-out',
        slideIn: 'slideIn .28s cubic-bezier(.2,.8,.2,1)',
        drawerIn: 'drawerIn .25s cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [],
};
