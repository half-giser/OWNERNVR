/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型1布局页--适用于所有配置页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-10 18:17:07
 */

import { type RouteRecordRaw } from 'vue-router'
import { getMenuItem } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const router = useRouter()
        const menu = useMenuStore()
        const chilComponent = ref()
        const layoutStore = useLayoutStore()

        const menu2Item = computed(() => layoutStore.menu2Item)
        const menu3Items = computed(() => layoutStore.menu3Items)
        const menu3Item = computed(() => layoutStore.menu3Item)

        //排序后的菜单分组
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

        //生成面包屑导航条
        const getBreadCrumb = () => {
            navList.value = []

            const routes = router.getRoutes()
            navList.value.push(getMenuItem(routes.find((o) => o.name === 'functionPanel') as any as RouteRecordRawExtends))

            if (route.meta.navs) {
                ;(route.meta.navs as string[]).forEach((name: string) => {
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

        const toDefault = (menuGroup: string) => {
            const defaultMenu = groupMenuMap.value[menuGroup]?.find((o) => o.meta?.default === true) as RouteRecordRaw
            if (defaultMenu) {
                router.push(defaultMenu?.meta?.fullPath as string)
            }
        }

        /**
         * 透传顶部工具栏事件，需要视图组件实现handleToolBarEvent方法
         * @param toolBarEvent
         */
        const handleToolBarEvent = (toolBarEvent: ConfigToolBarEvent<any>) => {
            chilComponent.value?.handleToolBarEvent(toolBarEvent)
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
            menu,
            chilComponent,
            navList,
            handleToolBarEvent,
            toDefault,
        }
    },
})
