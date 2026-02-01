module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors
        'bazi-primary': '#2c5282',
        'bazi-secondary': '#f4b942',
        'bazi-accent': '#d69e2e',
        // Traditional Chinese inspired palette (black and gold)
        'bazi-bg': '#05060a',
        'bazi-surface': '#14141f',
        'bazi-surface-soft': '#1d1d2a',
        'bazi-gold': '#d4af37',
        'bazi-gold-soft': '#f5e6b7',
        'bazi-red': '#b91c1c',
        'bazi-ink': '#0b0c10',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif-cjk': ['Noto Serif KR', 'Noto Serif TC', 'Noto Serif SC', 'serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.3)',
      },
      borderWidth: {
        'subtle': '1px',
      },
      spacing: {
        'section': '2rem',
        'card': '1.5rem',
      },
    }
  },
  plugins: []
}
