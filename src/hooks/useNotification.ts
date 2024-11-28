/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 16:19:14
 * @Description: 消息通知组件
 */
const useNotification = () => {
    const layoutStore = useLayoutStore()

    const openNotify = (message: string) => {
        layoutStore.notifications.push(message)
    }

    const closeNotify = () => {
        layoutStore.notifications = []
    }

    return {
        openNotify,
        closeNotify,
    }
}

export default useNotification
