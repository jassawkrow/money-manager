/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        'cream-deep': '#EDE5D6',
        ink: '#1F1B16',
        'ink-soft': '#3A332B',
        'ink-faded': '#6B6258',
        indigo: {
          faded: '#4A4E7A',
          dust: '#7B7FA3',
        },
        rose: {
          dust: '#B58A7F',
          soft: '#D4AFA3',
        },
      },
      fontFamily: {
        serif: ['Lora', 'EB Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
