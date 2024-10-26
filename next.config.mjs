/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true, // Enable async WebAssembly
      };
      return config;
    },
  };
  
  export default nextConfig;
  
