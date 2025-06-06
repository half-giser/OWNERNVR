/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 路由构建入口文件
 */
import { createRouter, createWebHashHistory, type RouteLocationNormalized } from 'vue-router'
import { buildRouter } from './featureConfig/RouteUtil'
import progress from '@bassist/progress'
import { type RouteLocationNormalizedLoaded } from 'vue-router'

progress.configure({ showSpinner: false })
progress.setColor('var(--primary)')

//生成路由
const routes = buildRouter()

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes.filter((item) => item.meta?.noToken),
    scrollBehavior: (_to, _from, savedPosition) => {
        return savedPosition ? savedPosition : { top: 0, left: 0 }
    },
})

let authRoutes: RouteRecordRawExtends[] = []

/**
 * @description 生成有权限的路由
 */
export const generateAsyncRoutes = () => {
    const systemCaps = useCababilityStore()
    const userSession = useUserSessionStore()
    const routes = buildRouter()

    const asyncRoute = (routes as RouteRecordRawExtends[]).filter((item) => {
        return item.meta?.noToken === undefined
    })

    /**
     * @description 递归生成有权限的路由
     * @param {RouteRecordRawExtends[]} routes
     * @returns {RouteRecordRawExtends[]}
     */
    const getAuthRoute = (routes: RouteRecordRawExtends[]) => {
        return routes.filter((item) => {
            if (item.children) {
                item.children = getAuthRoute(item.children)

                if (!item.redirect) {
                    // 设置路由重定向 （满足能力集和用户权限）
                    const redirect = item.children.find((item) => {
                        return !item.meta.auth || userSession.hasAuth(item.meta.auth)
                    })

                    if (redirect) {
                        item.redirect = redirect.meta.fullPath
                    }
                }
            }

            return !item.meta.hasCap || item.meta.hasCap(systemCaps)
        })
    }

    authRoutes = getAuthRoute(asyncRoute)

    authRoutes.forEach((item) => {
        router.addRoute(item)
    })

    getMenu1Items()
    getConfigMenu()
}

/**
 * @description 移除有权限的路由
 */
export const removeAsyncRoutes = () => {
    authRoutes.forEach((item) => {
        router.removeRoute(item.name!)
    })
}

/**
 * @description 生成菜单数据
 * @param {RouteRecordRawExtends} item
 * @returns {RouteRecordRawExtends}
 */
export const getMenuItem = (item: RouteRecordRawExtends) => {
    return {
        path: item.path,
        name: item.name,
        meta: {
            hasCap: item.meta!.hasCap,
            noToken: item.meta!.noToken,
            auth: item.meta!.auth,
            // noAuth: item.meta!.noAuth,
            keepAlive: item.meta!.keepAlive,
            fullPath: item.meta!.fullPath,
            icon: item.meta!.icon,
            lk: item.meta!.lk,
            group: item.meta!.group,
            noMenu: item.meta!.noMenu,
            default: item.meta!.default,
            homeDefault: item.meta!.homeDefault,
            groups: item.meta!.groups,
            homeSort: item.meta!.homeSort,
            sort: item.meta!.sort,
            inHome: item.meta!.inHome,
            minWidth: item.meta!.minWidth,
            minHeight: item.meta!.minHeight,
            cbk: item.meta!.cbk,
        },
        children: item.children ? getMenuItems(item.children) : [],
        redirect: item.redirect || '',
        alias: item.alias,
    }
}

/**
 * @description 递归生成菜单数据
 * @param {RouteRecordRawExtends[]} routes
 * @returns {RouteRecordRawExtends[]}
 */
export const getMenuItems: (routes: RouteRecordRawExtends[]) => RouteRecordRawExtends[] = (routes: RouteRecordRawExtends[]) => {
    return routes.map((item) => {
        return getMenuItem(item)
    })
}

/**
 * @description 生成一级菜单
 */
export const getMenu1Items = () => {
    const layoutStore = useLayoutStore()
    const roots = authRoutes.find((item) => item.name === 'root')?.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRawExtends[]
    layoutStore.menu1Items = getMenuItems(roots)
}

/**
 * @description 获取当前路由的一级菜单
 * @param {RouteLocationNormalizedLoaded} route
 * @return {*}
 */
export const getMenu1 = (route: RouteLocationNormalizedLoaded) => {
    if (route.matched && route.matched.length > 1) {
        return route.matched[1]
    }
    return null
}

/**
 * @description 获取当前路由的二级菜单
 * @param {RouteLocationNormalizedLoaded} route
 * @return {*}
 */
export const getMenu2 = (route: RouteLocationNormalizedLoaded) => {
    if (route.matched && route.matched.length > 2) {
        return route.matched[2]
    }
    return null
}

/**
 * @description 获取当前路由的三级菜单
 * @param {RouteLocationNormalizedLoaded} route
 * @return {*}
 */
export const getMenu3 = (route: RouteLocationNormalizedLoaded) => {
    if (route.matched && route.matched.length > 3) {
        return route.matched[3]
    }
    return null
}

/**
 * @description 获得配置列表菜单
 */
export const getConfigMenu = () => {
    const layoutStore = useLayoutStore()
    const find = authRoutes.find((item) => item.name === 'root')?.children?.find((item) => item.name === 'config')
    if (find) {
        layoutStore.configMenu = find
    }
}

router.afterEach((to: RouteLocationNormalized) => {
    closeLoading()
    progress.done()

    const element = document.getElementById('n9web')
    if (element) {
        element.style.setProperty('--main-min-width', to.meta.minWidth ? `${to.meta.minWidth}px` : 'var(--default-main-min-width)')
        element.style.setProperty('--main-min-height', to.meta.minHeight ? `${to.meta.minHeight}px` : 'var(--default-main-min-height)')
    }

    if (typeof to.redirectedFrom?.meta.cbk === 'function') {
        to.redirectedFrom.meta.cbk()
    } else if (typeof to.meta.cbk === 'function') {
        to.meta.cbk()
    }
})

router.beforeResolve(async (to: RouteLocationNormalized, _from, next) => {
    const layoutStore = useLayoutStore()
    const dateTime = useDateTimeStore()

    progress.start()
    if (!to.meta?.noToken) {
        try {
            await dateTime.getTimeConfig()
        } catch {}
    }
    closeAllLoading()

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

export default router
