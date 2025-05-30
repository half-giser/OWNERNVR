/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:18:25
 * @Description: 二级类型2布局页--适用于“搜索和备份”、“智能分析”、“业务应用”等
 */
import { type RouteRecordRaw } from 'vue-router'
import { getMenu2 } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const router = useRouter()
        const layoutStore = useLayoutStore()
        const userSession = useUserSessionStore()
        const { Translate } = useLangStore()

        const menu2Items = computed(() => layoutStore.menu2Items)
        const menu2Item = computed(() => layoutStore.menu2Item)
        const menuKey = ref(layoutStore.menu1Item?.name || '')

        /**
         * @description 是否是焦点菜单
         * @param {RouteRecordRawExtends} menu2
         * @returns {boolean}
         */
        const isMenu2Active = (menu2: RouteRecordRawExtends) => {
            const item = menu2 as RouteRecordRaw
            return Boolean(item && item.meta && getMenu2(route)?.meta.fullPath === item.meta.fullPath)
        }

        /**
         * @description 是否禁用菜单
         * @param {RouteRecordRawExtends} route
         * @returns {boolean}
         */
        const getMenuDisabled = (route: RouteRecordRawExtends) => {
            return typeof route.meta.auth !== 'undefined' && !userSession.hasAuth(route.meta.auth)
        }

        /**
         * @description 路由跳转
         * @param {RouteRecordRawExtends} route
         */
        const goToPath = (route: RouteRecordRawExtends) => {
            if (getMenuDisabled(route)) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
                return
            }
            router.push({
                path: route.meta.fullPath,
            })
        }

        watch(
            () => route.path,
            () => {
                menuKey.value = layoutStore.menu1Item?.name || ''
            },
        )

        return {
            route, // 当前进入的二级菜单项
            menu2Item, // 当前进入的一级菜单项的二级菜单列表
            menu2Items,
            menuKey,
            isMenu2Active,
            getMenuDisabled,
            goToPath,
        }
    },
})
