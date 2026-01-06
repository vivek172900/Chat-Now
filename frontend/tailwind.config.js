const { Filter } = require('lucide-react');
const { transform } = require('motion');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#1476ff",
        "secondary": "#f3f5ff",
        "light": "#f9faff"
      },
      keyframes: {
        starburstl: {
          '0%': { opacity: 0, transform: 'translateX(0px) scale(1.0)' },
          '100%': { opacity: 1, transform: 'translateX(-50px) translateY(-50px) scale(1.9)', filter: 'drop-shadow(0px 0px 3px cyan)' },
        },
        starburstr: {
          '0%': { opacity: 0, transform: 'translateX(0px) scale(1.0)' },
          '100%': { opacity: 1, transform: 'translateX(50px) translateY(50px) scale(1.5)' },
        },
        starburstt: {
          '0%': { opacity: 0, transform: 'translateX(0px) scale(1.0)' },
          '100%': { opacity: 1, transform: 'translateX(-50px) translateY(50px) scale(1.2)' },
        },
        starburstb: {
          '0%': { opacity: 0, transform: 'translateX(0px) scale(1.0)' },
          '100%': { opacity: 1, transform: 'translateX(50px) translateY(-50px) scale(1)' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(50px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        starburstl: 'starburstl 1s ease-out',
        starburstr: 'starburstr 1s ease-out',
        starburstt: 'starburstt 1s ease-out',
        starburstb: 'starburstb 1s ease-out',
        fadeInUp: 'fadeInUp 1s ease-out',
        gradientShift: "gradientShift 8s ease infinite",
        blob: 'blob 7s infinite',
        float: 'float 6s ease-in-out infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide') // Add the scrollbar-hide plugin
  ],
}