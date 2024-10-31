/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-31 09:08:29
 * @Description: 实现setInterval的效果，但定时更精准
 * 使用此hook，可避免定时器在组件注销时没有清除、或没有正确清除定时器而导致内存溢出的问题
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-31 09:44:05
 */
export const useClock = (callback = () => {}, delay = 1000) => {
    let past = 0
    let tick = 0
    let timer: NodeJS.Timeout | number = 0
    let destroyed = false
    let cbk = callback

    /**
     * @description 销毁
     */
    const destroy = () => {
        destroyed = true
        stop()
    }

    /**
     * @description 清除定时器
     */
    const stop = () => {
        clearTimeout(timer)
    }

    /**
     * @description 发起定时器
     * @param {boolean} immediately 是否马上执行一次
     * @param {boolean} adjust 是否校准
     */
    const repeat = (immediate = false, adjust = false) => {
        stop()

        if (!destroyed) {
            if (immediate) {
                cbk()
            }

            if (adjust) {
                const millisecond = new Date().getMilliseconds()
                timer = setTimeout(
                    () => {
                        past = performance.now()
                        tick = 0
                        ticker()
                    },
                    delay + 50 - millisecond,
                )
            } else {
                past = performance.now()
                tick = 0
                ticker()
            }
        }
    }

    /**
     * @description 更新回调
     * @param {Function} callback
     */
    const update = (callback: () => any) => {
        cbk = callback
    }

    /**
     * @description 精准时钟
     */
    const ticker = () => {
        const current = performance.now()
        const delta = current - (past + tick * delay)
        timer = setTimeout(() => {
            tick++
            cbk()
            if (!destroyed) {
                ticker()
            } else {
                stop()
            }
        }, delay - delta)
    }

    onBeforeUnmount(() => {
        destroy()
    })

    return {
        destroy,
        stop,
        repeat,
        update,
    }
}
