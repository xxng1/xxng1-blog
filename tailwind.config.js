/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#0a0a0a',
        foreground: '#ededed',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};