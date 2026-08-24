/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amethyst: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#581C87',
          900: '#3B0764',
          deep: '#140826',
          midnight: '#0C0616',
        },
        gold: {
          light: '#F5E6BE',
          DEFAULT: '#D4AF37',
          dark: '#997A1E',
          muted: '#B88A22',
        },
        sanctuary: {
          dark: '#0A0612',
          velvet: '#120B20',
          cardDark: '#18102A',
          light: '#F8F6FA',
          linen: '#F0EAF6',
          cardLight: '#FFFFFF',
        },
        bamboo: {
          light: '#4E9B6E',
          DEFAULT: '#267347',
          dark: '#184D2E',
        },
        cinnabar: {
          light: '#E35D4B',
          DEFAULT: '#C33E2B',
          dark: '#8C2314',
        },
        azure: {
          light: '#4B88E3',
          DEFAULT: '#2B66C3',
          dark: '#143C8C',
        },
      },
      fontFamily: {
        cinzel: ['"Cinzel"', 'serif'],
        editorial: ['"Cormorant Garamond"', '"Playfair Display"', '"Songti SC"', 'SimSun', 'serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"PingFang SC"', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'amethyst-glow': '0 0 35px rgba(168, 85, 247, 0.35)',
        'amethyst-subtle': '0 0 15px rgba(168, 85, 247, 0.2)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.35)',
        'gold-subtle': '0 0 15px rgba(212, 175, 55, 0.18)',
        'card-float': '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(168, 85, 247, 0.25)',
        'card-float-light': '0 16px 36px -8px rgba(90, 30, 150, 0.12), 0 0 0 1px rgba(168, 85, 247, 0.25)',
        'dock': '0 20px 60px -10px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(168, 85, 247, 0.2)',
        'dock-light': '0 16px 50px -10px rgba(100, 40, 160, 0.1), 0 0 0 1px rgba(168, 85, 247, 0.15)',
      },
      animation: {
        'fluid-1': 'fluid-drift-1 18s ease-in-out infinite alternate',
        'fluid-2': 'fluid-drift-2 22s ease-in-out infinite alternate',
        'fluid-3': 'fluid-drift-3 26s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fluid-drift-1': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(80px, 50px) scale(1.15)' },
          '100%': { transform: 'translate(-40px, 80px) scale(0.95)' },
        },
        'fluid-drift-2': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-70px, -40px) scale(1.2)' },
          '100%': { transform: 'translate(50px, -60px) scale(0.9)' },
        },
        'fluid-drift-3': {
          '0%': { transform: 'translate(0px, 0px) scale(0.95)' },
          '50%': { transform: 'translate(60px, -50px) scale(1.1)' },
          '100%': { transform: 'translate(-50px, 40px) scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
}
