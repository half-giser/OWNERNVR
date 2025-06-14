/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-19 17:28:37
 * @Description: Layout的一些状态
 */
export const useLayoutStore = defineStore('layout', () => {
    // 当前打开的弹窗数量
    const messageBoxCount = ref(0)
    // 全屏Loading数量
    const loadingCount = ref(0)
    // 是否已经初始化
    const isInitial = ref(false)
    // 是否弹窗二次授权弹窗
    const isAuth = ref(false)
    // RollMsg消息
    const notifications = ref<string[]>([])
    const isPwdChecked = ref(false)

    const liveLastSegNum = ref(1)
    const liveLastChlList = ref<string[]>([])

    const isIpSpeakerAddPop = ref(false)

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

    const searchTargetFromPage = ref('')
    const searchTargetFromSearchType = ref('')

    if (import.meta.env.DEV) {
        watch(messageBoxCount, (val) => {
            console.log('messageBoxCount:', val)
        })

        watch(loadingCount, (val) => {
            console.log('loadingCount:', val)
        })
    }

    return {
        messageBoxCount,
        loadingCount,
        isInitial,
        isAuth,
        isPwdChecked,
        liveLastSegNum,
        liveLastChlList,
        isIpSpeakerAddPop,
        notifications,

        menu1Items,
        menu1Item,
        menu2Items,
        menu2Item,
        menu3Items,
        menu3Item,
        configMenu,

        searchTargetFromPage,
        searchTargetFromSearchType,
    }
})
