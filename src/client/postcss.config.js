const tailwindcss = require("tailwindcss");

tailwindcss["config"] = "./tailwind.config.js";

module.exports = {
  plugins: ["postcss-preset-env", tailwindcss],
};
