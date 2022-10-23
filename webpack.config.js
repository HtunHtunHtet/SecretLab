const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: './src/index.js',
    mode: 'development', // 'production' <- production flag
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery', //jquery
        })
    ]
};
