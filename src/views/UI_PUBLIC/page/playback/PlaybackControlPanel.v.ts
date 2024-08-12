/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:37:13
 * @Description: 回放-操作视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 10:56:04
 */
import { LiveSharedWinData } from '@/types/apiType/live'

export default defineComponent({
    props: {
        /**
         * @property 播放模式
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
         * @property 分屏数
         */
        split: {
            type: Number,
            required: true,
            default: 1,
        },
        /**
         * @property 音量
         */
        volume: {
            type: Number,
            required: true,
            default: 50,
        },
    },
    emits: {
        snap() {
            return true
        },
        closeImg() {
            return true
        },
        zoomIn() {
            return true
        },
        zoomOut() {
            return true
        },
        originalDisplay(bool: boolean) {
            return typeof bool === 'boolean'
        },
        streamType(type: number) {
            return !isNaN(type)
        },
        volume(num: number) {
            return !isNaN(num)
        },
        audio(bool: boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 码流类型0：主码流，1：子码流
            streamMenuOptions: [
                {
                    label: Translate('IDCS_MAIN_STREAM'),
                    value: 0,
                },
                {
                    label: Translate('IDCS_SUB_STREAM'),
                    value: 1,
                },
            ] as SelectOption<number, string>[],
        })

        // 当前窗口通道ID
        const chlID = computed(() => {
            return prop.winData.chlID
        })

        // 是否禁用
        const disabled = computed(() => {
            if (!chlID.value) {
                return true
            }
            if (prop.winData.PLAY_STATUS === 'stop') {
                return true
            }
            if (prop.winData.PLAY_STATUS === 'play') {
                return false
            }
            return true
        })

        /**
         * @description 抓图
         */
        const snap = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('snap')
        }

        /**
         * @description 关闭图像
         */
        const closeImg = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('closeImg')
        }

        /**
         * @description 放大
         */
        const zoomIn = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('zoomIn')
        }

        /**
         * @description 缩小
         */
        const zoomOut = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('zoomOut')
        }

        // 是否禁用原始比例
        const originalDisplayDisabled = computed(() => {
            return !systemCaps.supportOriginalDisplay || disabled.value
        })

        /**
         * @description 原始比例
         */
        const originalDisplay = () => {
            if (originalDisplayDisabled.value) {
                return
            }
            ctx.emit('originalDisplay', !prop.winData.original)
        }

        // 是否禁用码流类型
        const streamTypeDisabled = computed(() => {
            if (prop.mode === 'ocx') {
                return disabled.value
            } else {
                return disabled.value || prop.split === 4
            }
        })

        /**
         * @description 更新码流
         * @param {number} type
         */
        const changeStreamType = (type: number) => {
            if (prop.winData.streamType === type) {
                return
            }
            if (streamTypeDisabled.value && type === 0) {
                return
            }
            ctx.emit('streamType', type)
        }

        // 是否禁用音频
        const audioDisabled = computed(() => {
            if (!prop.winData.supportAudio) {
                return true
            }
            return disabled.value
        })

        /**
         * @description 设置音量
         */
        const setVolume = (num: number) => {
            if (audioDisabled.value) {
                return
            }
            ctx.emit('volume', num)
        }

        /**
         * @description 设置是否静音
         * @param {Boolean} bool
         */
        const setAudioStatus = (bool: boolean) => {
            if (audioDisabled.value) {
                return
            }
            ctx.emit('audio', !bool)
        }

        return {
            pageData,
            disabled,
            originalDisplayDisabled,
            snap,
            closeImg,
            zoomIn,
            zoomOut,
            originalDisplay,
            streamTypeDisabled,
            changeStreamType,
            audioDisabled,
            setVolume,
            setAudioStatus,
        }
    },
})
