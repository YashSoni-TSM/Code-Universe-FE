import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all your new TSX files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config