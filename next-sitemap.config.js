/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://neurocient.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,

  // Exclude backend or utility routes
  exclude: ["/api/*", "/admin/*"],

  // Dynamically assign only lastmod (Google still uses this)
  transform: async (config, path) => ({
    loc: path,
    lastmod: new Date().toISOString(),
  }),

  // Optional: add custom paths not directly linked in site (diagnostics, etc.)
  additionalPaths: async (config) => [
    await config.transform(config, "/diagnostics/caveman-scan"),
    await config.transform(config, "/diagnostics/cic"),
  ],

  // Ensure canonical consistency
  trailingSlash: false,
};
