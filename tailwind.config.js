/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        priority: {
          low: '#10b981',
          normal: '#3b82f6',
          high: '#f59e0b',
          critical: '#ef4444'
        },
        task: {
          gray: '#e5e7eb',
          red: '#fee2e2',
          orange: '#fed7aa',
          yellow: '#fef3c7',
          green: '#d1fae5',
          blue: '#dbeafe',
          purple: '#e9d5ff',
          pink: '#fce7f3'
        }
      }
    }
  },
  plugins: []
}
