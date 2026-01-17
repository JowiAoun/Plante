import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Transpile NES.css and framer-motion for compatibility
  transpilePackages: ['nes.css', 'framer-motion'],
}

export default nextConfig
