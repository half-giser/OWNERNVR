/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 16:03:20
 * @Description: 消息通知插件
 */
import { type App } from 'vue'
import useNotification from '@/hooks/useNotification'

export default {
    install: (app: App<Element>) => {
        const notification = useNotification()
        app.config.globalProperties.notify = notification
    },
}
