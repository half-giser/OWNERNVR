/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 项目入口
 */
import { createPinia } from 'pinia'
import App from '@/App.vue'
import router from '@/router'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import './plugin/elementPlus'
import i18nPlugin from './plugin/i18n'
import typeEnhance from './plugin/typeEnhance'
import toolsPlugin from './plugin/tools'
// 全局样式注入，实测比配置 additionalData 性能更好，能达到在任意组件中都能直接使用的效果
import './plugin/css'
import datePlugin from './plugin/date'
import { regAllDirective } from './directives'

export const app = createApp(App)

// 如果用<link>加载CSS 自签名证书Chrome会报错net::ERR_TOO_MANY_RETRIES
if (import.meta.env.PROD) {
    const id = 'css_' + import.meta.url.split('/').at(-1)!.split('.')[0]
    const style = document.head.querySelector(`#${id}`)
    if (style) document.head.removeChild(style)
    fetch('./style.css?v=' + id)
        .then((res) => res.text())
        .then((res) => {
            const style = document.createElement('style')
            style.innerHTML = res
            style.id = id
            document.head.appendChild(style)
        })
}

// 注册自定义指令
regAllDirective(app)

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

const lang = useLangStore()
const session = useUserSessionStore()

app.use(i18nPlugin, lang)
app.use(datePlugin)
app.use(toolsPlugin)

// 加载自定义插件
app.use(typeEnhance)
app.use(router)

app.config.globalProperties.serverIp = session.serverIp
app.config.globalProperties.browserInfo = getBrowserInfo()
app.provide('appGlobalProp', app.config.globalProperties)

app.mount('#app')
