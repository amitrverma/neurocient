// tailwind.config.js
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/content/**/*.{mdx,md}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#ed254e",   // punchy red (CTAs, emphasis)
          secondary: "#f9dc5c", // warm yellow (blockquote, list markers)
          accent: "#a93f55",    // deep rose (emphasis)
          teal: "#5eb1bf",      // teal (links)
          dark: "#042a2b",      // dark headings / base
        },
      },
    },
  },
};
