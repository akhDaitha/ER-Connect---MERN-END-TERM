/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6EC',
        sage: '#7A9E7E',
        'deep-green': '#4F7355',
        butter: '#F4D58D',
        'warm-brown': '#8B5E3C',
        'dark-brown': '#4A3728',
        terracotta: '#C97B63',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(74, 55, 40, 0.06), 0 2px 6px -1px rgba(74, 55, 40, 0.04)',
        hover: '0 10px 25px -3px rgba(74, 55, 40, 0.1), 0 4px 6px -2px rgba(74, 55, 40, 0.05)',
      }
    },
  },
  plugins: [],
}
