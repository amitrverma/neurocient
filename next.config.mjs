import createMDX from "@next/mdx";
import nextPWA from "next-pwa";

const withMDX = createMDX({ extension: /\.mdx?$/ });
const isProd = process.env.NODE_ENV === "production";

const withPWA = (config) =>
  isProd
    ? nextPWA({
        dest: "public",
        swSrc: "src/service-worker.js",
        sw: "service-worker.js",
        register: true,
        skipWaiting: true,
      })(config)
    : config;

const nextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default withPWA(withMDX(nextConfig));
