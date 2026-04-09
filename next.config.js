/** @type {import('next').NextConfig} */
// 404 em /_next/static/css/... no dev: apague .next e reinicie `npm run dev` (chunk antigo em cache do navegador).
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid flaky missing _next chunks on some Windows setups.
      config.cache = false
    }
    return config
  }
}

module.exports = nextConfig;
