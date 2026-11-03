/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ketcher wird als ES-Module ausgeliefert und muss mitkompiliert werden.
  transpilePackages: ["ketcher-react", "ketcher-core", "ketcher-standalone"],
};

export default nextConfig;
