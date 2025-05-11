/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para el tema oscuro con neón
        zinc: {
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
        fuchsia: {
          500: "#d946ef",
          600: "#c026d3",
          900: "#701a75",
        },
        purple: {
          500: "#a855f7",
          600: "#9333ea",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      boxShadow: {
        neon: "0 0 15px rgba(192, 38, 211, 0.5)",
        "neon-hover": "0 0 25px rgba(192, 38, 211, 0.7)",
      },
    },
  },
  plugins: [],
};
