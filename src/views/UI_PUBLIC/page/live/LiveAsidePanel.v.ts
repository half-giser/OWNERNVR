/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-26 16:38:37
 * @Description: 现场预览-右侧视图 Layout
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 15:34:58
 */
import { type LiveChannelList, LiveUserAuth, LiveSharedWinData } from '@/types/apiType/live'
import { APP_TYPE } from '@/utils/constants'

export default defineComponent({
    props: {
        /**
         * @property 播放器模式
         */
        mode: {
            type: String,
            required: true,
            default: '',
        },
        /**
         * @property 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
            default: () => new LiveSharedWinData(),
        },
        /**
         * @property 用户权限
         */
        auth: {
            type: Object as PropType<LiveUserAuth>,
            required: true,
            default: () => new LiveUserAuth(),
        },
        /**
         * @property 通道与能力的映射
         */
        chl: {
            type: Object as PropType<Record<string, LiveChannelList>>,
            required: true,
            default: () => ({}),
        },
        /**
         * @property 支持镜头控制
         */
        supportAz: {
            type: Boolean,
            required: true,
            default: false,
        },
        /**
         * @property 支持鱼眼
         */
        supportFishEye: {
            type: Boolean,
            required: true,
            default: false,
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
            const targetDetection = {
                tab: 0,
                file: 'live_target_detection',
                label: Translate('IDCS_TARGET_DETECTION'),
                value: 'target_detection',
            }
            const control = {
                tab: 1,
                file: 'live_operation',
                label: Translate('IDCS_OPERATION'),
                value: 'operation',
            }
            const lens = {
                tab: 2,
                file: 'live_setting',
                label: Translate('IDCS_SCENE_CONTROL'),
                value: 'lens',
            }
            const ptz = {
                tab: 3,
                file: 'live_ptz',
                label: Translate('IDCS_PTZ'),
                value: 'ptz',
            }
            const fishEye = {
                tab: 4,
                file: 'live_fisheye',
                label: Translate('IDCS_FISHEYE'),
                value: 'fish_eye',
            }

            if (prop.mode === 'h5') {
                return [targetDetection, control, lens, ptz]
            } else if (prop.mode === 'ocx') {
                if (APP_TYPE === 'P2P') {
                    return [control, lens, ptz, fishEye]
                } else {
                    return [targetDetection, control, lens, ptz, fishEye]
                }
            }
            return []
        })

        // 支持镜头控制
        const lensEnabled = computed(() => {
            if (!prop.winData.chlID || prop.winData.PLAY_STATUS !== 'play') {
                return false
            }
            if (!prop.supportAz) {
                return false
            }
            return true
        })

        // 支持云台
        const ptzEnabled = computed(() => {
            const chlID = prop.winData.chlID
            if (!chlID || prop.winData.PLAY_STATUS !== 'play') {
                return false
            }
            if (prop.chl[chlID]?.supportPtz && !prop.winData.isPolling && (prop.auth.hasAll || prop.auth.ptz[chlID])) {
                return true
            }
            return false
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
            if (value === 'lens') return lensEnabled.value
            if (value === 'ptz') return ptzEnabled.value
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
            if (!lensEnabled.value && value === 'lens') {
                pageData.value.activeMenu = 0
            } else if (!ptzEnabled.value && value === 'ptz') {
                pageData.value.activeMenu = 0
            } else if (!fishEyeEnabled.value && value === 'fish_eye') {
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
