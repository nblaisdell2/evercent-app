let plugins = ["@babel/plugin-transform-runtime"];
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  plugins.push("react-refresh/babel");
}

module.exports = {
  presets: [
    "@babel/preset-env", //compiling ES2015+ syntax
    "@babel/preset-react", //for react
    "@babel/preset-typescript", // for typescript
  ],
  plugins: plugins,
};
