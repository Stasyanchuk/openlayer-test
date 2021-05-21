const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        openLayersMapPage: path.join(__dirname, 'src', 'main', 'resources', 'src', 'js', 'openLayersMap.js'),
        icon: path.join(__dirname, 'src', 'main', 'resources', 'src', 'js', 'pages', 'icon.png'),
        ship: path.join(__dirname, 'src', 'main', 'resources', 'src', 'js', 'pages', 'ship.png')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // это будет применяться к файлам `.css`
            // А ТАКЖЕ к секциям `<style>` внутри файлов `.vue`
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif|svg|ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    resolve: {
        modules: [
            path.join(__dirname, 'src', 'main', 'resources','src', 'js'),
            path.join(__dirname, 'src', 'main', 'resources','src', 'css'),
            path.join(__dirname, 'node_modules'),
        ],
    }
};