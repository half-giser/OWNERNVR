/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-26 15:32:02
 * @Description: UI2-A 客制化功能面板
 */
import { getMenuItems } from '@/router'

export default defineComponent({
    setup() {
        const router = useRouter()
        const userSession = useUserSessionStore()
        //去掉在控制面板不需要显示的菜单项，并排序
        const configModules = ref<RouteRecordRawExtends[]>([])
        const layoutStore = useLayoutStore()
        const systemCaps = useCababilityStore()

        // 以下菜单不会在UI2-A的三级菜单中显示
        const HIDDEN_ROUTES = ['channelGroupAdd', 'cruiseGroup', 'trace', 'ptzTask', 'ptzProtocol', 'permissionGroupAdd']

        const pageData = ref({
            // 选中的一级菜单
            mainMenuIndex: 0,
            // 选中的二级菜单
            subMenuIndex: '',
        })

        /**
         * @description 获取功能面板的菜单列表
         */
        const getConfigModule = () => {
            configModules.value = getMenuItems(layoutStore.configMenu?.children || []).filter((item) => !!item.meta?.groups)
            configModules.value.forEach((item) => {
                item.children = item.children.filter((child) => {
                    return (!child.meta.hasCap || child.meta.hasCap(systemCaps)) && !HIDDEN_ROUTES.includes(child.name as string)
                })
            })

            const menuIndex = configModules.value.findIndex((item) => !getMenuDisabled(item))
            if (menuIndex > -1) {
                pageData.value.mainMenuIndex = menuIndex
            }

            getDefaultTriMenu()
        }

        // 二级菜单
        const subMenu = computed(() => {
            if (!configModules.value[pageData.value.mainMenuIndex]?.meta.groups) {
                return []
            }
            return Object.entries(configModules.value[pageData.value.mainMenuIndex].meta.groups!)
                .filter((item) => {
                    return configModules.value[pageData.value.mainMenuIndex].children.filter((child) => item[0] === child.meta.group).length > 0
                })
                .toSorted((a, b) => {
                    return a[1].sort! - b[1].sort!
                })
        })

        // 三级菜单
        const triMenu = computed(() => {
            if (!configModules.value[pageData.value.mainMenuIndex]) {
                return []
            }
            return configModules.value[pageData.value.mainMenuIndex].children.filter((item) => item.meta.group === pageData.value.subMenuIndex).toSorted((a, b) => a.meta.sort! - b.meta.sort!)
        })

        /**
         * @description 获取默认的三级菜单
         */
        const getDefaultTriMenu = () => {
            const groups = configModules.value[pageData.value.mainMenuIndex].meta.groups!
            pageData.value.subMenuIndex = Object.keys(groups)[0]
        }

        /**
         * @description 跳转配置页
         * @param {RouteRecordRawExtends} moduleItem
         */
        const goToPage = (moduleItem: RouteRecordRawExtends) => {
            if (getMenuDisabled(moduleItem)) {
                return
            }
            router.push(moduleItem.meta.fullPath)
        }

        /**
         * @description 切换一级菜单
         * @param {number} key
         */
        const changeMainMenu = (key: number) => {
            if (getMenuDisabled(configModules.value[key])) {
                return
            }
            pageData.value.mainMenuIndex = key
            getDefaultTriMenu()
        }

        /**
         * @description 切换二级菜单
         * @param {string} key
         */
        const changeSubMenu = (key: string) => {
            pageData.value.subMenuIndex = key
        }

        /**
         * @description 是否禁用菜单
         * @param {RouteRecordRawExtends} route
         * @returns {boolean}
         */
        const getMenuDisabled = (route: RouteRecordRawExtends) => {
            return typeof route.meta.auth !== 'undefined' && !userSession.hasAuth(route.meta.auth)
        }

        watch(
            () => layoutStore.configMenu,
            () => {
                getConfigModule()
            },
            {
                immediate: true,
            },
        )

        return {
            goToPage,
            pageData,
            configModules,
            changeMainMenu,
            changeSubMenu,
            subMenu,
            triMenu,
            getMenuDisabled,
        }
    },
})
