const path = require('path');
const webpack = require('webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const { getJsLoader } = require('@proton/pack/webpack/js.loader');
const getCssLoaders = require('@proton/pack/webpack/css.loader');
const getAssetsLoaders = require('@proton/pack/webpack/assets.loader');
const getOptimizations = require('@proton/pack/webpack/optimization');
const parseEnvVar = require('./tools/env-var.parser');

const SUPPORTED_TARGETS = ['chrome', 'firefox'];

const ENV = parseEnvVar('NODE_ENV', 'development', String);
const BUILD_TARGET = parseEnvVar('BUILD_TARGET', SUPPORTED_TARGETS[0], String);
const RUNTIME_RELOAD = parseEnvVar('RUNTIME_RELOAD', false, Boolean);
const RESUME_FALLBACK = parseEnvVar('RESUME_FALLBACK', false, Boolean);

if (!SUPPORTED_TARGETS.includes(BUILD_TARGET)) {
    throw new Error(`Build target "${BUILD_TARGET}" is not supported`);
}

console.log(`Building with env`, JSON.stringify({ ENV, BUILD_TARGET, RUNTIME_RELOAD, RESUME_FALLBACK }, null, 4));

const production = ENV === 'production';
const options = {
    isProduction: production,
    browserslist: production
        ? `> 0.5%, not IE 11, Firefox ESR, Safari 11`
        : 'last 1 chrome version, last 1 firefox version, last 1 safari version',
};

module.exports = {
    ...(production
        ? {
              mode: 'production',
              devtool: 'source-map',
          }
        : {
              mode: 'development',
              devtool: 'inline-source-map',
          }),
    entry: {
        background: path.resolve(__dirname, './src/worker/index.ts'),
        content: path.resolve(__dirname, './src/content/index.ts'),
        dropdown: path.resolve(__dirname, './src/content/injections/dropdown/index.tsx'),
        notification: path.resolve(__dirname, './src/content/injections/notification/index.tsx'),
        onboarding: path.resolve(__dirname, './src/pages/onboarding/index.tsx'),
        settings: path.resolve(__dirname, './src/pages/settings/index.tsx'),
        popup: path.resolve(__dirname, './src/popup/index.tsx'),
    },
    module: {
        strictExportPresence: true,
        rules: [
            getJsLoader({ ...options, hasReactRefresh: !production }),
            ...getCssLoaders(options),
            ...getAssetsLoaders(),
        ],
    },
    optimization: {
        ...getOptimizations(options),
        runtimeChunk: false,
        splitChunks: undefined,
    },
    resolve: {
        extensions: ['.js', '.tsx', '.ts'],
        fallback: {
            crypto: false,
            buffer: false,
            stream: false,
            iconv: false,
            path: false,
            punycode: false,
        },
    },
    cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve('./node_modules/.cache/webpack'),
        buildDependencies: {
            defaultWebpack: ['webpack/lib/'],
            config: [__filename],
        },
    },
    output: {
        filename: '[name].js',
        /* webpack can sometimes prefix chunks with an `_`
        which is disallowed in an extension's file. Force chunks
        to be prefixed correctly. This is mostly due to the presence
        of lazy loaded files in asmcrypto.js */
        chunkFilename: 'chunk.[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        assetModuleFilename: 'assets/[hash][ext][query]',
        publicPath: '/',
    },
    plugins: [
        new webpack.EnvironmentPlugin({ NODE_ENV: ENV }),
        new webpack.DefinePlugin({
            ENV: JSON.stringify(ENV),
            BUILD_TARGET: JSON.stringify(BUILD_TARGET),
            RUNTIME_RELOAD: RUNTIME_RELOAD,
            RESUME_FALLBACK: RESUME_FALLBACK,
        }),
        new ESLintPlugin({
            extensions: ['js', 'ts'],
            overrideConfigFile: path.resolve(__dirname, '.eslintrc.js'),
        }),
        new MiniCssExtractPlugin({
            filename: 'styles/[name].css',
        }),
        new CopyPlugin({
            patterns: [{ from: 'public' }, { from: `manifest-${BUILD_TARGET}.json`, to: 'manifest.json' }],
        }),
    ],
};
