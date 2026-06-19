/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 這一行非常重要，告訴 Tailwind 去哪裡找 CSS class
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}