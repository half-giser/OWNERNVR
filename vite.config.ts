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
import { transpileVueTemplatePropTypes, minifyXmlTemplateStrings, postMinifyCodes, postRemoveCSSLink } from './scripts/transformers'
import { cleanUpTempFiles } from './scripts/cleanTempFiles'
import BasicSSL from '@vitejs/plugin-basic-ssl'
// import PostCssVariableCompress from 'postcss-variable-compress'
import PostCssPresetEnv from 'postcss-preset-env'
// 生产环境使用的 CSS 文件压缩工具，能更快的部署优化后的样式模块（确保最终样式的最小化）
import CssNano from 'cssnano'
import { visualizer as Visualizer } from 'rollup-plugin-visualizer'
import optimizeDepsIncludes from './scripts/optimizeDeps'
import { STATS_FILE_PATH, TYPE_AUTO_IMPORT_FILE_PATH, TYPE_COMPONENTS_FILE_PATH } from './scripts/filePaths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const split = mode.split(',')
    // 获取环境目录下 /config/*，.env & .env[split[0]] 文件内容
    const env = loadEnv(split[0], envDir)

    env.VITE_UI_TYPE = split[1] || env.VITE_UI_TYPE
    console.log(env.VITE_UI_TYPE)

    const { VITE_APP_IP, VITE_UI_TYPE } = env
    const VITE_PACKAGE_VER = Math.ceil(Date.now() / 1000 / 60).toString(36)

    return {
        // global constant, 不论开发、生产环境都能使用此处的定义
        define: {
            'import.meta.env.NODE_ENV': env.NODE_ENV,
            'import.meta.env.VITE_UI_TYPE': JSON.stringify(env.VITE_UI_TYPE),
            'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL),
            'import.meta.env.VITE_APP_IP': JSON.stringify(env.VITE_APP_IP || ''),
            'import.meta.env.VITE_PACKAGE_VER': JSON.stringify(VITE_PACKAGE_VER),
            'import.meta.env.VITE_P2P_IS_TEST': JSON.stringify(env.VITE_P2P_IS_TEST || ''),
            'import.meta.env.VITE_P2P_BASE_URL': JSON.stringify(env.VITE_P2P_BASE_URL || ''),
            'import.meta.env.VITE_P2P_VISIT': JSON.stringify(env.VITE_P2P_VISIT || ''),
            'import.meta.env.VITE_P2P_NAT': JSON.stringify(env.VITE_P2P_NAT || ''),
            'import.meta.env.VITE_P2P_NAT_PORT': JSON.stringify(env.VITE_P2P_NAT_PORT || ''),
            'import.meta.env.VITE_P2P_SN': JSON.stringify(env.VITE_P2P_SN || ''),
            'import.meta.env.VITE_P2P_ADMIN': JSON.stringify(env.VITE_P2P_ADMIN || ''),
            'import.meta.env.VITE_P2P_PASSWORD': JSON.stringify(env.VITE_P2P_PASSWORD || ''),
        },
        base: './',
        // Vite 构建工具，开发模式下，预构建依赖（利用 strong cache, 缓存所有源代码中使用到的依赖裸模块）
        server: {
            port: 9000,
            proxy: {
                '/devapi': {
                    target: `${env.VITE_APP_HTTPS === 'true' ? 'https' : 'http'}://${VITE_APP_IP}/`,
                    changeOrigin: true,
                    ws: true,
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
                    secure: false,
                },
                '/p2p': {
                    target: `${env.VITE_P2P_VISIT}/`,
                    changeOrigin: true,
                    ws: true,
                    rewrite: (path) => path.replace(/^\/p2p/, ''),
                    secure: false,
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
            // 样式预处理器-转换 sass/scss 文件
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        $GLOBAL_UI_TYPE: ${VITE_UI_TYPE};
                    `,
                    api: 'modern-compiler',
                },
            },
            // 样式兼容处理- 执行样式文件压缩以及样式兼容性（针对不同浏览器）
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
                                  // 使用本插件目的：稳定的使用现代CSS特性，根据支持的浏览器目标，自动添加 polyfill 以达到浏览器兼容效果
                                  // 此处配置为:has的最低支持版本
                                  browsers: ['Chrome >= 87', 'Firefox >= 78', 'Edge >= 88', 'Safari >= 14'],
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
                additionalData: `$sprite-version:'${VITE_PACKAGE_VER}';$sprite-p2p-url:'${env.VITE_P2P_VISIT || ''}';`,
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
                imports: ['vue', 'vue-router', 'pinia'],
                // 按需自动导入ElementPlus
                resolvers: [ElementPlusResolver()],
                dts: TYPE_AUTO_IMPORT_FILE_PATH,
                // 配合 auto import 插件自动生成 ESlint 校验规则，把自动导入的 API 声明成全局变量，这样能避免在全局使用自动导入的API时，出现"未定义变量"的报错
                // 但是也是在首次运行之后，才能到达上述效果，所以不进行配置也影响不大。
                // eslintrc: {
                //     enabled: true,
                //     filepath: './.eslintrc-auto-import.json',
                //     globalsPropValue: true,
                // },
                defaultExportByFilename: false,
                dirsScanOptions: {
                    types: false, // Disable auto import the types under the directories
                },
                dirs: [
                    // 添加需要自动导入的模块
                    './src/hooks',
                    './src/api',
                    './src/stores',
                    './src/utils',
                    './src/utils/ocx',
                    './src/utils/p2p',
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
                globs: ['**/Base*.vue', '**/{Intel,Alarm,Record}Base*.vue', '**/*Pop.vue', '**/*Item.vue', '**/*Selector.vue', '**/!(Function)Panel.vue'],
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
                      postRemoveCSSLink({
                          src: `dist/${VITE_UI_TYPE}/index.html`,
                      }),
                  ],
        ),
        // 生产打包配置
        build: {
            outDir: `dist/${env.VITE_UI_TYPE}`,
            assetsInlineLimit: 0,
            // 阻止将 CSS 样式文件放入 aysnc js chunk
            cssCodeSplit: false,
            minify: 'esbuild',
            target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
            // target: ['chrome105', 'edge105', 'firefox121', 'safari15.4'],
            // 设置 source map 选项
            sourcemap: false,
            // 用户体验在当前的浏览器环境中，主要限制：脚本下载速度（network）以及浏览器主线程（CPU）解析脚本的速度，故而需要限制打包后的 chunk 体积
            chunkSizeWarningLimit: 1024,
            rollupOptions: {
                output: {
                    chunkFileNames: split[0] === 'dev' ? '[name].[hash].js' : '[hash].js',
                    entryFileNames: split[0] === 'dev' ? '[name].[hash].js' : '[hash].js',
                    assetFileNames: () => {
                        // if (assetInfo.names && assetInfo.names.some((item) => item.endsWith('.css'))) {
                        //     return '[hash].[ext]'
                        // }
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
