import createMDX from "@next/mdx";
import nextPWA from "next-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const withMDX = createMDX({ extension: /\.mdx?$/ });
const isProd = process.env.NODE_ENV === "production";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

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
  turbopack: {
    root: projectRoot,
  },
};

export default withPWA(withMDX(nextConfig));
