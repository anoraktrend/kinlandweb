const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AssetsPlugin = require("assets-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const {merge} = require("webpack-merge");
const {run} = require("npm-run-all");
const pluginError = require("plugin-error");
const fancyLog = require("fancy-log");
const ToStringPlugin = require("to-string-loader");
const ExportsPlugin = require("exports-loader");
const ImportsPlugin = require("imports-loader");
const UrlPlugin = require("url-loader");
const FilePlugin = require("file-loader");
const SassPlugin = require("sass");
const SassLoaderPlugin = require("sass-loader");
const StylePlugin = require("style-loader");
const PostcssImportPlugin = require("postcss-import");
const PostcssLoaderPlugin = require("postcss-loader");
const PostcssPresetEnvPlugin = require("postcss-preset-env");
const ReactPlugin = require("react");
const ReactDomPlugin = require("react-dom");
const DateFnsPlugin = require("date-fns");
const DrizzleOrmPlugin = require("drizzle-orm");
const PostcssPlugin = require("postcss");
const ReduxPlugin = require("redux");
const SlatePlugin = require("slate");
const TslibPlugin = require("tslib");

module.exports = {
  entry: {
    main: [path.join(__dirname, "src", "polyfills.js"), path.join(__dirname, "src", "index.js")],
    cms: [path.join(__dirname, "src", "polyfills.js"), path.join(__dirname, "src", "js", "cms.js")],
  },

  output: {
    path: path.join(__dirname, "dist-hugo"),
    filename: "[name].js",
    publicPath: "",
    clean: false, // Replaces CleanWebpackPlugin
  },
  resolve: {
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "path": false,
      "fs": false,
      "os": false,
      "url": false,
      "querystring": false,
      "http": false,
      "https": false,
      "zlib": false,
    },
    alias: {
      "window": path.join(__dirname, "src", "polyfills.js"),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.(png|eot|woff|woff2|ttf|svg|gif)$/,
        type: "asset/resource",
        generator: {
          filename: "[hash][ext][query]",
        },
      },
      {
        test: /decap-cms-app/,
        use: {
          loader: "imports-loader",
          options: {
            type: "commonjs",
            imports: ["single window self"],
          },
        },
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new AssetsPlugin({
      filename: "webpack.json",
      path: path.join(process.cwd(), "site/data"),
      prettyPrint: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/fonts/",
          to: "fonts/",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      filename: "admin/index.html",
      template: "src/cms.html",
      inject: false,
    }),
    new CssMinimizerPlugin(),
  ],
};
