/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-19 17:28:37
 * @Description: Layout的一些状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-12 14:01:18
 */
export const useLayoutStore = defineStore('layout', () => {
    // 当前打开的弹窗数量
    const messageBoxCount = ref(0)
    // 全屏Loading数量
    const loadingCount = ref(0)
    // 是否已经初始化
    const isInitial = ref(false)

    const liveLastSegNum = ref(1)
    const liveLastChlList = ref<string[]>([])

    //一级菜单列表
    const menu1Items = ref<RouteRecordRawExtends[]>([])
    // //当前进入的一级菜单项
    const menu1Item = ref<RouteRecordRawExtends | null>(null)
    // //当前进入的一级菜单项的二级菜单列表
    const menu2Items = ref<RouteRecordRawExtends[]>([])
    // //当前进入的二级菜单项
    const menu2Item = ref<RouteRecordRawExtends | null>(null)
    // //当前进入的二级菜单项的三级菜单列表
    const menu3Items = ref<RouteRecordRawExtends[]>([])
    // //当前进入的三级菜单项
    const menu3Item = ref<RouteRecordRawExtends | null>(null)
    // 配置页菜单
    const configMenu = ref<RouteRecordRawExtends | null>(null)

    return {
        messageBoxCount,
        loadingCount,
        isInitial,
        liveLastSegNum,
        liveLastChlList,

        menu1Items,
        menu1Item,
        menu2Items,
        menu2Item,
        menu3Items,
        menu3Item,
        configMenu,
    }
})
