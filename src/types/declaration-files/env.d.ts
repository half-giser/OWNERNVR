/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
/// <reference types="vite/client" />

declare module '*.vue' {
    import { type DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

interface ImportMetaEnv {
    readonly VITE_UI_TYPE: string
    readonly VITE_BASE_URL: string
    readonly VITE_APP_IP: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
