/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ia: {
          navy:      '#1B3057',   // bleu marine iA principal
          navydark:  '#0F1E38',   // marine foncé
          navylight: '#2A4A7F',   // marine clair
          red:       '#C8102E',   // rouge iA
          reddark:   '#9B0B22',   // rouge foncé
          redlight:  '#F5E6E9',   // rouge très pâle (fond)
          blue:      '#E8EFF5',   // bleu pâle (fond carte)
          gold:      '#B89A5E',   // or/doré accent
          gray:      '#F4F6F9',   // gris fond
          text:      '#1A2B3C',   // texte principal
          muted:     '#6B7D8F',   // texte secondaire
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
