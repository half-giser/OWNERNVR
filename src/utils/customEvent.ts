/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-12 14:16:44
 * @Description: 自定义事件
 */
export const CreateEvent = () => {
    const listeners: ((...arg: any[]) => void)[] = []

    /**
     * @description 新增事件
     * @param {Function} listener
     */
    const addListener = (listener: (...arg: any[]) => void) => {
        if (!listeners.includes(listener)) {
            listeners.push(listener)
        }
    }

    /**
     * @description 移除事件
     * @param {Function} listener
     */
    const removeListener = (listener: (...arg: any[]) => void) => {
        const index = listeners.indexOf(listener)
        if (index > -1) {
            listeners.splice(index, 1)
        }
    }

    /**
     * @description 触发事件
     * @param {*} arg
     */
    const emit = (...arg: any[]) => {
        listeners.forEach((item) => {
            item(...arg)
        })
    }

    return {
        addListener,
        removeListener,
        emit,
    }
}
