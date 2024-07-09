/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 15:10:50
 * @Description: 国际化插件
 */

import type { App } from 'vue'

export default {
    install: (app: App<Element>, lang: ReturnType<typeof useLangStore>) => {
        // 注入一个全局可用的 Translate() 方法
        app.config.globalProperties.Translate = (args: string) => {
            // 解决[Vue warn]: Property "$id" was accessed during render but is not defined on instance.
            return lang.Translate(args)
        }
    },
}
