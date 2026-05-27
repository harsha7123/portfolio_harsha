// craco.config.js
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
};

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

let webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

webpackConfig.devServer = (devServerConfig) => {
  // Add health check endpoints if enabled
  if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
    const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // Call original setup if exists
      if (originalSetupMiddlewares) {
        middlewares = originalSetupMiddlewares(middlewares, devServer);
      }

      // Setup health endpoints
      setupHealthEndpoints(devServer, healthPluginInstance);

      return middlewares;
    };
  }

  return devServerConfig;
};

// Wrap with visual edits (automatically adds babel plugin, dev server, and overlay in dev mode)
// NOTE: disabled — its babel plugin injects DOM attributes into JSX, which breaks
// react-three-fiber (R3F treats every prop as a three.js property).
if (false && isDevServer) {
  try {
    const { withVisualEdits } = require("@emergentbase/visual-edits/craco");
    webpackConfig = withVisualEdits(webpackConfig);

    // Restrict the visual-edits babel plugin so it does NOT touch react-three-fiber
    // files (lowercase JSX = three.js objects; attribute injection breaks R3F).
    if (webpackConfig.babel && Array.isArray(webpackConfig.babel.plugins)) {
      webpackConfig.babel.plugins = webpackConfig.babel.plugins.map((p) => {
        // The visual-edits plugin is a function (single plugin entry).
        if (typeof p === "function" && p.name !== "wrappedVisualEdits") {
          const wrapped = function wrappedVisualEdits(api, opts, dirname) {
            const inner = p(api, opts, dirname);
            const original = inner.visitor || {};
            const SKIP = /components[\\/]portfolio[\\/]/;
            const guard = (visitor) => (nodePath, state) => {
              const filename =
                (state && state.filename) ||
                (state && state.file && state.file.opts && state.file.opts.filename) ||
                "";
              if (SKIP.test(filename)) return;
              return visitor(nodePath, state);
            };
            const newVisitor = {};
            for (const k of Object.keys(original)) {
              newVisitor[k] = guard(original[k]);
            }
            return { ...inner, visitor: newVisitor };
          };
          return wrapped;
        }
        return p;
      });
    }
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('@emergentbase/visual-edits/craco')) {
      console.warn(
        "[visual-edits] @emergentbase/visual-edits not installed — visual editing disabled."
      );
    } else {
      throw err;
    }
  }
}

module.exports = webpackConfig;
