/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ramsey: {
          blue: '#1e3a5f',
          green: '#2e7d32',
          gold: '#f9a825',
          red: '#c62828',
          light: '#f5f7fa',
        },
      },
    },
  },
  plugins: [],
}
