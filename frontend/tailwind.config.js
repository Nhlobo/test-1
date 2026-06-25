/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        panel: '#0f172a',
        panelSoft: '#111c31',
        borderSoft: 'rgba(148,163,184,0.22)'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.25), 0 16px 40px rgba(2,6,23,0.35)'
      },
      backgroundImage: {
        auth:
          "linear-gradient(rgba(2,6,23,.84), rgba(2,6,23,.88)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop')"
      }
    }
  },
  plugins: []
};
