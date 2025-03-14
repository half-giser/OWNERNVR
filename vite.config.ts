/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
import { defineConfig, loadEnv } from 'vite'
import { type AcceptedPlugin } from 'postcss'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { envDir, sourceDir, manualChunks, getSourceDir } from './scripts/build'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import GenerateSprite from './scripts/generateSprite'
import { transpileVueTemplatePropTypes, minifyXmlTemplateStrings, postMinifyCodes } from './scripts/transformers'
import { cleanUpTempFiles } from './scripts/cleanTempFiles'
import BasicSSL from '@vitejs/plugin-basic-ssl'
// import PostCssVariableCompress from 'postcss-variable-compress'
import PostCssPresetEnv from 'postcss-preset-env'
import CssNano from 'cssnano'
import { visualizer as Visualizer } from 'rollup-plugin-visualizer'
import optimizeDepsIncludes from './scripts/optimizeDeps'
import { STATS_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH } from './scripts/filePaths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const split = mode.split(',')
    const env = loadEnv(split[0], envDir)

    env.VITE_UI_TYPE = split[1] || env.VITE_UI_TYPE
    console.log(env.VITE_UI_TYPE)

    const { VITE_APP_IP, VITE_UI_TYPE } = env
    const VITE_PACKAGE_VER = Math.ceil(Date.now() / 1000 / 60).toString(36)

    return {
        // envDir,
        define: {
            'import.meta.env.NODE_ENV': env.NODE_ENV,
            'import.meta.env.VITE_UI_TYPE': JSON.stringify(env.VITE_UI_TYPE),
            'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL),
            'import.meta.env.VITE_APP_IP': JSON.stringify(env.VITE_APP_IP || ''),
            'import.meta.env.VITE_PACKAGE_VER': JSON.stringify(VITE_PACKAGE_VER),
            'import.meta.env.VITE_P2P_URL': JSON.stringify(env.VITE_P2P_URL || ''),
        },
        base: './',
        server: {
            port: 9000,
            proxy: {
                '/devapi': {
                    target: `http://${VITE_APP_IP}/`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/devapi/, ''),
                    configure: (proxy) => {
                        proxy.on('proxyReq', (proxyReq, req) => {
                            // NVR 设备端会读取 Content-Length，必须是首字母大写的，而proxy转发后，会把header的key全部转为小写，
                            // 设备读取不到Content-Length，则不返回，dev server控制台打印错误： [vite] http proxy error: error: socket hang up
                            if (req.headers['content-length']) {
                                const len = req.headers['content-length'] as string
                                proxyReq.removeHeader('content-length')
                                proxyReq.setHeader('Content-Length', len)
                            }
                        })
                    },
                },
            },
            https: env.VITE_APP_HTTPS === 'true' ? {} : false,
        },
        resolve: {
            alias: {
                '@': sourceDir,
                '@public': getSourceDir('src/views/UI_PUBLIC'),
                '@ui': getSourceDir(`src/views/${VITE_UI_TYPE}`),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        $GLOBAL_UI_TYPE: ${VITE_UI_TYPE};
                    `,
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: ([] as AcceptedPlugin[]).concat(
                    process.env.NODE_ENV === 'development'
                        ? []
                        : [
                              // 压缩的CSS变量只能在CSS/SCSS中使用，不能在template、typescript等样式外的文件中引用
                              // PostCssVariableCompress([(name: string) => !name.startsWith('--el')]),
                              CssNano({
                                  preset: 'default',
                              }),
                              PostCssPresetEnv({
                                  // 此处配置为:has的最低支持版本
                                  browsers: ['Chrome >= 105', 'Firefox >= 121', 'Edge >= 105', 'Safari >= 15.4'],
                              }),
                          ],
                ),
            },
        },
        plugins: [
            cleanUpTempFiles(),
            GenerateSprite({
                src: `sprite/${VITE_UI_TYPE}-sprite/sprite/*.png`,
                minify: process.env.NODE_ENV !== 'development',
                additionalData: `$sprite-version:'${VITE_PACKAGE_VER}';$sprite-p2p-url:'${env.VITE_P2P_URL}';`,
            }),
            minifyXmlTemplateStrings(),
            transpileVueTemplatePropTypes(),
            Vue({
                features: {
                    optionsAPI: false,
                },
            }),
            /**
             * 自动导入 API ，不用每次都 import
             */
            AutoImport({
                imports: [
                    'vue',
                    'vue-router',
                    'pinia',
                    // {
                    //     from: 'vue-router',
                    //     imports: [
                    //         'RouteLocationRaw',
                    //         'RouteMeta',
                    //         'RouteRecordRaw',
                    //         'RouteLocationMatched',
                    //         'createRouter',
                    //         'createWebHistory',
                    //         'RouteLocationNormalized',
                    //         'RouteLocationNormalizedLoaded',
                    //     ],
                    //     type: true,
                    // },
                    // {
                    //     from: 'element-plus',
                    //     imports: ['FormInstance', 'FormRules'],
                    //     type: true,
                    // },
                ],
                //按需自动导入ElementPlus
                resolvers: [ElementPlusResolver()],
                dts: TYPE_AUTO_IMPORT_FILE_PATH,
                // eslintrc: {
                //     enabled: true,
                //     filepath: './.eslintrc-auto-import.json',
                //     globalsPropValue: true,
                // },
                defaultExportByFilename: false,
                dirsScanOptions: {
                    types: false, // Enable auto import the types under the directories
                },
                dirs: [
                    // 添加需要自动导入的模块
                    './src/hooks',
                    './src/api',
                    './src/stores',
                    './src/utils',
                    './src/utils/ocx',
                    {
                        glob: './src/utils/websocket',
                        types: true,
                    },
                    {
                        glob: './src/utils/canvas',
                        types: true,
                    },
                    {
                        glob: './src/utils/wasmPlayer',
                        types: true,
                    },
                    './src/components/*.vue',
                    './src/components/**/*.vue',
                    {
                        glob: './src/types/apiType',
                        types: true,
                    },
                ],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
                dts: TYPE_COMPONENTS_FILE_PATH,
                globs: ['**/Base*.vue', '**/{Intel,Alarm,Record}Base*.vue', '**/*Pop.vue', '**/*Item.vue', '**/!(Function)Panel.vue'],
                // dirs: ['./src/components/'],
                deep: true,
            }),
            createHtmlPlugin({
                minify: true,
                inject: {
                    data: {
                        appTitle: env.VITE_APP_TITLE,
                        appDesc: env.VITE_APP_DESC,
                        appKeywords: env.VITE_APP_KEYWORDS,
                    },
                },
            }),
        ].concat(
            split[0] === 'dev'
                ? [
                      Visualizer({
                          open: false,
                          gzipSize: true,
                          brotliSize: true,
                          filename: STATS_FILE_PATH,
                      }),
                  ].concat(
                      env.VITE_APP_HTTPS === 'true'
                          ? [
                                BasicSSL({
                                    /** name of certification */
                                    name: 'test',
                                    /** custom trust domains */
                                    domains: ['*.custom.com'],
                                    /** custom certification directory */
                                    certDir: './.temp',
                                }),
                            ]
                          : [],
                  )
                : [
                      postMinifyCodes({
                          src: `dist/${VITE_UI_TYPE}/**/*.js`,
                          ui: VITE_UI_TYPE,
                      }),
                  ],
        ),
        build: {
            outDir: `dist/${env.VITE_UI_TYPE}`,
            assetsInlineLimit: 0,
            cssCodeSplit: false,
            minify: 'esbuild',
            // target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
            target: ['chrome105', 'edge105', 'firefox121', 'safari15.4'],
            // 设置 source map 选项
            sourcemap: false,
            chunkSizeWarningLimit: 1024,
            rollupOptions: {
                output: {
                    chunkFileNames: split[0] === 'dev' ? '[name].[hash].js' : '[hash].js',
                    entryFileNames: split[0] === 'dev' ? '[name].[hash].js' : '[hash].js',
                    assetFileNames: (assetInfo) => {
                        if (assetInfo.names && assetInfo.names.some((item) => item.endsWith('.css'))) {
                            return '[hash].[ext]'
                        }
                        return '[name].[ext]'
                    },
                    manualChunks,
                },
            },
        },
        optimizeDeps: {
            include: optimizeDepsIncludes,
        },
    }
})
