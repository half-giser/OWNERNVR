/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 路由相关全局类型定义
 */
import { type RouteRecordName, type RouteRecordRaw } from 'vue-router'

export {}

declare global {
    /**
     * 多组件路径Map：
     * name：视图出口的名称
     * value：组件路径
     */
    type ComponentMap = Record<string, string>

    /**
     * 功能树
     */
    type FeatureTree = Record<string, FeatureItem>

    /**
     * 功能树元素分组元标签
     */
    interface FeatureItemGroupMeta {
        /** 是否没有权限访问，true不可访问，false可访问，如果undefined，则说明不受权限控制，可以访问 */
        // noAuth?: boolean
        /** 菜单排序 */
        sort?: number
        /** 菜单翻译key或菜单名称，如果没有对应翻译项就直接显示lk的值 */
        lk?: string
        /** 菜单项图标的类名 */
        icon?: string
        /** 是否不显示在菜单列表中， true不显示，false 和 undefined 显示 */
        noMenu?: boolean
    }
    /**
     * 功能树元素
     */
    interface FeatureItem {
        /** 子路由地址，如果为空，默认为将name驼峰转串行后的相对路径 */
        path?: string
        /** 别名 */
        alias?: any
        /** 路由名字 */
        name?: string
        /** 路由重定向 */
        redirect?: string
        /** 组件路径 `可选` */
        component?: string
        /** 多组件路径，用于需要通过命令视图在同级展示多个视图的场景 `可选` */
        components?: Record<string, string>
        /** 元标签 */
        meta: {
            /** 能力集是否支持回调，这里会传入能力集和UI名参数 **/
            hasCap?: (systemCaps: ReturnType<typeof useCababilityStore>) => boolean
            /** 是否需要token， true：不需要， undefined/false：需要 */
            noToken?: boolean
            /** 权限代号, 此值会传入useUserSessionStore.hasAuth()判断菜单可用/禁用状态. 如果undefined/空字符串，则为白名单，不受权限控制 */
            auth?: string
            /** 是否没有权限访问，true不可访问，false可访问，如果undefined，则说明不受权限控制，可以访问 */
            // noAuth?: boolean
            /** 路由组件缓存（开启 `true`、关闭 `false`）`可选` */
            keepAlive?: boolean
            /** 菜单排序 */
            sort?: number
            /** 菜单翻译key或菜单名称，如果没有对应翻译项就直接显示lk的值 */
            lk?: string
            /** 菜单项图标的类名 */
            icon?: string
            /** 是否不显示在菜单列表中， true不显示，false 和 undefined 显示 */
            noMenu?: boolean
            /** 是否显示在功能面板中, self: 显示，且名称为自己的翻译. group: 显示，且名称为分组的翻译. hidden: 不显示. undefined/null 未定义，由UI决定显示规则*/
            inHome?: 'self' | 'group' | null | 'hidden' | string
            /** 菜单在功能面板的排序 */
            homeSort?: number
            /** 分组 */
            group?: string
            /** 面包屑导航项列表（路由项的name） */
            navs?: string[]
            /** 是否默认菜单项 */
            default?: boolean
            /** 分组元标签 */
            groups?: Record<string, FeatureItemGroupMeta>
            /** 是否控制面板的默认菜单项 */
            homeDefault?: boolean
            remove?: boolean
            /** 页面最小宽度 */
            minWidth?: number
            /** 页面最小高度 */
            minHeight?: number
            /** 在afterEach执行的回调 */
            cbk?: () => void
        }
        /** 子路由配置项 */
        children?: FeatureTree
        /** 路由独享守卫 */
        beforeEnter?: RouteRecordRaw['beforeEnter']
    }

    // interface RouteRecordRawFeatureTree {
    //     name: RouteRecordName
    //     meta: FeatureItem['meta'] & {
    //         fullPath: string
    //         icon: string
    //     }
    // }
    type RouteRecordRawExtends = {
        path: string
        name: RouteRecordName
        meta: {
            /** 能力集是否支持回调，这里会传入能力集和UI名参数 **/
            hasCap?: (systemCaps: ReturnType<typeof useCababilityStore>) => boolean
            /** 是否需要token， true：不需要， undefined/false：需要 */
            noToken?: boolean
            /** 权限代号, 此值会传入useUserSessionStore.hasAuth()判断菜单可用/禁用状态. 如果undefined/空字符串，则为白名单，不受权限控制 */
            auth?: string
            /** 是否没有权限访问，true不可访问，false可访问，如果undefined，则说明不受权限控制，可以访问 */
            // noAuth?: boolean
            /** 路由组件缓存（开启 `true`、关闭 `false`）`可选` */
            keepAlive?: boolean
            /** 菜单翻译key或菜单名称，如果没有对应翻译项就直接显示lk的值 */
            lk?: string
            fullPath: string
            icon: string
            lk: string
            group: string
            noMenu?: boolean
            default?: boolean
            groups?: Record<string, FeatureItemGroupMeta>
            homeSort?: number
            sort?: number
            inHome?: 'self' | 'group' | null | 'hidden'
            homeDefault?: boolean
            /** 页面最小宽度 */
            minWidth?: number
            /** 页面最小高度 */
            minHeight?: number
            /** 在afterEach执行的回调 */
            cbk?: () => void
        }
        children: RouteRecordRawExtends[]
        redirect: string
        alias?: string
    }
}
