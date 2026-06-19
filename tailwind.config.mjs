/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette clinique / médicale sobre
        canvas: '#f4f6f9', // fond principal — gris bleuté très clair
        surface: '#ffffff', // cartes — blanc pur
        line: '#e3e8ef', // bordures fines gris clair
        ink: {
          DEFAULT: '#1e2a38', // texte principal — bleu nuit / anthracite
          soft: '#475569', // texte secondaire
          faint: '#94a3b8' // texte tertiaire / placeholders
        },
        accent: {
          50: '#eef5fb',
          100: '#d7e8f5',
          200: '#aecfe9',
          300: '#7fb0d8',
          400: '#4f8fc4',
          500: '#2f74b0', // bleu médical principal
          600: '#255f95',
          700: '#1f4d79'
        },
        sage: {
          50: '#eef6f2',
          100: '#d6ebe1',
          500: '#3f9d7e', // vert sauge — succès / terminé
          600: '#347f66'
        },
        danger: {
          50: '#fbeef0',
          100: '#f5d7dc',
          500: '#c0556b', // rouge discret — suppression / arrêt
          600: '#a4445a'
        },
        amber: {
          50: '#fbf4e9',
          100: '#f5e6c9',
          500: '#c08a3e', // pause / interrompu
          600: '#a4732f'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(30, 42, 56, 0.04), 0 1px 3px 0 rgba(30, 42, 56, 0.03)',
        'card-hover': '0 4px 12px -2px rgba(30, 42, 56, 0.08)',
        focus: '0 0 0 3px rgba(47, 116, 176, 0.18)'
      },
      borderRadius: {
        xl: '0.875rem'
      }
    }
  },
  plugins: []
}
