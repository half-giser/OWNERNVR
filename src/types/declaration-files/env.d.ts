/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
/// <reference types="vite/client" />

declare module '*.vue' {
    import { type DefineComponent } from 'vue'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>
    export default component
}

// declare const __TRUE__: boolean
// declare const __UI__: string

interface ImportMetaEnv {
    readonly VITE_UI_TYPE: string
    readonly VITE_BASE_URL: string
    readonly VITE_APP_IP: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
