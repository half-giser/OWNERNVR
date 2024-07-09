/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 路由构建入口文件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-29 14:08:05
 */
import { createRouter, createWebHistory, type RouteLocationMatched, type RouteLocationNormalized, type RouteLocationNormalizedLoaded, type RouteRecordRaw } from 'vue-router'
import { buildRouter, setRouteAuth, root } from './featureConfig/RouteUtil'
import progress from '@bassist/progress'
import { APP_NAME } from '@/utils/constants'

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

const functionPanel = router.getRoutes().find((o) => o.name === 'functionPanel')

//一级菜单列表
const menu1Items = ref<RouteRecordRaw[]>([])
//当前进入的一级菜单项
const menu1Item = ref<null | RouteRecordRaw>(null)
//当前进入的一级菜单项的二级菜单列表
const menu2Items = ref<RouteRecordRaw[]>([])
//当前进入的二级菜单项
const menu2Item = ref<null | RouteRecordRaw>(null)
//当前进入的二级菜单项的三级菜单列表
const menu3Items = ref<RouteRecordRaw[]>([])
//当前进入的三级菜单项
const menu3Item = ref<null | RouteRecordRaw>(null)

//生成一级菜单
menu1Items.value = root.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRaw[]

router.beforeEach(() => {
    progress.start()
})

router.afterEach((to) => {
    const { title } = to.meta
    document.title = title ? `${title} - ${APP_NAME}` : APP_NAME
    progress.done()
})

//TODO 查询通道能力集，全局状态中设置不支持的功能项目

/*
注册全局路由守卫，设置当前的菜单状态
*/
router.beforeResolve((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: Function) => {
    menu1Item.value = null
    menu2Items.value = []
    if (to.matched && to.matched.length > 1) {
        menu1Item.value = to.matched[1]
        menu2Items.value = menu1Item.value.children
    }
    menu2Item.value = null
    menu3Items.value = []
    if (to.matched && to.matched.length > 2) {
        menu2Item.value = to.matched[2]
        menu3Items.value = menu2Item.value.children
    }
    menu3Item.value = null
    if (to.matched && to.matched.length > 3) {
        menu3Item.value = to.matched[3]
    }
    next()
})

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

export {
    routes as routeRawList,
    //一级菜单列表项
    menu1Items,
    //当前进入的一级菜单项
    menu1Item,
    //当前进入的一级菜单项的二级菜单列表
    menu2Items,
    //当前进入的二级菜单项
    menu2Item,
    //当前进入的二级菜单项的三级菜单列表
    menu3Items,
    //当前进入的三级菜单项
    menu3Item,
    //特殊视图--控制面板
    functionPanel,
    getMenu1,
    getMenu2,
    getMenu3,
    setRouteAuth,
}

export default router
