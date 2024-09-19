/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2023-05-09 16:45:59
 * @Description: 导航全局存储
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 12:03:03
 */

import { type RouteRecordRaw, type RouteMeta } from 'vue-router'
import { LocalCacheKey } from '@/utils/constants'

export const useMenuStore = defineStore(
    'menu',
    () => {
        const router = useRouter()
        const route = useRoute()

        /** 系统类型 */
        const systemTypes = { monitor: { lk: 'IDCS_MONITOR_PLATFORM' }, config: { lk: 'IDCS_CONFIG_PLATFORM' } }
        /** 当前系统类型 */
        const sysType = ref('') as Ref<string>
        /** 左侧导航是否展开 */
        const leftNavExpand = ref(undefined) as Ref<boolean | undefined>
        /** 上次现场预览的块数 */
        const liveLastSegNum = ref(0)
        /** 上次现场预览的通道 */
        const liveLastPlayChlList = ref<string[]>([])

        /**
         * @description: 设置当前系统类型
         * @param {string} value
         * @return {*}
         */
        const setSysType = async (activeName: string, oldActiveName: string): Promise<boolean> => {
            const res = await router.push('/' + activeName)
            if (oldActiveName && res) {
                sysType.value = oldActiveName
                return false
            }
            sysType.value = activeName
            return true
        }

        /**
         * @description: 获取当前系统类型
         * @return {*}
         */
        const getSysType = () => {
            // console.log("-------------------------:" + route.fullPath);
            const sysType = route.fullPath.substring(1).split('/')[0]
            return sysType ? sysType : 'monitor'
        }

        /**
         * @description: 跳转
         * @param {RouteRecordRaw} item
         * @return {*}
         */
        const goPath = (item: RouteRecordRaw) => {
            router.push(<string>(<RouteMeta>item.meta).fullPath)
        }

        /**
         * @description: 菜单项是否显示
         * @param {RouteRecordRaw} item
         * @return {*}
         */
        const isMenuItemShow = (item: RouteRecordRawExtends) => {
            const systemCaps = useCababilityStore()
            const theme = getUiAndTheme().name
            return typeof item.meta.auth === 'undefined' || item.meta.auth(systemCaps, theme)
        }

        /**
         * @description: 子菜单是否显示
         * @param {RouteRecordRaw} item
         * @return {*}
         */
        const isSubMenuShow = (item: RouteRecordRawExtends) => {
            return item.children && item.children.find(() => isMenuItemShow(item))
        }

        /**
         * @description: 将leftNavExpand包装为getter，setter，在sessionStorage持久化状态，使得刷新浏览器时可保持之前的状态
         * @param {*} computed
         * @return {*}
         */
        const getLeftNavExpand = () => {
            if (leftNavExpand.value != undefined) {
                return leftNavExpand.value
            }
            const expand = sessionStorage.getItem(LocalCacheKey.leftNavExpand)
            if (expand === undefined) {
                sessionStorage.setItem(LocalCacheKey.leftNavExpand, 'false')
                leftNavExpand.value = false
            } else {
                leftNavExpand.value = sessionStorage.getItem(LocalCacheKey.leftNavExpand) === 'true'
            }
            return leftNavExpand.value
        }

        /**
         * @description: 将leftNavExpand包装为getter，setter，在sessionStorage持久化状态，使得刷新浏览器时可保持之前的状态
         * @param {*} computed
         * @return {*}
         */
        const setLeftNavExpand = (value: boolean) => {
            leftNavExpand.value = value
            sessionStorage.setItem(LocalCacheKey.leftNavExpand, '' + value)
        }

        return {
            systemTypes,
            setSysType,
            getSysType,
            setLeftNavExpand,
            getLeftNavExpand,
            goPath,
            isMenuItemShow,
            isSubMenuShow,

            liveLastSegNum,
            liveLastPlayChlList,
        }
    },
    {
        persist: true,
    },
)
