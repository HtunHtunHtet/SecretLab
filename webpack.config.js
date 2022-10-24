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
            // Can use either $ or jQuery , increase developer experience.
            $: 'jquery',
            jQuery: 'jquery',
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};
