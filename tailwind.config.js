// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode support
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('tailwindcss/nesting')(require('postcss-nesting')),],
};
