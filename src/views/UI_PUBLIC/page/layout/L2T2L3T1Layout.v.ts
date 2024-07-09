/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--三级类型1布局页--适用于“智能分析-搜索”、“业务应用-停车场管理”等
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-11 15:41:23
 */

import { defineComponent } from 'vue'
import { menu3Items, getMenu3 } from '@/router'
import { type RouteRecordRaw, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
    },
    setup() {
        const route = useRoute()
        const menu = useMenuStore()

        // 是否是焦点菜单
        const isMenu3Actice = (menu2: RouteRecordRaw) => {
            return menu2 && menu2.meta && getMenu3(route)?.meta.fullPath === menu2.meta.fullPath
        }

        const isMenuItemShow = (menuItem: RouteRecordRawExtends) => {
            return menu.isMenuItemShow(menuItem as RouteRecordRaw)
        }

        const activeIndex = computed(() => {
            return route.meta.fullPath as string
        })

        return {
            activeIndex,
            menu,
            menu3Items: menu3Items as Ref<RouteRecordRawExtends[]>, // 当前进入的二级菜单项的三级菜单列表
            isMenu3Actice,
            isMenuItemShow,
        }
    },
})
