/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-24 15:11:00
 * @Description: 错误锁定检查
 * 适用于错误指定次数后，锁定指定时间还有解锁的场景
 */
import { type CountDownTime, CountDowner } from './countDowner'

export class ErrorLockChecker {
    //是否已锁定
    isLocked: boolean
    //锁定时长
    private lockTime: number
    //业务类型，本地缓存前缀
    busType: string
    //翻译方法，因为inject只能在组件setup执行，需要从调用的逐渐传入
    Translate: (str: string) => string
    //前置错误消息，需要和次数错误，读秒错误等拼接
    preErrorMsg: string
    //读秒回调
    countDownCallback: Function
    //读秒结束回调
    countDownEndCallback: Function

    constructor(busType: string, countDownCallback: Function, countDownEndCallback: Function) {
        this.isLocked = false
        this.busType = busType
        this.lockTime = 0
        this.preErrorMsg = ''
        this.countDownCallback = countDownCallback
        this.countDownEndCallback = countDownEndCallback
        const { Translate } = useLangStore()
        this.Translate = Translate
        this.checkIsLocked()
    }

    /**
     * 设置锁定时间
     * @param lockTime
     */
    setLockTime(lockTime: number) {
        this.lockTime = lockTime
        //每次设置锁定时间，计算锁定结束时间点存入缓存，每次初始化时（如刷新页面）或读取是否有上次锁定的结束时间，重新计算锁定时间，进行读秒
        localStorage.setItem(`${this.busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`, '' + (Date.now() + lockTime))
    }

    checkIsLocked() {
        const lockEndTimestampStr = localStorage.getItem(`${this.busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`)
        const currentTime = Date.now()
        if (lockEndTimestampStr) {
            const lockEndTimestamp = Number(lockEndTimestampStr)
            if (currentTime - lockEndTimestamp < 0) {
                this.lockTime = lockEndTimestamp - currentTime
                this.error(() => {})
            }
        }
    }

    error(errorTimeCallback: Function) {
        if (this.lockTime > 0) {
            this.isLocked = true
            new CountDowner({
                distime: this.lockTime / 1000,
                callback: (obj: CountDownTime) => {
                    let info = ''
                    if (parseInt(obj.disminites) > 0) {
                        info = this.Translate('IDCS_TICK_MIN')
                        info = info.formatForLang(obj.disminites, obj.disseconds)
                    } else {
                        info = this.Translate('IDCS_TICK_SEC')
                        info = info.formatForLang(obj.disseconds)
                    }
                    this.countDownCallback(this.preErrorMsg + info)
                },
                overFn: () => {
                    this.isLocked = false
                    this.lockTime = 0
                    this.countDownEndCallback()
                },
            })
        } else {
            errorTimeCallback()
        }
    }
}
