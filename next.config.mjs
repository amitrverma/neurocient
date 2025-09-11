import createMDX from '@next/mdx'
import withPWAInit from 'next-pwa'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

// ✅ configure next-pwa
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
}

// ✅ compose MDX + PWA
export default withPWA(withMDX(nextConfig))
