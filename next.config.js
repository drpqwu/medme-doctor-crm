/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
          ignoreBuildErrors: true,
    },
    eslint: {
          ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer }) => {
          if (isServer) {
                  config.externals = [...(config.externals || []), 'better-sqlite3']
          }
          return config
    },
    images: {
          domains: ['localhost'],
    },
}

module.exports = nextConfig
