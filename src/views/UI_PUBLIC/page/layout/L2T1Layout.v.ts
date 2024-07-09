/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型1布局页--适用于所有配置页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-14 18:42:54
 */

import { useMenuStore } from '@/stores/menu'
import { menu3Item, menu3Items, menu2Item, functionPanel } from '@/router'
import { useRoute, useRouter, type RouteRecordRaw } from 'vue-router'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
    },
    setup() {
        const route = useRoute()
        const router = useRouter()
        const menu = useMenuStore()
        const chilComponent = ref()

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

        const navList = ref([functionPanel] as any[])

        //生成面包屑导航条
        ;(() => {
            if (route.meta.navs) {
                const routes = router.getRoutes()
                ;(route.meta.navs as string[]).forEach((name: string) => {
                    const navRoute = routes.find((o) => o.name === name)
                    if (navRoute) {
                        navList.value.push(navRoute)
                    }
                })
            }
            navList.value.push(route)
        })()

        //将菜单按分组加入map -- 过滤掉 noMenu 为true的菜单项
        const groupMenuMap: Map<string, Array<RouteRecordRawExtends>> = new Map()
        ;(menu3Items.value as RouteRecordRawExtends[]).forEach((value) => {
            const meta = value.meta
            if (meta.noMenu) {
                return
            }
            if (!groupMenuMap.has(meta.group)) {
                groupMenuMap.set(meta.group, [])
            }
            groupMenuMap.get(meta.group)!.push(value)
        })

        const toDefault = (menuGroup: string) => {
            const defaultMenu = groupMenuMap.get(menuGroup)?.find((o) => o.meta?.default === true) as RouteRecordRaw
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

        return {
            route,
            router,
            menu3Item,
            menu3Items: menu3Items as Ref<RouteRecordRawExtends[]>,
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
