/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Allows the app to run on Vercel with server components
  output: undefined, // Vercel handles this automatically — do not set 'export'
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GEOAPIFY_KEY: process.env.NEXT_PUBLIC_GEOAPIFY_KEY,
  },
}

export default nextConfig
