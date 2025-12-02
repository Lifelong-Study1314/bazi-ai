module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'bazi-primary': '#2c5282',
        'bazi-secondary': '#f4b942',
        'bazi-accent': '#d69e2e',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
