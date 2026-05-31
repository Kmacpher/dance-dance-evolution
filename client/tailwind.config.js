import { fileURLToPath } from 'url';
import path from 'path';

// Resolve content globs relative to THIS config file, not the cwd — the dev
// server runs from the repo root (`vite --config client/vite.config.ts`), so
// relative globs like './src' would miss client/src and Tailwind would emit
// zero utility classes.
const dir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(dir, 'index.html'), path.join(dir, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      fontFamily: {
        echo: ['EchoDeco', 'sans-serif'],
        petit: ['petit', 'sans-serif'],
        neon: ['neon', 'sans-serif'],
        sans: ['Open Sans', 'sans-serif'],
      },
      colors: {
        dde: {
          cyan: '#2DDEFF',
          pink: '#ea4c88',
          'pink-dark': '#a92658',
          blue: '#3E98DF',
          green: '#22BD6B',
          yellow: '#E9A92E',
          bg: '#2c3338',
          text: '#606468',
        },
      },
      keyframes: {
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'scale3d(0,0,0)' },
          to: { opacity: '1', transform: 'scale3d(1,1,1)' },
        },
      },
      animation: {
        flash: 'flash 0.4s ease-in-out',
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};
