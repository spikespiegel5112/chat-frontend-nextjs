/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // in my version (v13) I had to write ./@images
    // in your version it may be possible to instead write @images
    config.resolve.alias["./@"] = "/src/";
    // config.resolve.alias['@images'] = '/path/to/images';

    // in some cases you may need to use path.resolve, but normally it should work without it
    // config.resolve.alias['./@images'] = path.resolve(__dirname, './path/to/images');

    return config;
  },
};

export default nextConfig;
