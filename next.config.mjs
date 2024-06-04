import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
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
