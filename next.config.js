/** @type {import('next').NextConfig} */
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
