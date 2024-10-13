/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "emerald-adjacent-gull-40.mypinata.cloud",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
