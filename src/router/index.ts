/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description: 路由构建入口文件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 17:52:31
 */
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { buildRouter, setRouteAuth } from './featureConfig/RouteUtil'
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

//生成一级菜单
// menu1Items.value = root.children?.filter((o) => !o.meta?.noMenu) as RouteRecordRaw[]

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
    // TODO: MenuItems 需要deepClone，且不能包含component
    const routeStore = useRouteStore()
    routeStore.menu1Item = undefined
    routeStore.menu2Items = []
    if (to.matched && to.matched.length > 1) {
        routeStore.menu1Item = to.matched[1]
        routeStore.menu2Items = routeStore.menu1Item.children
    }
    routeStore.menu2Item = undefined
    routeStore.menu3Items = []
    if (to.matched && to.matched.length > 2) {
        routeStore.menu2Item = to.matched[2]
        routeStore.menu3Items = routeStore.menu2Item.children
    }
    routeStore.menu3Item = undefined
    if (to.matched && to.matched.length > 3) {
        routeStore.menu3Item = to.matched[3]
    }
    next()
})

export { routes as routeRawList, setRouteAuth }

export default router
