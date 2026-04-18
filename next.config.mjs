/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // face-api.js / TensorFlow.js try to import Node-only modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
