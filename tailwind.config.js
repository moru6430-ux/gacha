/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './smoke-free.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0d12',
          900: '#11141b',
          800: '#171b25',
          700: '#222838',
          600: '#2f3649',
        },
        amber: {
          glow: '#f5c97a',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
