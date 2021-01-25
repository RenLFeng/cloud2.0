const autoprefixer = require('autoprefixer');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

const productionGzipExtensions = ['js', 'css'];

const isProduction = process.env.NODE_ENV === 'production';

// 代码压缩
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    publicPath: '',
    outputDir:'cloud_dist',
    css: {
        loaderOptions: {
            postcss: {
                plugins: [
                    autoprefixer(),
                    require('postcss-pxtorem')({
                        rootValue: 37.5,
                        selectorBlackList: ['.biggp-'],
                        propList: ['*'],
                    }),
                ]
            }
        }
    },
    pages: {
        index: {
            entry: 'src/main.js',
            template: 'public/index.html',
            filename: 'index.html',
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        },
        daping: 'src/daping.js'
    },
    chainWebpack: config => {
        if (isProduction) {
            // 删除预加载
            config.plugins.delete('preload');
            config.plugins.delete('prefetch');
            // 压缩代码
            config.optimization.minimize(true);
            // 分割代码
            // config.optimization.splitChunks({
            //     chunks: 'all'
            // })
        };
    },
    configureWebpack: config => {
        // if (isProduction) {
        //     // 代码压缩
        //     config.plugins.push(
        //         new UglifyJsPlugin({
        //             uglifyOptions: {
        //                 output:{
        //                     comments:false
        //                 },
        //                 //生产环境自动删除console
        //                 compress: {
        //                     // warnings: false, // 若打包错误，则注释这行
        //                     drop_debugger: true,
        //                     drop_console: true,
        //                     pure_funcs: ['console.log']
        //                 }
        //             },
        //             sourceMap: false,
        //             parallel: true
        //         })
        //     )
        //        console.log( 'str'.replace(/<.*?>/g,''));
        // };
        // if (isProduction) {

        //     config.plugins.push(new CompressionWebpackPlugin({

        //         algorithm: 'gzip',

        //         test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),

        //         threshold: 10240,

        //         minRatio: 0.8

        //     }))

        // };
    },
    productionSourceMap: false,
    lintOnSave: false,
    devServer: {
        port:8081,
           //  proxy: 'http://192.168.0.2:9982'
        proxy: 'http://192.168.1.133:9982'
        // proxy:'http://127.0.0.1:9985'
        //  proxy: 'http://192.168.40.104:9982'
        // proxy:'http://localhost:9982'
        // proxy: 'https://www2.exsoft.com.cn'
    }
}