/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  important: true,
  corePlugins: {
    preflight: false,
  },
}
