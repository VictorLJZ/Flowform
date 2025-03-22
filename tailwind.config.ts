import type { Config } from 'tailwindcss';
import { typographyPlugin } from './src/lib/tailwind-plugins/typography';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // These will be extended by our CSS variables
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      // Add custom font-related sizes, weights, or other extensions here
      fontSize: {
        // Example custom font sizes if needed
        '2.5xl': '1.75rem',
        '4.5xl': '2.5rem',
      },
    },
  },
  plugins: [
    typographyPlugin,
    // Add other plugins here
  ],
} satisfies Config;
