/** @type {import('next').NextConfig} */
const nextConfig = {
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
