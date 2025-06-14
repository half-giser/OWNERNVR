/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 20:42:33
 * @Description: 功能面板
 */

import { getMenuItems } from '@/router'

export default defineComponent({
    setup() {
        const router = useRouter()
        //去掉在控制面板不需要显示的菜单项，并排序
        const configModules = ref<RouteRecordRawExtends[]>([])
        const userSession = useUserSessionStore()
        const layoutStore = useLayoutStore()

        /**
         * @description 获取功能面板的菜单列表
         */
        const getConfigModule = () => {
            const modules = getMenuItems(layoutStore.configMenu?.children || []).filter((item) => !!item.meta?.groups)
            modules.forEach((item) => {
                item.children = item.children.filter((subItem) => subItem.meta.inHome)
                item.children.forEach((subItem) => {
                    if (subItem.meta.inHome === 'group') {
                        subItem.meta.lk = item.meta.groups![subItem.meta.group].lk as string
                    } else if (subItem.meta.inHome && subItem.meta.inHome !== 'hidden' && subItem.meta.inHome !== 'self') {
                        subItem.meta.lk = subItem.meta.inHome
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

            const menuIndex = configModules.value.findIndex((item) => !getMenuDisabled(item))
            if (menuIndex > -1) {
                pageData.value.mainMenuIndex = menuIndex
            }
        }

        const plClass = computed(() => {
            if (configModules.value.length === 7) {
                return ['md2', 'md2', 'md2', 'md3', 'md3', 'md1', 'md3']
            } else {
                return Array(configModules.value.length).fill('md2')
            }
        })

        /**
         * @description 点击主菜单，跳转默认子菜单
         * @param {RouteRecordRawExtends} moduleItem
         */
        const goToDefaultPage = (moduleItem: RouteRecordRawExtends) => {
            if (moduleItem.meta.auth && !userSession.hasAuth(moduleItem.meta.auth)) {
                return
            }
            const defaultMenu = moduleItem.children.find((o) => o.meta.homeDefault === true && !getMenuDisabled(o))
            if (defaultMenu) {
                router.push(defaultMenu.meta.fullPath)
            } else {
                router.push(moduleItem.redirect)
                // const defaultMenu = moduleItem.children.find((item) => !getMenuDisabled(item))
                // if (defaultMenu) {
                //     router.push(defaultMenu.meta.fullPath)
                // }
            }
        }

        /**
         * @description 跳转子菜单页面
         * @param {RouteRecordRawExtends} subMenu
         * @param {RouteRecordRawExtends} moduleItem
         */
        const goToPage = (subMenu: RouteRecordRawExtends, moduleItem: RouteRecordRawExtends) => {
            if (moduleItem.meta.auth && !userSession.hasAuth(moduleItem.meta.auth)) {
                return
            }

            if (subMenu.meta.auth && !userSession.hasAuth(subMenu.meta.auth)) {
                return
            }
            router.push(subMenu.meta.fullPath)
        }

        const pageData = ref({
            // 选中的主菜单
            mainMenuIndex: 0,
            hoverMenuIndex: -1,
            activeIconIndex: import.meta.env.VITE_UI_TYPE === 'UI1-D' || import.meta.env.VITE_UI_TYPE === 'UI1-Q' || import.meta.env.VITE_UI_TYPE === 'UI1-N' ? 0 : 1,
            normalIconIndex: import.meta.env.VITE_UI_TYPE === 'UI1-D' || import.meta.env.VITE_UI_TYPE === 'UI1-Q' || import.meta.env.VITE_UI_TYPE === 'UI1-N' ? 1 : 0,
        })

        /**
         * @description 切换主菜单 （UI1-D/UI1-G）
         * @param {number} key
         * @param {RouteRecordRawExtends} moduleItem
         */
        const changeMainMenu = (key: number, moduleItem: RouteRecordRawExtends) => {
            if (getMenuDisabled(moduleItem)) {
                return
            }
            pageData.value.mainMenuIndex = key
        }

        /**
         * @description hover主菜单 （UI1-D/UI1-G）
         * @param {number} key
         * @param {boolean} bool
         * @param {RouteRecordRawExtends} moduleItem
         */
        const hoverMainMenu = (key: number, bool: boolean, moduleItem: RouteRecordRawExtends) => {
            if (getMenuDisabled(moduleItem)) {
                return
            }

            if (bool) {
                pageData.value.hoverMenuIndex = key
            } else {
                pageData.value.hoverMenuIndex = -1
            }
        }

        /**
         * @description 是否禁用菜单
         * @param {RouteRecordRawExtends} route
         * @returns {boolean}
         */
        const getMenuDisabled = (route: RouteRecordRawExtends) => {
            return typeof route.meta.auth !== 'undefined' && !userSession.hasAuth(route.meta.auth)
        }

        watch(
            () => layoutStore.configMenu,
            () => {
                getConfigModule()
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            // 检测是否登录超时
            heartBeat()
        })

        return {
            configModules,
            goToDefaultPage,
            goToPage,
            router,
            pageData,
            changeMainMenu,
            hoverMainMenu,
            getMenuDisabled,
            plClass,
        }
    },
})
