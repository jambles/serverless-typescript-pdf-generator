const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const CopyWebpacPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: slsw.lib.entries,
    target: 'node',
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, '.webpack'),
        filename: '[name].js'
    },
    plugins: [
        new CopyWebpacPlugin([
            {from: 'wkhtmltopdf'}
        ])
    ],
    module: {
        loaders: [
            {test: /.ts$/, loader: 'ts-loader', exclude: [/node_modules/, '*.spec.ts']}
        ]
    }
};
