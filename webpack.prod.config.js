var webpack = require("webpack");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = require('./webpack.config.js');

delete module.exports.devtool;

module.exports.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
);

module.exports.optimization = {
  runtimeChunk: false,
  splitChunks: {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
    },
  },
  minimizer: [
    new UglifyJsPlugin({
      cache: true,
      parallel: true,
      sourceMap: true
    })
  ]
};

module.exports.module.rules.forEach(rule => {
  delete rule.exclude;
  return rule;
});
