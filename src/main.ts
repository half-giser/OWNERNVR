/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 项目入口
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 09:07:41
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router, { getMenu1Items } from '@/router'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import i18nPlugin from './plugin/i18n'
import typeEnhance from './plugin/typeEnhance'
import loadingPlugin from './plugin/loading'
import './plugin/css'
import datePlugin from './plugin/date'
import componentPlugin from './plugin/components'
import { regAllDirective } from './directives'

export const app = createApp(App)

// 注册自定义指令
regAllDirective(app)

// app.use(cssPlugin)

// 创建 Pinia 实例
const pinia = createPinia()
// Pinia 本地持久化功能
pinia.use(
    createPersistedState({
        key: (id) => `__store__${id}`,
        storage: sessionStorage,
    }),
)
app.use(pinia) // 启用Pinia

app.use(componentPlugin)

getMenu1Items()

const lang = useLangStore()

// 标准登录此处请求语言翻译和时间日期配置，P2P登录则延后至插件连接成功后请求
if (import.meta.env.VITE_APP_TYPE === 'STANDARD') {
    await lang.getLangTypes()
    await lang.getLangItems()

    const dateTime = useDateTimeStore()
    await dateTime.getTimeConfig(false)
}

app.use(i18nPlugin, lang)
app.use(loadingPlugin)
app.use(datePlugin)

// 加载自定义插件
app.use(typeEnhance)
app.use(router)

app.config.globalProperties.serverIp = import.meta.env.VITE_APP_IP || window.location.hostname
app.config.globalProperties.browserInfo = getBrowserInfo()
app.provide('appGlobalProp', app.config.globalProperties)

app.mount('#app')
