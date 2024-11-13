/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-20 16:04:39
 * @Description: 二级类型2布局页--三级类型1布局页--适用于“智能分析-搜索”、“业务应用-停车场管理”等
 */
import { type RouteRecordRaw } from 'vue-router'
import { getMenu3 } from '@/router'

export default defineComponent({
    setup() {
        const route = useRoute()
        const layoutStore = useLayoutStore()

        const menu3Items = computed(() => layoutStore.menu3Items)

        /**
         * @description 是否是焦点菜单
         * @param {RouteRecordRaw} menu2
         * @returns {boolean}
         */
        const isMenu3Actice = (menu2: RouteRecordRaw) => {
            return menu2 && menu2.meta && getMenu3(route)?.meta.fullPath === menu2.meta.fullPath
        }

        const activeIndex = computed(() => {
            return route.meta.fullPath as string
        })

        return {
            activeIndex,
            menu3Items, // 当前进入的二级菜单项的三级菜单列表
            isMenu3Actice,
        }
    },
})
