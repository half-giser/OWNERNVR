/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-06-07 16:53:13
 * @Description: Loading插件
 */

import { type App } from 'vue'
import useLoading from '@/hooks/useLoading'

export default {
    install: (app: App<Element>) => {
        const { LoadingTarget, openLoading, closeLoading, closeAllLoading } = useLoading()

        app.config.globalProperties.LoadingTarget = LoadingTarget
        app.config.globalProperties.openLoading = openLoading
        app.config.globalProperties.closeLoading = closeLoading
        app.config.globalProperties.closeAllLoading = closeAllLoading
    },
}
