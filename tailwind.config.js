/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        brand: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          yellow: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FACC15',
            500: '#EAB308',
            600: '#CA8A04',
            700: '#A16207',
            800: '#854D0E',
            900: '#713F12',
          },
        },
      },
    },
  },
  plugins: [],
};
