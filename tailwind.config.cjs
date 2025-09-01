/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/popup/index.html",
    "./components/popup/src/**/*.{js,ts,jsx,tsx}",
    "./components/content/index.html",
    "./components/content/src/**/*.{js,ts,jsx,tsx}",
    "./components/pages/index.html",
    "./components/pages/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#baddfd",
          300: "#7cc3fd",
          400: "#37a5f9",
          500: "#0d8aea",
          600: "#016bc8",
          700: "#0258a8",
          800: "#064986",
          900: "#0b3d6f",
          950: "#082749",
        },
      },
    },
  },
  plugins: [],
};
