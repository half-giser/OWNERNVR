/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 11:53:30
 * @Description: 全局插件模块
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-13 11:54:59
 */

import { type App } from 'vue'
import { usePlugin } from '@/utils/ocx/ocxPlugin'

export default {
    install: (app: App<Element>) => {
        const plugin = usePlugin()
        app.config.globalProperties.Plugin = plugin
    },
}
