/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#A34211',
        secondary: '#F5EBE0',
        background: '#FFFBF7',
        surface: '#FFFFFF',
        text: {
          primary: '#3C2F2F',
          secondary: '#8C7E7E',
          muted: '#BDB2B2'
        },
        badge: {
          success: '#FEF2E2',
          error: '#FEE2E2'
        },
        category: {
          chip: {
            active: '#A34211',
            DEFAULT: '#F5EBE0'
          }
        }
      },
      fontSize: {
        chip: ['14px', { lineHeight: '20px' }],
        'category-section': ['12px', { lineHeight: '16px' }]
      },
      fontFamily: {
        thin: ['Inter_100Thin', 'sans-serif'],
        extralight: ['Inter_200ExtraLight', 'sans-serif'],
        light: ['Inter_300Light', 'sans-serif'],
        regular: ['Inter_400Regular', 'sans-serif'],
        medium: ['Inter_500Medium', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'sans-serif'],
        bold: ['Inter_700Bold', 'sans-serif'],
        extrabold: ['Inter_800ExtraBold', 'sans-serif'],
        black: ['Inter_900Black', 'sans-serif']
      },
      padding: {
        card: '8px',
        cardSm: '10px',
        cardMd: '15px',
        cardLg: '20px',
        cardXl: '25px',
        'chip-x': '24px',
        'chip-y': '8px'
      },
      spacing: {
        card: '8px',
        cardSm: '10px',
        cardMd: '15px',
        cardLg: '20px',
        cardXl: '25px'
      }
    }
  },
  plugins: []
};
