module.exports = {
  presets: [
    [ '@babel/preset-env', { targets: { node: '10' } } ],
    '@babel/preset-typescript'
  ],
  "plugins": [
    // in theory this plugin gets enabled by telling preset-env that we're targetting node 10
    // in practice it does not, so we manually have to enable it here
    "@babel/plugin-proposal-class-properties"
  ]
}