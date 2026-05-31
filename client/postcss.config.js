import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import { fileURLToPath } from 'url';
import path from 'path';

// The dev server runs from the repo root, so the tailwindcss plugin's default
// config search (which starts at cwd) misses client/tailwind.config.js and
// falls back to Tailwind's empty-content default — emitting preflight but zero
// utility classes. Point it at the config explicitly with an absolute path.
const dir = path.dirname(fileURLToPath(import.meta.url));

export default {
  plugins: [
    tailwindcss({ config: path.join(dir, 'tailwind.config.js') }),
    autoprefixer(),
  ],
};
