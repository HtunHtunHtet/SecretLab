const path = require('path');
module.exports = {
    entry: './src/index.js',
    mode: 'development', // 'production' <- production flag
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
