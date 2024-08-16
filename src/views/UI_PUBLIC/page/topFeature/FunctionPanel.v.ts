/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 20:42:33
 * @Description: 功能面板
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 19:19:37
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
