/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 16:19:14
 * @Description: 消息通知组件
 */
import { ElNotification } from 'element-plus'

let current: null | ReturnType<typeof ElNotification> = null

const useNotification = () => {
    const openNotification = (opt: { title?: string; message: string }) => {
        current && current.close()
        current = ElNotification({
            title: opt.title || '提示',
            message: opt.message,
            position: 'bottom-right',
        })
        return current
    }

    return openNotification
}

export default useNotification
