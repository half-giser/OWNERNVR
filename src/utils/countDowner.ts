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

//倒计时
export class CountDowner {
    //倒计时读秒触发的回调
    callback?: (countDownTime: CountDownTime) => void
    //剩余倒计时秒数
    distime: number
    //倒计时结束回调
    overFn?: () => void
    //定时器
    timer?: NodeJS.Timeout
    constructor(opts: CountDownerOption) {
        this.callback = opts.callback // || (() => {})
        this.distime = opts.distime || 0
        this.overFn = opts.overFn // || (() => {})
        this.timer = undefined
        this.countDown()
    }

    /**
     * 开始倒计时
     */
    countDown() {
        this.timer = setTimeout(() => {
            this.distime--
            this.countDown()
        }, 1000)
        if (this.distime <= 0) {
            this.distime = 0
            clearTimeout(this.timer)
        }
        const disdays = Math.floor(this.distime / (3600 * 24))
        const dishours = Math.floor((this.distime - disdays * 3600 * 24) / 3600)
        const disminites = Math.floor((this.distime - disdays * 3600 * 24 - dishours * 3600) / 60)
        const disseconds = Math.floor(this.distime - disdays * 3600 * 24 - dishours * 3600 - disminites * 60)
        const countDownTime = {
            disdays: this.addZelo(disdays),
            dishours: this.addZelo(dishours),
            disminites: this.addZelo(disminites),
            disseconds: this.addZelo(disseconds),
        }
        this.callback && this.callback(countDownTime)
        if (this.distime === 0) {
            this.overFn && this.overFn()
        }
    }

    /**
     * 不足2位补0
     * @param n
     * @returns
     */
    addZelo(n: number) {
        return n < 10 && n >= 0 ? '0' + n : '' + n
    }
}
