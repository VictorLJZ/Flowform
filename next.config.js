/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      'static.ghost.org',
      'blog.useflowform.com',
      'images.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com'
    ],
  },
}

module.exports = nextConfig
