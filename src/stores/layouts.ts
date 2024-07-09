/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-19 17:28:37
 * @Description: Layout的一些状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-19 17:31:21
 */
export const useLayoutStore = defineStore('layout', () => {
    // 当前打开的弹窗数量
    const messageBoxCount = ref(0)
    // 是否已经初始化
    const isInitial = ref(false)

    return {
        messageBoxCount,
        isInitial,
    }
})
