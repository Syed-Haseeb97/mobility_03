import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "www.pressanahonda.com",
        pathname: "/wt_prod-24926/images/activa.jpeg",
      },
    ],
  },
};

export default nextConfig;
