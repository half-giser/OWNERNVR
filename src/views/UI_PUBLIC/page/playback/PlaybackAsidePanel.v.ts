/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:35:43
 * @Description: 回放-右侧视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:38:01
 */
import { type LiveSharedWinData } from '@/types/apiType/live'

export default defineComponent({
    props: {
        /**
         * @property 播放器模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
        },
        /**
         * @property 支持鱼眼
         */
        supportFishEye: {
            type: Boolean,
            required: true,
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 是否显示右侧视图
            isOpen: true,
            // 当前选中的菜单索引
            activeMenu: 0,
        })

        // 根据播放模式生成菜单列表
        const menu = computed(() => {
            const control = {
                tab: 0,
                file: 'live_operation',
                label: Translate('IDCS_OPERATION'),
                value: 'operation',
            }

            const fishEye = {
                tab: 1,
                file: 'live_fisheye',
                label: Translate('IDCS_FISHEYE'),
                value: 'fish_eye',
            }

            if (prop.mode === 'h5') {
                return [control]
            } else if (prop.mode === 'ocx') {
                return [control, fishEye]
            }
            return [control]
        })

        // 支持鱼眼
        const fishEyeEnabled = computed(() => {
            const chlID = prop.winData.chlID
            if (!chlID || prop.winData.PLAY_STATUS !== 'play') {
                return false
            }
            return prop.supportFishEye
        })

        /**
         * @description 获取菜单是否可用
         * @param {string} value
         */
        const getMenuEnable = (value: string) => {
            if (value === 'fish_eye') return fishEyeEnabled.value
            return true
        }

        /**
         * @description 切换菜单
         * @param {number} index
         */
        const changeCtrlMenu = (index: number) => {
            if (!getMenuEnable(menu.value[index].value)) {
                return
            }
            pageData.value.activeMenu = index
        }

        watchEffect(() => {
            const value = menu.value[pageData.value.activeMenu]?.value || ''
            if (!fishEyeEnabled.value && value === 'fish_eye') {
                pageData.value.activeMenu = 0
            }
        })

        return {
            pageData,
            changeCtrlMenu,
            getMenuEnable,
            menu,
        }
    },
})
