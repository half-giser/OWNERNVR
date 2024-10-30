/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-30 14:22:16
 * @Description: 刷新定时器. 用于下发协议返回结果后，定时重新下发的情况
 * 使用此hook，是为了解决定时器在组件注销时没有清除、或没有正确清除定时器而导致内存溢出的问题
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 19:03:48
 */
export const useRefreshTimer = (callback: () => any, delayTime = 5000, timerType = 'timeout') => {
    let destroyed = false
    let timer: NodeJS.Timeout | number = 0

    /**
     * @description 清除定时器
     */
    const stop = () => {
        if (timerType === 'timeout') {
            clearTimeout(timer)
        } else {
            clearInterval(timer)
        }
        timer = 0
    }

    /**
     * @description 发起定时器
     * @param {boolean} immediately 是否马上执行
     */
    const repeat = (immediately = false, done?: () => void) => {
        stop()

        const execute = () => {
            callback()
            done && done()
        }

        if (!destroyed) {
            if (immediately) {
                execute()
            } else if (timerType === 'timeout') {
                timer = setTimeout(execute, delayTime)
            } else {
                timer = setInterval(execute, delayTime)
            }
        }
    }

    /**
     * @description 销毁
     */
    const destroy = () => {
        stop()
        destroyed = true
    }

    onBeforeUnmount(() => {
        destroy()
    })

    return {
        repeat,
        stop,
        destroy,
    }
}
