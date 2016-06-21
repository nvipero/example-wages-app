/*global process*/
const path = require("path");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const validate = require("webpack-validator");
const parts = require("./config/parts");

const PATHS = {
  app: path.join(__dirname, "app"),
  build: path.join(__dirname, "dist"),
  style: path.join(__dirname, "app/sass", "main.scss")
};

const common = {
  entry: {
    style: PATHS.style,
    index: PATHS.app
  },

  output: {
    path: PATHS.build,
    filename: "[name].js"
  },

  module: {
    preLoaders: [
      {
        test: /\.js?$/,
        loaders: ["eslint"],
        include: PATHS.app
      }
    ],
    loaders: [
      {
        test: /\.js?$/,
        loaders: ["babel?cacheDirectory"],
        include: PATHS.app,
        exclude: ["server.js"]
      }
    ]
  }
};

var config;
switch(process.env.npm_lifecycle_event) {
  case "build":
    config = merge(
      common,
      {
        devtool: "source-map",
        output: {
          path: PATHS.build,
          publicPath: "/",
          filename: "[name].[chunkhash].js",
          chunkFilename: "[chunkhash].js"
        }
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
        "process.env.NODE_ENV",
        "production"
      ),
      parts.minify(),
      parts.extractCSS(PATHS.style)
    );
    break;

  default:
    config = merge(
      common,
      {
        devtool: "eval-source-map"
      },
      parts.setupCSS(PATHS.style),
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}
module.exports = validate(config);
