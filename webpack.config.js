const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const fs = require("fs");
const environment = require("./configuration/environment");
const veevaConfig = require("./configuration/veeva.config");

const templateFiles = fs.readdirSync(environment.paths.source)
    .map(name => {
        const template = fs.readdirSync(path.resolve(environment.paths.source, name))
            .filter((file) => path.extname(file).toLowerCase() === '.html').shift()
        return { name, template }
    })

const htmlPlugin = templateFiles.map(({ name, template }) => (
    new HtmlWebpackPlugin({
        inject: true,
        hash: false,
        chunks: [name, 'CLM_Shared_Resources'],
        filename: path.resolve(environment.paths.output, name, template),
        template: path.resolve(environment.paths.source, name, template)
    })
))

const copyPluginPatterns = fs.readdirSync(environment.paths.source)
    .map(name => (
        {
            from: `src/${name}/assets/images`,
            to: `${name}/assets/images`,
            toType: 'dir',
            globOptions: {
                ignore: ['*.DS_Store', 'Thumbs.db'],
            },
            noErrorOnMissing: true,
        }

    ));

const copyPluginThumbs = fs.readdirSync(environment.paths.source)
    .map(name => (
        {
            from: `src/${name}/${name}-thumb.jpg`,
            to: `${name}`,
            toType: 'dir',
            globOptions: {
                ignore: ['*.DS_Store', 'Thumbs.db'],
            },
            noErrorOnMissing: true,
        }
    ));


const copyPluginFullThumbs = fs.readdirSync(environment.paths.source)
    .map(name => (
        {
            from: `src/${name}/${name}-full.jpg`,
            to: `${name}`,
            toType: 'dir',
            globOptions: {
                ignore: ['*.DS_Store', 'Thumbs.db'],
            },
            noErrorOnMissing: true,
        }
    ));

const copyPluginVeevaLib = [{
    from: 'src/CLM_Shared_Resources/js/veeva-library.js',
    to: 'CLM_Shared_Resources/js/veeva-library.js'
}]

const config = {
    entry: veevaConfig.pages,
    output: {
        filename: '[name]/js/bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(png|gif|jpe?g|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                    },
                ],
            },
            {
                test: /\.(eot|ttf|woff|woff2|otf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: 'CLM_Shared_Resources/fonts/[name].[ext]',
                            publicPath: '../',
                        },
                    },
                ],
            },
        ],

    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name]/css/[name].css',
        }),
        new CopyWebpackPlugin({
            patterns: copyPluginPatterns
                .concat(copyPluginThumbs)
                .concat(copyPluginVeevaLib)
                .concat(copyPluginFullThumbs)
        })
    ].concat(htmlPlugin)
}

module.exports = config