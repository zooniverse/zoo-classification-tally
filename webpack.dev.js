// const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.js'
  },
  module:{
    rules:[
      {
        test:/\.css$/,
        use:['style-loader','css-loader']
      }
    ]
  },
  devServer: {
    host: 'local.zooniverse.org',
    port: 8080,
    hot: true,
    https: true
  },
  cache: true,
  performance: {
    hints: false
  },
  externals: {
    jquery: 'jQuery'
  },
  plugins: [
    // TODO: configure the dev server to build and serve from the dist dir
    // new CleanWebpackPlugin(['dist'], {
    //     root:     __dirname,
    //     verbose:  true,
    //     dry:      false
    //   }
    // ),
    new HtmlWebpackPlugin({
      title: 'Dev Tally App',
      template: 'src/template_index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    pathinfo: true,
    path: __dirname,
    filename: 'index_dev.js',
  }
}
