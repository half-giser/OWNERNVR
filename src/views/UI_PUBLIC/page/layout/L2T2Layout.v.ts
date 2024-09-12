/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:18:25
 * @Description: 二级类型2布局页--适用于“搜索和备份”、“智能分析”、“业务应用”等
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-10 17:01:50
 */

import { type RouteRecordRaw } from 'vue-router'
import { getMenu2 } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const menu = useMenuStore()
        const layoutStore = useLayoutStore()

        const menu2Items = computed(() => layoutStore.menu2Items)
        const menu2Item = computed(() => layoutStore.menu2Item)

        // 是否是焦点菜单
        const isMenu2Actice = (menu2: RouteRecordRawExtends) => {
            const item = menu2 as RouteRecordRaw
            return Boolean(item && item.meta && getMenu2(route)?.meta.fullPath === item.meta.fullPath)
        }

        const isSubMenuShow = (menuItem: RouteRecordRawExtends) => {
            return menu.isSubMenuShow(menuItem)
        }

        const isMenuItemShow = (menuItem: RouteRecordRawExtends) => {
            return menu.isMenuItemShow(menuItem)
        }

        return {
            route, // 当前进入的二级菜单项
            menu2Item, // 当前进入的一级菜单项的二级菜单列表
            menu2Items,
            menu,
            isMenu2Actice,
            isSubMenuShow,
            isMenuItemShow,
        }
    },
})
