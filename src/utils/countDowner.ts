/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-24 14:34:45
 * @Description: 倒计时工具类（按秒）
 */

/**
 * 倒计时读秒触发的回调参数（不满2位补0）
 */
export interface CountDownTime {
    /**
     * 剩余天数
     */
    disdays: string
    /**
     * 剩余小时数
     */
    dishours: string
    /**
     * 剩余分钟数
     */
    disminites: string
    /**
     * 剩余秒数
     */
    disseconds: string
}

/**
 * 倒计时构造函数参数类型
 */
interface CountDownerOption {
    /**
     * 倒计时读秒触发的回调
     */
    callback?: (countDownTime: CountDownTime) => void
    /**
     * 剩余倒计时秒数
     */
    distime?: number
    /**
     * 倒计时结束回调
     */
    overFn?: () => void
}

// //倒计时
export function CountDowner(opts: CountDownerOption) {
    //倒计时读秒触发的回调
    const callback = opts.callback
    //倒计时结束回调
    const overFn = opts.overFn
    //剩余倒计时秒数
    let distime = opts.distime || 0
    //定时器
    let timer: NodeJS.Timeout | number = 0

    /**
     * @description 开始倒计时
     */
    const countDown = () => {
        timer = setTimeout(() => {
            distime--
            countDown()
        }, 1000)
        if (distime <= 0) {
            distime = 0
            clearTimeout(timer)
        }
        const disdays = Math.floor(distime / (3600 * 24))
        const dishours = Math.floor((distime - disdays * 3600 * 24) / 3600)
        const disminites = Math.floor((distime - disdays * 3600 * 24 - dishours * 3600) / 60)
        const disseconds = Math.floor(distime - disdays * 3600 * 24 - dishours * 3600 - disminites * 60)
        const countDownTime = {
            disdays: padStart(disdays, 2),
            dishours: padStart(dishours, 2),
            disminites: padStart(disminites, 2),
            disseconds: padStart(disseconds, 2),
        }
        callback && callback(countDownTime)
        if (distime === 0) {
            overFn && overFn()
        }
    }

    /**
     * @description 销毁 停止计时
     */
    const destroy = () => {
        clearTimeout(timer)
    }

    countDown()

    return {
        destroy,
    }
}
