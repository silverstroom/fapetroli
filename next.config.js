/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Migliora il cold-start delle serverless functions su Vercel
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Disabilita header x-powered-by per sicurezza
  poweredByHeader: false,
};

module.exports = nextConfig;
