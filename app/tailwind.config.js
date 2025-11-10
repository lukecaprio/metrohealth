/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B46C1',
          light: '#E9D5FF',
          dark: '#553C9A',
        },
        purple: {
          600: '#6B46C1',
          100: '#E9D5FF',
        },
      },
      fontSize: {
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
    },
  },
  plugins: [],
}

