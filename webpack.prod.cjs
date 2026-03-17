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
        // Separate chunk for Decap CMS core
        decapCms: {
          test: /[\\/]node_modules[\\/]decap-cms-app[\\/]/,
          name: "decap-cms",
          chunks: "all",
          priority: 20,
        },
        // Separate chunk for React and related libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react-vendor",
          chunks: "all",
          priority: 15,
        },
        // Separate chunk for other vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
        },
        // Separate chunk for preview templates
        previewTemplates: {
          test: /[\\/]src[\\/]js[\\/]cms-preview-templates[\\/]/,
          name: "preview-templates",
          chunks: "all",
          priority: 5,
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
