/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./widget/**/*.{js,ts,jsx,tsx}",
    "./demo/**/*.html"
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

