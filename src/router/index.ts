/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 路由构建入口文件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 09:51:52
 */
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { buildRouter, setRouteAuth } from './featureConfig/RouteUtil'
import progress from '@bassist/progress'
import { APP_NAME } from '@/utils/constants'
import { root } from '@/router/featureConfig/RouteUtil'
import { type RouteLocationMatched, type RouteLocationNormalizedLoaded } from 'vue-router'

progress.configure({ showSpinner: false })
progress.setColor('var(--primary)')

//生成路由
const routes = buildRouter()

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior: (_to, _from, savedPosition) => {
        return savedPosition ? savedPosition : { top: 0, left: 0 }
    },
})

const getMenuItem = (item: RouteRecordRawExtends) => {
    return {
        path: item.path,
        name: item.name,
        meta: {
            auth: item.meta!.auth,
            enabled: item.meta!.enabled,
            // noAuth: item.meta!.noAuth,
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
export const getMenu1Items = () => {
    const layoutStore = useLayoutStore()
    const roots = root.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRawExtends[]
    layoutStore.menu1Items = getMenuItems(roots)
}

// getMenu1Items()

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
    const layoutStore = useLayoutStore()
    layoutStore.menu1Item = null
    layoutStore.menu2Items = []
    if (to.matched && to.matched.length > 1) {
        layoutStore.menu1Item = getMenuItem(to.matched[1] as any as RouteRecordRawExtends)
        layoutStore.menu2Items = layoutStore.menu1Item.children
    }
    layoutStore.menu2Item = null
    layoutStore.menu3Items = []
    if (to.matched && to.matched.length > 2) {
        layoutStore.menu2Item = getMenuItem(to.matched[2] as any as RouteRecordRawExtends)
        layoutStore.menu3Items = layoutStore.menu2Item.children
    }

    layoutStore.menu3Item = null
    if (to.matched && to.matched.length > 3) {
        layoutStore.menu3Item = getMenuItem(to.matched[3] as any as RouteRecordRawExtends)
    }

    next()
})

export { routes as routeRawList, setRouteAuth, getMenu1, getMenu2, getMenu3, getMenuItems, getMenuItem }

export default router
