const { merge } = require("webpack-merge");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "development",

  output: {
    filename: "[name].js",
    chunkFilename: "[id].js",
  },

  devServer: {
    port: process.env.PORT || 3000,
    static: {
      directory: path.join(process.cwd(), "./dist"),
    },
    historyApiFallback: true,
    hot: true,
    open: true,
    watchFiles: ["site/**/*"],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
});
