/*
 * @Date: 2025-02-24 16:33:49
 * @Description: 注册Vue Template上使用的公共方法
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { App } from 'vue'

export default {
    install: (app: App<Element>) => {
        app.config.globalProperties.formatInputMaxLength = formatInputMaxLength
        app.config.globalProperties.formatInputUserName = formatInputUserName
        app.config.globalProperties.formatDigit = formatDigit
        app.config.globalProperties.blurInput = blurInput
    },
}
