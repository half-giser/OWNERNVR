/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型1布局页--适用于所有配置页
 */
import { getMenuItem } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const router = useRouter()
        const chilComponent = ref<ConfigComponentInstance>()
        const layoutStore = useLayoutStore()
        const userSession = useUserSessionStore()

        const menu2Item = computed(() => layoutStore.menu2Item)
        const menu3Items = computed(() => layoutStore.menu3Items)
        const menu3Item = computed(() => layoutStore.menu3Item)

        const disabledIconIndex = import.meta.env.VITE_UI_TYPE === 'UI2-A' ? 0 : 1
        const normalIconIndex = import.meta.env.VITE_UI_TYPE === 'UI2-A' ? 1 : 0

        /**
         * @description 排序后的菜单分组
         */
        const sortedGroups = computed(() => {
            if (!menu2Item.value?.meta?.groups) {
                return []
            }
            const groups = Object.entries(menu2Item.value.meta.groups).sort((a, b) => {
                return a[1].sort! - b[1].sort!
            })
            // 默认以group key作为icon类名
            groups.forEach((value) => {
                value[1].icon === undefined ? (value[1].icon = value[0]) : value[1].icon
            })
            return groups
        })

        const navList = ref<RouteRecordRawExtends[]>([])

        /**
         * @description 生成面包屑导航条
         */
        const getBreadCrumb = () => {
            navList.value = []

            const routes = router.getRoutes()
            navList.value.push(getMenuItem(routes.find((o) => o.name === 'functionPanel') as any as RouteRecordRawExtends))

            if (route.meta.navs) {
                ;(route.meta.navs as string[]).forEach((name) => {
                    const navRoute = routes.find((o) => o.name === name)
                    if (navRoute) {
                        navList.value.push(getMenuItem(navRoute as any as RouteRecordRawExtends))
                    }
                })
            }

            navList.value.push(getMenuItem(route as any as RouteRecordRawExtends))
        }

        //将菜单按分组加入map -- 过滤掉 noMenu 为true的菜单项
        const groupMenuMap = ref<Record<string, RouteRecordRawExtends[]>>({})

        const getGroupMenuMap = () => {
            groupMenuMap.value = {}
            menu3Items.value.forEach((value) => {
                const meta = value.meta
                if (meta.noMenu) {
                    return
                }

                if (!groupMenuMap.value[meta.group]) {
                    groupMenuMap.value[meta.group] = [] as RouteRecordRawExtends[]
                }

                groupMenuMap.value[meta.group].push(value)
            })
        }

        /**
         * @description 点击主菜单，跳转默认子菜单
         * @param {string} menuGroup
         */
        const goToDefaultPage = (menuGroup: string) => {
            const defaultMenu = groupMenuMap.value[menuGroup]?.find((o) => o.meta.default === true && !getMenuDisabled(o))
            if (defaultMenu) {
                router.push(defaultMenu.meta.fullPath)
            } else {
                const defaultMenu = groupMenuMap.value[menuGroup].find((item) => !getMenuDisabled(item))
                if (defaultMenu) {
                    router.push(defaultMenu.meta.fullPath)
                }
            }
        }

        /**
         * @description 路由跳转
         * @param {RouteRecordRawExtends} route
         */
        const goToPath = (route: RouteRecordRawExtends) => {
            if (getMenuDisabled(route)) {
                return
            }

            router.push({
                path: route.meta.fullPath,
            })
        }

        /**
         * @description 透传顶部工具栏事件，需要视图组件实现handleToolBarEvent方法
         * @param {ConfigToolBarEvent} toolBarEvent
         */
        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<any>) => {
            if (chilComponent.value && chilComponent.value.handleToolBarEvent) {
                chilComponent.value.handleToolBarEvent(toolBarEvent)
            }
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
         * @description 是否禁用菜单组
         * @param {RouteRecordRawExtends} group
         * @returns {boolean}
         */
        const getMenuGroupDisabled = (group: string) => {
            return groupMenuMap.value[group]?.every((item) => getMenuDisabled(item)) || false
        }

        watch(
            () => route.path,
            () => {
                getBreadCrumb()
            },
            {
                immediate: true,
            },
        )

        watch(
            () => menu3Items.value,
            () => {
                getGroupMenuMap()
            },
            {
                deep: true,
                immediate: true,
            },
        )

        return {
            route,
            router,
            menu3Item,
            menu3Items,
            sortedGroups,
            groupMenuMap,
            chilComponent,
            navList,
            handleToolBarEvent,
            goToDefaultPage,
            getMenuDisabled,
            getMenuGroupDisabled,
            goToPath,
            normalIconIndex,
            disabledIconIndex,
        }
    },
})
