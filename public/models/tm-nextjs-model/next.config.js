/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        config.module.rules.push({
            test: /\.wasm$/,
            type: "webassembly/async",
        });

        config.output.webassemblyModuleFilename =
            "../static/wasm/[modulehash].wasm";

        return config;
    },
};

module.exports = nextConfig;
