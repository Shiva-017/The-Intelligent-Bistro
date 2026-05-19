/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#0a0a0a",
          card: "#141414",
          border: "#242424",
          accent: "#d4af37",
          "accent-muted": "#b8962e",
          text: "#f5f5f5",
          muted: "#888888",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
};
