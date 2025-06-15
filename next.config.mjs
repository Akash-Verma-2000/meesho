/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost'],
        unoptimized: true
    },
    experimental: {
        serverActions: true
    }
};

export default nextConfig;
