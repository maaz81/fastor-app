/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        fastor: {
          orange: "#FF5C00",
          orangeDark: "#E85300",
          bg: "#FFFFFF",
          inputBg: "#F5F5F5",
          inputBorder: "#E5E5E5",
          textPrimary: "#1A1A1A",
          textSecondary: "#8A8A8A",
          keypadBg: "#EFEFEF",
          keyBg: "#FFFFFF",
          error: "#E53935",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};