/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-24 15:11:00
 * @Description: 错误锁定检查
 * 适用于错误指定次数后，锁定指定时间还有解锁的场景
 */
export const useErrorLockChecker = (busType: string) => {
    const { Translate } = useLangStore()

    // 是否已锁定
    const isLocked = ref(false)
    //前置错误消息，需要和次数错误，读秒错误等拼接
    const preErrorMsg = ref('')
    // 锁定剩余分钟
    const disminites = ref('')
    // 锁定剩余秒
    const disseconds = ref('')
    //锁定时长
    let lockTime = 0
    let countDowner: ReturnType<typeof useCountDowner>

    /**
     * @description 设置锁定时间
     * @param {number} lockTime ms
     */
    const setLockTime = (time: number) => {
        lockTime = time
        //每次设置锁定时间，计算锁定结束时间点存入缓存，每次初始化时（如刷新页面）或读取是否有上次锁定的结束时间，重新计算锁定时间，进行读秒
        localStorage.setItem(`${busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`, '' + (Date.now() + lockTime))
    }

    // 错误信息
    const errorMsg = computed(() => {
        if (parseInt(disminites.value) > 0) {
            return Translate(preErrorMsg.value) + '\n' + Translate('IDCS_TICK_MIN').formatForLang(disminites.value, disseconds.value)
        }
        return Translate(preErrorMsg.value) + '\n' + Translate('IDCS_TICK_SEC').formatForLang(disseconds.value)
    })

    /**
     * @description 检查是否已被锁定
     * @returns {boolean}
     */
    const checkIsLocked = () => {
        const lockEndTimestampStr = localStorage.getItem(`${busType}_${LocalCacheKey.KEY_LOCK_END_TIMESTAMP}`)
        const currentTime = Date.now()
        if (lockEndTimestampStr) {
            const lockEndTimestamp = Number(lockEndTimestampStr)
            if (currentTime - lockEndTimestamp < 0) {
                lockTime = lockEndTimestamp - currentTime
                if (lockTime > 0) {
                    isLocked.value = true
                    if (countDowner) {
                        countDowner.destroy()
                    }
                    countDowner = useCountDowner({
                        distime: lockTime / 1000,
                        callback: (obj) => {
                            disminites.value = obj.disminites
                            disseconds.value = obj.disseconds
                        },
                        overFn: () => {
                            isLocked.value = false
                            lockTime = 0
                            preErrorMsg.value = ''
                        },
                    })
                }
            }
        }
        return lockTime > 0
    }

    /**
     * @description 设置锁定
     * @param {boolean} lock
     */
    const setLock = (lock: boolean) => {
        isLocked.value = lock
    }

    /**
     * @description 获取是否已被锁定
     * @returns {boolean}
     */
    const getLock = () => {
        return isLocked.value
    }

    /**
     * @description 返回错误信息
     * @returns {string}
     */
    const getErrorMessage = () => {
        return errorMsg.value
    }

    /**
     * @description 设置错误信息前缀
     * @param {string} key
     */
    const setPreErrorMessage = (key: string) => {
        preErrorMsg.value = key
    }

    checkIsLocked()

    return {
        isLocked,
        setLockTime,
        setLock,
        setPreErrorMessage,
        getLock,
        getErrorMessage,
        checkIsLocked,
    }
}
