/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0B5FA5",
        statusOk: "#1E7E34",
        statusWarning: "#8A6D00",
        statusDanger: "#B3261E",
      },
    },
  },
  plugins: [],
};
