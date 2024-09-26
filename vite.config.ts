/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
import path from 'node:path'
import { defineConfig, loadEnv, type PluginOption } from 'vite'
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
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const split = mode.split(',')
    const env = loadEnv(split[0], envDir)

    env.VITE_UI_TYPE = split[1] || env.VITE_UI_TYPE
    console.log(env.VITE_UI_TYPE)

    const { VITE_APP_IP, VITE_UI_TYPE } = env

    const devPlugin: PluginOption[] = [
        visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ]

    const buildPlugin: PluginOption[] = []

    return {
        // envDir,
        define: {
            'import.meta.env.NODE_ENV': env.NODE_ENV,
            'import.meta.env.VITE_UI_TYPE': JSON.stringify(env.VITE_UI_TYPE),
            'import.meta.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL),
            'import.meta.env.VITE_APP_IP': JSON.stringify(env.VITE_APP_IP || ''),
            'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME),
            'import.meta.env.VITE_APP_TITLE': JSON.stringify(env.VITE_APP_TITLE),
            'import.meta.env.VITE_APP_DESC': JSON.stringify(env.VITE_APP_DESC),
            'import.meta.env.VITE_APP_KEYWORDS': JSON.stringify(env.VITE_APP_KEYWORDS),
            'import.meta.env.VITE_APP_TYPE': JSON.stringify(env.VITE_APP_TYPE),
            'import.meta.env.VITE_APP_COPYRIGHT': JSON.stringify(env.VITE_APP_COPYRIGHT),
            'import.meta.env.VITE_APP_ICP_NUMBER': JSON.stringify(env.VITE_APP_ICP_NUMBER),
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
        ].concat(split[0] === 'dev' ? devPlugin : buildPlugin),
        // components: [
        // ],
        build: {
            outDir: `dist/${env.VITE_UI_TYPE}`,
            assetsInlineLimit: 0,
            cssCodeSplit: false,
            minify: 'esbuild',
            target: 'esnext',
            // 设置 source map 选项
            sourcemap: false,
            chunkSizeWarningLimit: 1024,
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
