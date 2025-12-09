/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#ff6a3d',
          600: '#ff4e1f'
        }
      }
    },
  },
  plugins: [],
}
