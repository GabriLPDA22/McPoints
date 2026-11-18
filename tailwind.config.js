/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Inter Variable"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--text-muted) / <alpha-value>)',
        subtle: 'rgb(var(--text-subtle) / <alpha-value>)',
        accent: 'rgb(var(--primary) / <alpha-value>)',
        'accent-strong': 'rgb(var(--primary-strong) / <alpha-value>)',
        'on-accent': 'rgb(var(--on-primary) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-ink': 'rgb(var(--gold-ink) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '20px',
      },
      boxShadow: {
        // Elevación mínima: solo para bottom sheets/diálogos (level2). Las
        // cards y superficies normales se distinguen por borde de 1px, no
        // por sombra.
        soft: '0 -2px 16px -4px rgba(20, 19, 19, 0.10)',
        card: '0 1px 2px 0 rgba(20, 19, 19, 0.04)',
        // Reservado exclusivamente al FAB de escanear (level3).
        glow: '0 4px 14px -2px rgb(var(--primary) / 0.35)',
      },
    },
  },
  plugins: [],
};
