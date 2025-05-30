/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-26 10:39:12
 * @Description: 监听表单发生变化
 */
export const useWatchEditData = (obj: Ref<any>) => {
    const disabled = ref(true)
    const ready = ref(false)

    /**
     * @description 开始侦听数据的变化
     */
    const listen = () => {
        nextTick(() => {
            ready.value = true
        })
    }

    /**
     * @description 在获取数据前重置侦听
     */
    const reset = () => {
        ready.value = false
        disabled.value = true
    }

    /**
     * @description 在数据下发成功后重置提交按钮禁用
     */
    const update = () => {
        nextTick(() => {
            disabled.value = true
        })
    }

    watch(
        obj,
        () => {
            if (ready.value) {
                disabled.value = false
            }
        },
        {
            deep: true,
        },
    )

    return {
        listen,
        reset,
        disabled,
        ready,
        update,
    }
}
