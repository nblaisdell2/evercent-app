const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

// Needed for copying static assets (images) to build output folder
const CopyPlugin = require("copy-webpack-plugin");

// Needed for HMR when making changes during development
const ReactRefreshWebpackPluginConfig = new ReactRefreshWebpackPlugin();

// Needed to run locally
const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + "/public/index.html",
  favicon: "./src/client/public/favicon.ico",
  filename: "index.html",
  inject: "body",
});

const NodePolyfillPluginConfig = new NodePolyfillPlugin();
const DotenvPluginConfig = new Dotenv();

// Needed since React Refresh/HMR cannot run in production
const isDevelopment =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test";

/*We are basically telling webpack to take index.js from entry. Then check for all file extensions in resolve. 
After that apply all the rules in module.rules and produce the output and place it in main.js in the public folder.*/
module.exports = {
  /** "mode"
   * the environment - development, production, none. tells webpack
   * to use its built-in optimizations accordingly. default is production
   */
  mode: isDevelopment ? "development" : "production",
  /** "entry"
   * the entry point
   */
  entry: "./src/client/index.tsx",
  output: {
    /** "path"
     * the folder path of the output file
     */
    path: path.resolve(__dirname, "dist"),
    /** "filename"
     * the name of the output file
     */
    filename: "main.js",
  },
  devtool: "source-map",
  plugins: [
    HTMLWebpackPluginConfig,
    NodePolyfillPluginConfig,
    DotenvPluginConfig,
    new CopyPlugin({
      patterns: [{ from: "public/*.png", noErrorOnMissing: true }],
    }),
    isDevelopment && ReactRefreshWebpackPluginConfig,
  ].filter(Boolean),
  /** "target"
   * setting "node" as target app (server side), and setting it as "web" is
   * for browser (client side). Default is "web"
   */
  target: "web",
  devServer: {
    /** "port"
     * port of dev server
     */
    port: "3000",

    // /** "static"
    //  * This property tells Webpack what static file it should serve
    // */
    static: {
      directory: path.join(__dirname, "public"),
    },

    /** "open"
     * opens the browser after server is successfully started
     */
    open: true,
    hot: true,
    liveReload: false,
    compress: true,
    client: {
      logging: "warn",
    },
  },
  watchOptions: {
    poll: true,
  },
  resolve: {
    /** "extensions"
     * If multiple files share the same name but have different extensions, webpack will
     * resolve the one with the extension listed first in the array and skip the rest.
     * This is what enables users to leave off the extension when importing
     */
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
    fallback: {
      fs: false,
    },
  },
  module: {
    /** "rules"
     * This says - "Hey webpack compiler, when you come across a path that resolves to a '.js or .jsx'
     * file inside of a require()/import statement, use the babel-loader to transform it before you
     * add it to the bundle. And in this process, kindly make sure to exclude node_modules folder from
     * being searched"
     */
    rules: [
      {
        test: /\.(js|jsx)$/, //kind of file extension this rule should look for and apply in test
        exclude: /node_modules/, //folder to be excluded
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              plugins: [
                isDevelopment && require.resolve("react-refresh/babel"),
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, "src/styles"),
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
};
