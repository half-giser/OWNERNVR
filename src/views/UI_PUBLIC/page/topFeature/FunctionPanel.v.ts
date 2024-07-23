/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 20:42:33
 * @Description: 功能面板
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-15 09:13:16
 */

import { config } from '@/router/featureConfig/RouteUtil'
import { getMenuItems } from '@/router'
import { type RouteRecordRaw } from 'vue-router'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
    },
    setup() {
        const router = useRouter()
        //去掉在控制面板不需要显示的菜单项，并排序
        const configModules = ref<RouteRecordRawExtends[]>([])

        const getConfigModule = () => {
            const modules = getMenuItems(config.children as RouteRecordRawExtends[])
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

            // ;(config.children as RouteRecordRawExtends[])?.forEach((o) => {
            //     const configModule = {} as RouteRecordRawExtends
            //     configModules.value.push(configModule)
            //     configModule.name = o.name as RouteRecordName
            //     configModule.meta = {
            //         // 默认以模块的name作为默认icon类名
            //         icon: o.meta.icon === undefined ? (o.name as string) : o.meta.icon,
            //         fullPath: o.meta.fullPath || '',
            //         lk: o.meta.lk || '',
            //         plClass: o.meta.plClass || '',
            //         group: o.meta.group || '',
            //         sort: o.meta.sort || 0,
            //     }
            //     // configModule.meta = {}
            //     //默认以模块的name作为默认icon类名
            //     // configModule.meta.icon = o.meta?.icon === undefined ? o.name : o.meta.icon
            //     // configModule.meta.fullPath = o.meta?.fullPath
            //     // configModule.meta.lk = o.meta?.lk
            //     // configModule.meta.plClass = o.meta?.plClass
            //     configModule.children = o.children.filter((item) => item.meta?.inHome)
            //     configModule.children.forEach((m) => {
            //         if (m.meta?.inHome === 'group') {
            //             ;(m.meta as RouteMeta).lk = (o.meta?.groups as Record<string, FeatureItemGroupMeta>)[m.meta?.group as string].lk
            //         }
            //     })
            //     configModule.children.sort((a, b) => {
            //         return (a.meta?.homeSort as number) - (b.meta?.homeSort as number)
            //     })
            // })
            // configModules.value.sort((a, b) => {
            //     return (a.meta.sort as number) - (b.meta.sort as number)
            // })
        }

        const toDefault = function (moduleItem: RouteRecordRawExtends) {
            const defaultMenu = moduleItem.children?.find((o) => o.meta?.default === true) as RouteRecordRaw
            if (defaultMenu) {
                router.push(defaultMenu?.meta?.fullPath as string)
            }
        }

        onMounted(() => {
            getConfigModule()
        })

        return {
            configModules,
            toDefault,
            router,
        }
    },
})
