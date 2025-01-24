/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-24 15:11:00
 * @Description: 错误锁定检查
 * 适用于错误指定次数后，锁定指定时间还有解锁的场景
 */
import { type CountDownTime, CountDowner } from './countDowner'

interface ErrorLockCheckerOptions {
    busType: string
    countDownCallback?: (info: string) => void
    countDownEndCallback?: () => void
}

export const ErrorLockChecker = (opt: ErrorLockCheckerOptions) => {
    const { Translate } = useLangStore()

    //是否已锁定
    let isLocked = false
    //锁定时长
    let lockTime = 0
    //业务类型，本地缓存前缀
    const busType = opt.busType
    //前置错误消息，需要和次数错误，读秒错误等拼接
    let preErrorMsg = ''
    //读秒回调
    const countDownCallback = opt.countDownCallback
    //读秒结束回调
    const countDownEndCallback = opt.countDownEndCallback

    /**
     * @description 设置锁定时间
     * @param {number} lockTime ms
     */
    const setLockTime = (time: number) => {
        lockTime = time
        //每次设置锁定时间，计算锁定结束时间点存入缓存，每次初始化时（如刷新页面）或读取是否有上次锁定的结束时间，重新计算锁定时间，进行读秒
        localStorage.setItem(`${busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`, '' + (Date.now() + lockTime))
    }

    const checkIsLocked = () => {
        const lockEndTimestampStr = localStorage.getItem(`${busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`)
        const currentTime = Date.now()
        if (lockEndTimestampStr) {
            const lockEndTimestamp = Number(lockEndTimestampStr)
            if (currentTime - lockEndTimestamp < 0) {
                lockTime = lockEndTimestamp - currentTime
                error(() => {})
            }
        }
    }

    const error = (errorTimeCallback: () => void) => {
        if (lockTime > 0) {
            isLocked = true
            CountDowner({
                distime: lockTime / 1000,
                callback: (obj: CountDownTime) => {
                    let info = ''
                    if (parseInt(obj.disminites) > 0) {
                        info = Translate('IDCS_TICK_MIN')
                        info = info.formatForLang(obj.disminites, obj.disseconds)
                    } else {
                        info = Translate('IDCS_TICK_SEC')
                        info = info.formatForLang(obj.disseconds)
                    }
                    countDownCallback && countDownCallback(preErrorMsg + info)
                },
                overFn: () => {
                    isLocked = false
                    lockTime = 0
                    countDownEndCallback && countDownEndCallback()
                },
            })
        } else {
            errorTimeCallback()
        }
    }

    const setLock = (lock: boolean) => {
        isLocked = lock
    }

    const getLock = () => {
        return isLocked
    }

    const setPreErrorMessage = (msg: string) => {
        preErrorMsg = msg
    }

    checkIsLocked()

    return {
        setLockTime,
        setLock,
        setPreErrorMessage,
        getLock,
        error,
    }
}
