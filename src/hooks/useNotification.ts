/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 16:19:14
 * @Description: 消息通知组件
 */

/**
 * @description 显示通知
 * @param {string} message 消息
 * @param {boolean} cleanOldMessage 是否清空之前的消息
 */
export const openNotify = (message: string | string[], cleanUpHistory = false) => {
    const layoutStore = useLayoutStore()
    if (cleanUpHistory) {
        closeNotify()
    }

    if (typeof message === 'string') {
        layoutStore.notifications.push(message)
    } else {
        layoutStore.notifications.push(...message)
    }
}

/**
 * @description 关闭通知框，并清空消息
 */
export const closeNotify = () => {
    const layoutStore = useLayoutStore()
    layoutStore.notifications = []
}
