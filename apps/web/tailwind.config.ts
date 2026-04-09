import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        soft: '0 18px 48px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(to right, rgba(16,37,63,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,37,63,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'hero-grid': '32px 32px',
      },
    },
  },
  plugins: [],
};

export default config;

