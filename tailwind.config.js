/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F1F5F9',       // Slate-100 high-definition background
        surface: '#FFFFFF',      // Pure white cards
        primary: {
          DEFAULT: '#2563EB',    // Vibrant Blue-600
          hover: '#1D4ED8',      // Blue-700
          light: '#EFF6FF',      // Blue-50
        },
        navy: {
          DEFAULT: '#0F172A',    // Slate-900 (High contrast primary text)
          light: '#1E293B',      // Slate-800
        },
        muted: '#475569',        // Slate-600 (High contrast secondary text)
        line: '#CBD5E1',         // Slate-300 (Crisp, defined borders)
        amber: {
          accent: '#D97706',     // Amber-600
          light: '#FEF3C7',      // Amber-100
        },
        emerald: {
          accent: '#059669',     // Emerald-600
          light: '#D1FAE5',      // Emerald-100
        },
        rose: {
          accent: '#E11D48',     // Rose-600
          light: '#FFE4E6',      // Rose-100
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        cardhover: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
}
