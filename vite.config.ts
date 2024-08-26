/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { envDir, sourceDir, manualChunks, getSourceDir } from './scripts/build'
// import ElementPlus from 'unplugin-element-plus/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import GenerateSprite from './scripts/generateSprite'
import MinifyXmlTemplateStrings from './scripts/minifyXmlTemplateStrings'
import PostCssVariableCompress from 'postcss-variable-compress'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, envDir)
    console.log('----env: ')
    console.log(env)
    console.log(process.env.NODE_ENV)

    const { VITE_APP_IP, VITE_UI_TYPE } = env

    return {
        envDir,
        define: {
            __TRUE__: true,
        },
        base: env.VITE_DEPLOY_BASE_URL,
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
        },
        resolve: {
            alias: {
                '@': sourceDir,
                '@public': getSourceDir(`src/views/UI_PUBLIC`),
                '@ui': getSourceDir(`src/views/${VITE_UI_TYPE}`),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `
                        $GLOBAL_UI_TYPE: ${VITE_UI_TYPE};
                    `,
                },
            },
            postcss: {
                plugins: process.env.NODE_ENV === 'development' ? [] : [PostCssVariableCompress([(name: string) => !name.startsWith('--el')])],
            },
        },
        plugins: [
            GenerateSprite({
                src: `sprite/${VITE_UI_TYPE}-sprite/sprite/*.png`,
                dist: path.resolve(__dirname, 'src/components/sprite/'),
            }),
            MinifyXmlTemplateStrings(),
            Vue(),
            // 全局导入将会删除
            // ElementPlus({}),
            /**
             * 自动导入 API ，不用每次都 import
             */
            AutoImport({
                imports: [
                    // {
                    //     from: 'vue',
                    //     imports: ['App'],
                    //     type: true,
                    // },
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
                dts: 'src/types/declaration-files/auto-import.d.ts',
                eslintrc: {
                    enabled: true,
                    filepath: './.eslintrc-auto-import.json',
                    globalsPropValue: true,
                },
                defaultExportByFilename: false,
                dirs: [
                    // 添加需要自动导入的模块
                    // './src/views/UI_PUBLIC/page/**/*.vue',
                    './src/hooks',
                    './src/api',
                    './src/stores',
                    './src/utils',
                    './src/utils/ocx',
                    './src/utils/websocket',
                    './src/utils/canvas',
                    './src/components/*.vue',
                    './src/components/**/*.vue',
                ],
            }),
            Components({
                resolvers: [ElementPlusResolver()],
                dts: 'src/types/declaration-files/components.d.ts',
                dirs: ['./src/components/'],
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
        ],
        // components: [
        // ],
        build: {
            assetsInlineLimit: 0,
            cssCodeSplit: false,
            minify: 'esbuild',
            target: 'esnext',
            // 设置 source map 选项
            sourcemap: false,
            rollupOptions: {
                output: {
                    chunkFileNames: '[hash].js',
                    entryFileNames: '[hash].js',
                    assetFileNames: '[name].[ext]',
                    manualChunks,
                },
            },
        },
        optimizeDeps: {
            esbuildOptions: {
                plugins: [],
            },
        },
    }
})
