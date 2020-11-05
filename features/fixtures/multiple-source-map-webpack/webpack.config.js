module.exports = {
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      // Force webpack to produce the smallest possible chunks by asking for a
      // max size of 2 bytes
      minSize: 1,
      maxSize: 2,
    }
  }
}
