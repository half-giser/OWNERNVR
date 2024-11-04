/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:40
 * @Description: 回放-鱼眼视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:34:40
 */
import { type LiveSharedWinData } from '@/types/apiType/live'

export interface FishEyePanelExpose {
    exitAdjust: (chlId: string) => void
}

export default defineComponent({
    props: {
        /**
         * @property 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
        },
        /**
         * @property 安装类型
         */
        installType: {
            type: String,
            required: true,
        },
    },
    emits: {
        fishEyeMode(type: string, mode: string) {
            return typeof type === 'string' && typeof mode === 'string'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 菜单列表
            menu: [
                {
                    label: Translate('IDCS_FISHEYE_MODE_CEILING'),
                    file: 'fishmode_top',
                    cmd: '',
                    value: 'Top',
                    children: [
                        {
                            label: Translate('IDCS_FISH_ADJUST_ORIGIN'),
                            file: 'fishEyemodel',
                            cmd: '',
                            value: 'FISHEYE_ORIGNAL',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_360'),
                            file: 'topFloor_360',
                            cmd: '',
                            value: '360',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_NORMAL'),
                            file: 'topFloor_2x180',
                            cmd: '',
                            value: '2x180',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_3PTZ'),
                            file: 'fishEye_3PZ',
                            cmd: '',
                            value: 'FISH_3PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_4PTZ'),
                            file: 'fishEye_4PZ',
                            cmd: '',
                            value: 'FISH_4PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_6PTZ'),
                            file: 'topFloor_6PZ',
                            cmd: '',
                            value: '360_6PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_8PTZ'),
                            file: 'fishEye_8PZ',
                            cmd: '',
                            value: 'FISH_8PTZ',
                        },
                    ],
                },
                {
                    label: Translate('IDCS_FISHEYE_MODE_WALL'),
                    file: 'fishmode_wall',
                    cmd: '',
                    value: 'Wall',
                    children: [
                        {
                            label: Translate('IDCS_FISH_ADJUST_ORIGIN'),
                            file: 'fishEyemodel',
                            cmd: '',
                            value: 'FISHEYE_ORIGNAL',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_180'),
                            file: 'fishEyePanorama',
                            cmd: '',
                            value: '180',
                        },
                        {
                            label: Translate('IDCS_FISH_3PTZ'),
                            file: 'fishEye_3PZ',
                            cmd: '',
                            value: '180_3PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_4PTZ'),
                            file: 'fishEye_4PZ',
                            cmd: '',
                            value: '180_4PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_8PTZ'),
                            file: 'fishEye_8PZ',
                            cmd: '',
                            value: '180_8PTZ',
                        },
                    ],
                },
                {
                    label: Translate('IDCS_FISHEYE_MODE_DESTOP'),
                    file: 'fishmode_bottom',
                    cmd: '',
                    value: 'Floor',
                    children: [
                        {
                            label: Translate('IDCS_FISH_ADJUST_ORIGIN'),
                            file: 'fishEyemodel',
                            cmd: '',
                            value: 'FISHEYE_ORIGNAL',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_360'),
                            file: 'topFloor_360',
                            cmd: '',
                            value: '360',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_NORMAL'),
                            file: 'topFloor_2x180',
                            cmd: '',
                            value: '2x180',
                        },
                        {
                            label: Translate('IDCS_FISH_ADJUST_3PTZ'),
                            file: 'fishEye_3PZ',
                            cmd: '',
                            value: 'FISH_3PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_4PTZ'),
                            file: 'fishEye_4PZ',
                            cmd: '',
                            value: 'FISH_4PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_6PTZ'),
                            file: 'topFloor_6PZ',
                            cmd: '',
                            value: '360_6PTZ',
                        },
                        {
                            label: Translate('IDCS_FISH_8PTZ'),
                            file: 'fishEye_8PZ',
                            cmd: '',
                            value: 'FISH_8PTZ',
                        },
                    ],
                },
            ],
            // 安装类型
            installType: 'Top',
            // 鱼眼模式
            fishEyeMode: 'FISHEYE_ORIGNAL',
            // 正在鱼眼观测的通道ID
            fishEyeingId: '',
            // 支持的菜单列表
            supportMenu: [] as string[],
        })

        const NO_ADJUST_VALUE = 'FISHEYE_ORIGNAL'

        // @description 是否支持鱼眼
        const supportFishEye = computed(() => {
            return !!prop.installType
        })

        /**
         * @description 获取鱼眼能力集
         */
        const getFishEyeEnable = () => {
            Object.entries(systemCaps.fishEyeCap).forEach(([type, child]) => {
                pageData.value.supportMenu.push(type)
                child.forEach((item) => {
                    pageData.value.supportMenu.push(type + '_' + item)
                })
            })
        }

        /**
         * @description 更改安装类型
         * @param {string} installType
         */
        const changeInstallType = (installType: string) => {
            if (!supportFishEye.value || pageData.value.installType === installType) {
                return
            }
            pageData.value.installType = installType
            pageData.value.fishEyeMode = NO_ADJUST_VALUE

            ctx.emit('fishEyeMode', installType, NO_ADJUST_VALUE)
            pageData.value.fishEyeingId = ''
        }

        /**
         * @description 更改鱼眼模式
         * @param {string} fishEyeMode
         */
        const changeFishEyeMode = (fishEyeMode: string) => {
            if (!supportFishEye.value || pageData.value.fishEyeMode === fishEyeMode) {
                return
            }

            if (pageData.value.fishEyeingId && prop.winData.chlID !== pageData.value.fishEyeingId) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SUPPORT_ONE_FISHEYE'),
                })
                return
            }
            pageData.value.fishEyeMode = fishEyeMode
            ctx.emit('fishEyeMode', pageData.value.installType, fishEyeMode)

            if (fishEyeMode === NO_ADJUST_VALUE) {
                pageData.value.fishEyeingId = ''
            } else {
                pageData.value.fishEyeingId = prop.winData.chlID
            }
        }

        /**
         * @description 退出校正
         * @param {string} chlId
         */
        const exitAdjust = () => {
            changeInstallType(prop.installType)
        }

        onMounted(() => {
            getFishEyeEnable()
        })

        watch(
            () => prop.installType,
            (newVal) => {
                pageData.value.installType = newVal
                pageData.value.fishEyeMode = NO_ADJUST_VALUE
            },
        )

        ctx.expose({
            exitAdjust,
        })

        return {
            pageData,
            changeInstallType,
            changeFishEyeMode,
            supportFishEye,
        }
    },
})
