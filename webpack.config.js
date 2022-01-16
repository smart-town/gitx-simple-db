const path = require('path')
module.exports = {
    mode: 'development',
    entry: {
        'gitdb': path.resolve(__dirname, 'src/index.js')
    },
    output: {
        library: '[name]',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
}