/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 16:45:59
 * @Description: 路由菜单列表存储
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 17:05:08
 */
import { root } from '@/router/featureConfig/RouteUtil'
import { type RouteRecordRaw, type RouteLocationMatched, type RouteLocationNormalizedLoaded } from 'vue-router'

export const useRouteStore = defineStore('route', () => {
    //一级菜单列表
    const menu1Items = ref<RouteRecordRaw[]>(root.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRaw[])
    // //当前进入的一级菜单项
    const menu1Item = ref<RouteRecordRaw>()
    // //当前进入的一级菜单项的二级菜单列表
    const menu2Items = ref<RouteRecordRaw[]>([])
    // //当前进入的二级菜单项
    const menu2Item = ref<RouteRecordRaw>()
    // //当前进入的二级菜单项的三级菜单列表
    const menu3Items = ref<RouteRecordRaw[]>([])
    // //当前进入的三级菜单项
    const menu3Item = ref<RouteRecordRaw>()

    /**
     * @description: 获取当前路由的一级菜单
     * @param {RouteLocationNormalizedLoaded} route
     * @return {*}
     */
    function getMenu1(route: RouteLocationNormalizedLoaded): RouteLocationMatched | null {
        if (route.matched && route.matched.length > 1) {
            return route.matched[1]
        }
        return null
    }

    /**
     * @description: 获取当前路由的二级菜单
     * @param {RouteLocationNormalizedLoaded} route
     * @return {*}
     */
    function getMenu2(route: RouteLocationNormalizedLoaded): RouteLocationMatched | null {
        if (route.matched && route.matched.length > 2) {
            return route.matched[2]
        }
        return null
    }

    /**
     * @description: 获取当前路由的三级菜单
     * @param {RouteLocationNormalizedLoaded} route
     * @return {*}
     */
    function getMenu3(route: RouteLocationNormalizedLoaded): RouteLocationMatched | null {
        if (route.matched && route.matched.length > 3) {
            return route.matched[3]
        }
        return null
    }

    return {
        menu1Items,
        menu1Item,
        menu2Items,
        menu2Item,
        menu3Items,
        menu3Item,
        getMenu1,
        getMenu2,
        getMenu3,
    }
})
