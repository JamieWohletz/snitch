var path = require('path');
var webpack = require('webpack');
var src = path.resolve(__dirname, 'src');
var demo = path.resolve(__dirname, 'demo', 'vendor');
var dist = path.resolve(__dirname, 'dist');
var outPath;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.NODE_ENV;
var libraryName = 'snitch';
var plugins = [
  new webpack.BannerPlugin(
    'Snitchjs, by Jamie Wohletz.\nError logging and event tracking in the browser.\nMIT License.'
  )
];
var outputFile;

if (env === 'production') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = `${libraryName}.min.js`;
  outPath = dist;
} else if (env === 'dev') {
  outputFile = `${libraryName}.js`;
  outPath = dist;
} else if (env === 'demo') {
  outputFile = `${libraryName}.js`
  outPath = demo;
}

module.exports = {
  entry: './src/snitch.js',
  output: {
    path: outPath,
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: src,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: src,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: plugins
};
