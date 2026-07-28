/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        player: {
          red:    '#dc2626',
          blue:   '#2563eb',
          green:  '#16a34a',
          yellow: '#ca8a04',
        },
        board: {
          bg:     '#f5f0e8',
          border: '#78716c',
        },
      },
    },
  },
  plugins: [],
};
