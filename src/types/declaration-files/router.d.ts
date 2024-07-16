/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-04-27 14:59:23
 * @Description: 路由相关全局类型定义
 */
import { type RouteRecordName } from 'vue-router'

export {}

declare global {
    /**
     * 有效的UI名称
     * 同时也跟src\views下的UI目录的名字对应
     */
    type UiName = 'UI1' | 'UI2' | 'UI3' | 'UI4' | 'UI5'

    /**
     * UI和主题
     */
    interface UiAndTheme {
        ui: UiName
        theme: string
        name: string
    }

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
        noAuth?: boolean
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
        components?: componentMap
        /** 元标签 */
        meta: {
            /** 权限访问回调 **/
            auth?: (arg: any) => boolean
            /** 是否没有权限访问，true不可访问，false可访问，如果undefined，则说明不受权限控制，可以访问 */
            noAuth?: boolean
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
            /** 是否显示在功能面板中, self：显示，且名称为自己的翻译。 group：显示，且名称为分组的翻译。 undefined 不显示*/
            inHome?: 'self' | 'group' | undefined
            /** 菜单在功能面板的排序 */
            homeSort?: number
            /** 功能面板上显示样式类，只有配置模块项有效，即config的下一级 */
            plClass?: string
            /** 分组 */
            group?: string
            /** 面包屑导航项列表（路由项的name） */
            navs?: string[]
            /** 是否默认菜单项 */
            default?: boolean
            /** 分组元标签 */
            groups?: Record<string, FeatureItemGroupMeta>
        }
        /** 子路由配置项 */
        children?: FeatureTree
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
            /** 权限访问回调 **/
            auth?: (arg: any) => boolean
            /** 是否没有权限访问，true不可访问，false可访问，如果undefined，则说明不受权限控制，可以访问 */
            noAuth?: boolean
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
            plClass?: string
            groups?: Record<string, FeatureItemGroupMeta>
            homeSort?: number
            sort?: number
            inHome?: 'self' | 'group'
        }
        children: RouteRecordRawExtends[]
    }

    /**
     * 路由组名称
     */
    type RouteGroupName = 'monitor' | 'config' | 'common'
}
