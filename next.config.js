/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  outputFileTracingRoot: require('path').join(__dirname),
  outputFileTracingIncludes: {
    '/api/admin/kkr-torn-memories/prosecute': ['./node_modules/ffmpeg-static/ffmpeg'],
  },
};

module.exports = nextConfig;
