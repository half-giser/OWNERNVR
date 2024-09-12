/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--三级类型1布局页--适用于“智能分析-搜索”、“业务应用-停车场管理”等
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-10 17:01:11
 */

import { type RouteRecordRaw } from 'vue-router'
import { getMenu3 } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const menu = useMenuStore()
        const layoutStore = useLayoutStore()

        const menu3Items = computed(() => layoutStore.menu3Items)

        // 是否是焦点菜单
        const isMenu3Actice = (menu2: RouteRecordRaw) => {
            return menu2 && menu2.meta && getMenu3(route)?.meta.fullPath === menu2.meta.fullPath
        }

        const isMenuItemShow = (menuItem: RouteRecordRawExtends) => {
            return menu.isMenuItemShow(menuItem)
        }

        const activeIndex = computed(() => {
            return route.meta.fullPath as string
        })

        return {
            activeIndex,
            menu,
            menu3Items, // 当前进入的二级菜单项的三级菜单列表
            isMenu3Actice,
            isMenuItemShow,
        }
    },
})
