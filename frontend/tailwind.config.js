/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        mushaf: {
          bg: '#faf8f0',
          border: '#d4c9a8',
          text: '#2d2a24',
          accent: '#8b7355',
        },
        mutashabihat: {
          exact: '#22c55e',
          near: '#eab308',
          thematic: '#f97316',
          structural: '#6b7280',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'Scheherazade New', 'serif'],
        urdu: ['Noto Nastaliq Urdu', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'arabic-sm': ['1.25rem', { lineHeight: '2' }],
        'arabic-base': ['1.75rem', { lineHeight: '2.25' }],
        'arabic-lg': ['2.25rem', { lineHeight: '2.5' }],
        'arabic-xl': ['3rem', { lineHeight: '3' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
    },
  },
  plugins: [],
};
