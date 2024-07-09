/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-06-07 16:53:13
 * @Description: 挂载和resize时获取元素的动态宽高
 */
import { useEventListener } from './useEventListener'

export const useAutoWH = (getElement: () => HTMLElement, defaultW: number, defaultH: number) => {
    const w = ref(defaultW)
    const h = ref(defaultH)

    useEventListener(
        window,
        'resize',
        () => {
            const ele = getElement()
            w.value = ele.offsetWidth
            h.value = ele.offsetHeight
        },
        true,
    )

    return { w, h }
}
