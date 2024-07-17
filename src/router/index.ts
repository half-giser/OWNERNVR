/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 路由构建入口文件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-16 11:49:45
 */
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { buildRouter, setRouteAuth } from './featureConfig/RouteUtil'
import progress from '@bassist/progress'
import { APP_NAME } from '@/utils/constants'
import { root } from '@/router/featureConfig/RouteUtil'
import { type RouteLocationMatched, type RouteLocationNormalizedLoaded } from 'vue-router'

progress.configure({ showSpinner: false })
progress.setColor('var(--c-brand)')

//生成路由
const routes = buildRouter()

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: (_to, _from, savedPosition) => {
        return savedPosition ? savedPosition : { top: 0, left: 0 }
    },
})

//一级菜单列表
const menu1Items = ref<RouteRecordRawExtends[]>([])
// //当前进入的一级菜单项
const menu1Item = ref<RouteRecordRawExtends | null>(null)
// //当前进入的一级菜单项的二级菜单列表
const menu2Items = ref<RouteRecordRawExtends[]>([])
// //当前进入的二级菜单项
const menu2Item = ref<RouteRecordRawExtends | null>(null)
// //当前进入的二级菜单项的三级菜单列表
const menu3Items = ref<RouteRecordRawExtends[]>([])
// //当前进入的三级菜单项
const menu3Item = ref<RouteRecordRawExtends | null>(null)

const getMenuItem = (item: RouteRecordRawExtends) => {
    return {
        path: item.path,
        name: item.name,
        meta: {
            auth: item.meta!.auth,
            noAuth: item.meta!.noAuth,
            keepAlive: item.meta!.keepAlive,
            fullPath: item.meta!.fullPath,
            icon: item.meta!.icon,
            lk: item.meta!.lk,
            group: item.meta!.group,
            noMenu: item.meta!.noMenu,
            default: item.meta!.default,
            plClass: item.meta!.plClass,
            groups: item.meta!.groups,
            homeSort: item.meta!.homeSort,
            sort: item.meta!.sort,
            inHome: item.meta!.inHome,
        },
        children: item.children ? getMenuItems(item.children) : [],
    }
}

const getMenuItems = (routes: RouteRecordRawExtends[]): RouteRecordRawExtends[] => {
    return routes.map((item) => {
        return getMenuItem(item)
    })
}

// 生成一级菜单
const getMenu1Items = () => {
    const roots = root.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRawExtends[]
    menu1Items.value = getMenuItems(roots)
}

getMenu1Items()

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

router.beforeEach(() => {
    progress.start()
})

router.afterEach((to) => {
    const title = to.meta.title
    document.title = title ? `${title} - ${APP_NAME}` : APP_NAME
    progress.done()
})

//TODO 查询通道能力集，全局状态中设置不支持的功能项目

/*
注册全局路由守卫，设置当前的菜单状态
*/
router.beforeResolve((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: Function) => {
    // TODO: MenuItems 需要deepClone，且不能包含component
    menu1Item.value = null
    menu2Items.value = []
    if (to.matched && to.matched.length > 1) {
        menu1Item.value = getMenuItem(to.matched[1] as any as RouteRecordRawExtends)
        menu2Items.value = menu1Item.value.children
    }
    menu2Item.value = null
    menu3Items.value = []
    if (to.matched && to.matched.length > 2) {
        menu2Item.value = getMenuItem(to.matched[2] as any as RouteRecordRawExtends)
        menu3Items.value = menu2Item.value.children
    }

    menu3Item.value = null
    if (to.matched && to.matched.length > 3) {
        menu3Item.value = getMenuItem(to.matched[3] as any as RouteRecordRawExtends)
    }

    next()
})

export { routes as routeRawList, setRouteAuth, menu1Items, menu1Item, menu2Items, menu2Item, menu3Items, menu3Item, getMenu1, getMenu2, getMenu3, getMenuItems, getMenuItem }

export default router
