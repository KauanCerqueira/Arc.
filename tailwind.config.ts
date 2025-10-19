/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/core/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: '#E6E9EF',
        primary: {
          DEFAULT: '#0073EA',
          hover: '#0060C0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      },
    },
  },
  plugins: [],
}