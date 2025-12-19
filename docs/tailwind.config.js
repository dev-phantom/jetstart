/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ['./src/**/*.{js,jsx,ts,tsx}', './docs/**/*.{md,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'jetstart-bg': '#222222',
        'jetstart-alt-bg': '#1E1E1E',
        'jetstart-secondary': '#B86709',
        'jetstart-primary': '#25FF79',
        'jetstart-orange': '#CC4C0C',
        'jetstart-text': '#FFFFFF',
      },
      keyframes: {
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      animation: {
        'rotate-slow': 'rotate 40s linear infinite',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
