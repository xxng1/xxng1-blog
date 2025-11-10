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
        background: '#fafafa',
        foreground: '#1a1a1a',
        'card-background': '#ffffff',
        'card-border': '#e5e7eb',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
        muted: '#6b7280',
        'muted-foreground': '#9ca3af',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};