import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  // Use standalone output for Docker; omit for Vercel (auto-detected).
  ...(process.env.STANDALONE === 'true' ? { output: 'standalone' } : {})
}

export default nextConfig
