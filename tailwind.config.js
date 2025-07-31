/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'cad-primary': '#2563eb',
        'cad-secondary': '#64748b',
        'cad-accent': '#f59e0b',
        'cad-bg': '#f8fafc',
        'cad-panel': '#ffffff'
      }
    },
  },
  plugins: [],
}