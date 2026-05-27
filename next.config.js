/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        // Import .md files as raw strings. Replaces CRA's behavior of bundling
        // .md as asset URLs that were then fetched at runtime (see Content.tsx).
        config.module.rules.push({ test: /\.md$/, type: "asset/source" });
        return config;
    },
};

module.exports = nextConfig;
