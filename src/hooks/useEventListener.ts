/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-06-07 16:53:13
 * @Description: 组件挂载时绑定事件，组件卸载时解除事件
 */

export const useEventListener = (target: EventTarget, event: any, callback: (e?: any) => void, isRunImmediately: boolean) => {
    // 如果你想的话，
    // 也可以用字符串形式的 CSS 选择器来寻找目标 DOM 元素
    onMounted(() => {
        if (isRunImmediately) {
            callback()
        }
        target.addEventListener(event, callback)
    })
    onBeforeUnmount(() => target.removeEventListener(event, callback))
}
