/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 20:42:33
 * @Description: 功能面板
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 10:46:20
 */

import { config } from '@/router/featureConfig/RouteUtil'
import { getMenuItems } from '@/router'
import { type RouteRecordRaw } from 'vue-router'

export default defineComponent({
    setup() {
        const router = useRouter()
        //去掉在控制面板不需要显示的菜单项，并排序
        const configModules = ref<RouteRecordRawExtends[]>([])

        /**
         * @description 获取功能面板的菜单列表
         */
        const getConfigModule = () => {
            const modules = getMenuItems(config.children as RouteRecordRawExtends[]).filter((item) => !!item.meta?.groups)
            modules.forEach((item) => {
                item.children = item.children.filter((subItem) => subItem.meta.inHome)
                item.children.forEach((subItem) => {
                    if (subItem.meta.inHome === 'group') {
                        subItem.meta.lk = item.meta.groups![subItem.meta.group].lk as string
                    }
                })
                item.children.sort((a, b) => {
                    return a.meta.homeSort! - b.meta.homeSort!
                })
            })
            modules.sort((a, b) => {
                return a.meta.sort! - b.meta.sort!
            })
            configModules.value = modules
        }

        /**
         * @description 点击主菜单，跳转默认子菜单
         * @param {RouteRecordRawExtends} moduleItem
         */
        const toDefault = function (moduleItem: RouteRecordRawExtends) {
            const defaultMenu = moduleItem.children?.find((o) => o.meta?.default === true) as RouteRecordRaw
            if (defaultMenu) {
                router.push(defaultMenu?.meta?.fullPath as string)
            }
        }

        const pageData = ref({
            // 选中的主菜单
            mainMenuIndex: 0,
            hoverMenuIndex: -1,
        })

        /**
         * @description 切换主菜单 （UI1-D）
         * @param {number} key
         */
        const changeMainMenu = (key: number) => {
            pageData.value.mainMenuIndex = key
        }

        /**
         * @description hover主菜单 （UI1-D）
         * @param {number} key
         * @param {boolean} bool
         */
        const hoverMainMenu = (key: number, bool: boolean) => {
            if (bool) {
                pageData.value.hoverMenuIndex = key
            } else {
                pageData.value.hoverMenuIndex = -1
            }
        }

        onMounted(() => {
            getConfigModule()
        })

        return {
            configModules,
            toDefault,
            router,
            pageData,
            changeMainMenu,
            hoverMainMenu,
        }
    },
})
