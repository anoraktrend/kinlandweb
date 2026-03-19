const {merge} = require("webpack-merge");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const common = require("./webpack.common.cjs");

module.exports = merge(common, {
  mode: "production",

  output: {
    filename: "[name].[contenthash:5].js",
    chunkFilename: "[name].[contenthash:5].chunk.js",
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Isolate Decap CMS and its heavy dependencies (Slate, Redux, etc.)
        cmsVendor: {
          test: /[\\/]node_modules[\\/](decap-cms-app|slate|slate-react|redux|react-redux|immutable|lodash|moment)/,
          name: "cms-vendor",
          chunks: "all",
          priority: 30,
          enforce: true,
        },
        // Separate chunk for React core (shared)
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: "react-vendor",
          chunks: "all",
          priority: 20,
        },
        // Other general vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash:5].css",
      chunkFilename: "[name].[contenthash:5].chunk.css",
    }),
  ],
});
