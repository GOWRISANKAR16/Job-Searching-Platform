/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(245, 58%, 51%)",
        accent: "#8B0000"
      }
    }
  },
  plugins: []
};
