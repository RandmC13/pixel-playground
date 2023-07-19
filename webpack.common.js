const path = require('path');

module.exports = {
    entry: {
        app: './src/sketch.js',
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
          }
        ]
      },
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public/dist'),
        publicPath: "/dist/",
        clean: true,
      }
};