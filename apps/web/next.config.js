//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: no Node server, no runtime cost (spec §10). Petpooja
  // handles ordering off-domain; this app ships pre-rendered HTML only.
  output: "export",
  images: { unoptimized: true },
};

module.exports = nextConfig;
