/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 20:02:12
 * @Description: 路由工具类
 * 用于根据UI配置和功能树动态生成指定UI的路由
 */

/*
多UI开发规则：
1、UI_PUBLIC有所有view的全量代码，且将html和js拆到外部文件，所以包括： .vue（里面包含scop style）, .html, .js
2、其他UI目录仅包含差异文件，具体如下：（d->different)
+------+-----+----+---------------------------------------------------------+
| html | css | js | 方案                                                     |
+------+-----+----+---------------------------------------------------------+
| d    | d   | d  | 1、新增本UI的三合一vue组件（.vue + .v.ts）                   |
| d    | d   |    | 2、新增本UI带template和scope style的vue文件，js引用public的  |
|      | d   | d  | 3、场景不存在                                              |
| d    |     | d  | 4、场景不存在                                              |
| d    |     |    | 5、场景不存在                                              |
|      | d   |    | 6、新增本UI的vue文件，文件里引用public的vue，
|      |     |    |    并在文件中定义scope style覆盖样式                         |
|      |     | d  | 7、场景不存在                                              |
|      |     |    | 8、直接使用public的vue                                     |
+------+-----+----+----------------------------------------------------------+
所以其他UI可能会产生自己的vue文件，并且可能引用public的html和js文件。
*/

import featureTree from './featureTree'
import type { RouteMeta, RouteRecordRaw } from 'vue-router'
// import { camel2Kebab } from '../../utils/tools'

export const camel2Kebab = (name: string) => {
    const arr = name.split('')
    // 使用循环遍历字符串
    const nameArr = arr.map((item) => {
        if (item.toUpperCase() === item) {
            // 使用toUpperCase()方法检测当前字符是否为大写
            return '-' + item.toLowerCase()
            // 大写就在前面加上-，并用toLowerCase()将当前字符转为小写
        } else {
            return item
        }
    })
    return nameArr.join('')
}

//视图集合
const viewComponents: Record<string, any> = {}
const puglicPages = import.meta.glob('@public/page/**/*.vue')
const uiPages = import.meta.glob('@ui/page/**/*.vue')

// let uiPages: Record<string, any> = {} // import.meta.glob(import.meta.env.VITE_UI)
// //新增UI后，需要在这里增加
// if (__UI_1__) {
//     uiPages = import.meta.glob('/src/views/UI1/page/**/*.vue')
// }
// if (__UI_2__) {
//     uiPages = import.meta.glob('/src/views/UI2/page/**/*.vue')
// }
// if (__UI_3__) {
//     uiPages = import.meta.glob('/src/views/UI3/page/**/*.vue')
// }

const getItemName = (file: string) => {
    const item = file.replace('/src/views/', '')
    return item.substring(item.indexOf('/', item.indexOf('/') + 1) + 1)
}

Object.keys(uiPages).forEach((prop) => {
    viewComponents[getItemName(prop)] = uiPages[prop]
})

Object.keys(puglicPages).forEach((prop) => {
    const itemName = getItemName(prop)
    if (!(itemName in viewComponents)) {
        viewComponents[itemName] = puglicPages[prop]
    }
})

// let root: RouteRecordRaw
// let config: RouteRecordRaw

/**
 * @description: 基于功能树和UI配置生成路由树
 * @return {*}
 */
function buildRouter() {
    //路由原始记录数组
    const routes = [] as RouteRecordRaw[]
    //递归遍历功能树生成路由原始记录数组
    resolveRouteTree(featureTree, routes, null)

    //递归对各级路由原始记录，按meta.sort进行排序，这个元信息字段用来控制统计菜单显示的顺序
    sortRouts(routes)

    // 设置路由权限，在登录后调用
    // setRouteAuth(routes);

    //将第一个有权限的子路由设置为上一级的默认路由，设置父路由的redirct为默认子路由
    // setRouteDefault(routes)

    return routes
}

/**
 * @description:
 * @param {RouteRecordRaw} routes
 * @return {*}
 */
function sortRouts(routes: RouteRecordRaw[]) {
    routes.sort(routeSortFun)
    routes.forEach((item) => {
        if (item.children) {
            sortRouts(item.children)
        }
    })
}

function routeSortFun(a: RouteRecordRaw, b: RouteRecordRaw): number {
    return <number>(<RouteMeta>a.meta).sort - <number>(<RouteMeta>b.meta).sort
}

/**
 * @description: 设置路由权限
 * @param {RouteRecordRaw} _routes
 * @return {*}
 */
// function setRouteAuth(_routes: RouteRecordRaw[]) {
//     //TODO: 设置权限
//     console.log(_routes)
// }

/**
 * @description: 将第一个有权限的子路由设置为上一级的默认路由，设置父路由的redirct为默认子路由
 * @param {RouteRecordRaw} routes
 * @return {*}
 */
// function setRouteDefault(routes: RouteRecordRaw[]): void {
//     // routes.forEach((item) => {
//     //     if (item.children) {
//     //         const defaultRoute = item.children.find((o) => {
//     //             const auth = (<RouteMeta>o.meta).auth
//     //             return auth === undefined || auth
//     //         })
//     //         if (defaultRoute) {
//     //             item.redirect = (<RouteMeta>defaultRoute.meta).fullPath as string
//     //         }
//     //         setRouteDefault(item.children)
//     //     }
//     // })
// }

/**
 * @description: 解析树/子树
 * @param {FeatureTree} tree
 * @param {string} ui
 * @param {RouteRecordRaw} routes
 * @return {*}
 */
function resolveRouteTree(tree: FeatureTree, routes: RouteRecordRaw[], parent: RouteRecordRaw | null) {
    for (const key in tree) {
        //如果没有设置name，用key作为默认的name
        if (tree[key].name === undefined) {
            tree[key].name = key
        }
        resolveRouteItem(tree[key], routes, parent)
    }
}

/**
 * @description: 解析功能节点
 * @param {FeatureItem} featureItem
 * @param {RouteRecordRaw} routes
 * @return {*}
 */
function resolveRouteItem(featureItem: FeatureItem, routes: RouteRecordRaw[], parent: RouteRecordRaw | null) {
    const routeRecord = {} as RouteRecordRaw
    routes.push(routeRecord)
    //非叶子节点，菜单页面
    if ('children' in featureItem) {
        setRouteRecordField(featureItem, routeRecord, parent)
        routeRecord.children = []
        //解析子树
        resolveRouteTree(<FeatureTree>featureItem.children, routeRecord.children, routeRecord)
        ;(<RouteMeta>routeRecord.meta).children = routeRecord.children
    } else {
        //叶子节点，功能页面
        setRouteRecordField(featureItem, routeRecord, parent)
    }
}

/**
 * @description: 设置路由对象的字段
 * @param {FeatureItem} featureItem
 * @param {string} ui
 * @param {RouteRecordRaw} routeRecord
 * @return {*}
 */
function setRouteRecordField(featureItem: FeatureItem, routeRecord: RouteRecordRaw, parent: RouteRecordRaw | null) {
    if (featureItem.components) {
        routeRecord.components = {}
        for (const viewName in featureItem.components) {
            routeRecord.components[viewName] = viewComponents[featureItem.components[viewName]]
        }
    } else if (featureItem.component) {
        routeRecord.component = viewComponents[featureItem.component]
    }
    if (featureItem.name) {
        routeRecord.name = featureItem.name
        // if (featureItem.name === 'root') {
        //     root = routeRecord
        // } else if (featureItem.name === 'config') {
        //     config = routeRecord
        // }
    }
    if (featureItem.meta) {
        routeRecord.meta = featureItem.meta
    } else {
        routeRecord.meta = {}
    }
    routeRecord.name = featureItem.name
    routeRecord.path = featureItem.path === undefined ? camel2Kebab(<string>featureItem.name) : featureItem.path
    routeRecord.meta.parent = parent
    let parentPath = ''
    if (parent) {
        parentPath = (<RouteMeta>parent.meta).fullPath as string
    }
    if (routeRecord.path === '') {
        routeRecord.meta.fullPath = ''
    } else if (routeRecord.path.startsWith('/')) {
        routeRecord.meta.fullPath = routeRecord.path
    } else {
        routeRecord.meta.fullPath = parentPath + '/' + routeRecord.path
    }

    if (featureItem.redirect) {
        routeRecord.redirect = featureItem.redirect
    }
    if (featureItem.alias) {
        routeRecord.alias = featureItem.alias
    }
}

export {
    buildRouter, //基于功能树和UI配置生成路由树
    // setRouteAuth, //设置路由权限
    // root, //登录后的根路由节点
    // config, //配置的根路由节点
}
