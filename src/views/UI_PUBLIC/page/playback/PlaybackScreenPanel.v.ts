/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:38:08
 * @Description: 回放-底部控制视图
 */
import { type LiveSharedWinData } from '@/types/apiType/live'

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
         * @property 播放模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property 当前分屏数
         */
        split: {
            type: Number,
            required: true,
        },
        /**
         * @property 是否开启OSD状态
         */
        osd: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 是否开启POS状态
         */
        pos: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 是否开启水印状态
         */
        watermark: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 剪切范围
         */
        clipRange: {
            type: Array as PropType<number[]>,
            required: true,
        },
        /**
         * @property 播放通道列表
         */
        playingList: {
            type: Number,
            required: true,
        },
        /**
         * @property 播放状态
         */
        playStatus: {
            type: String,
            required: true,
        },
        /**
         * @property 是否有POS事件
         */
        hasPosEvent: {
            type: Boolean,
            required: true,
        },
    },
    emits: {
        'update:split': (num: number, type: number) => {
            return typeof num === 'number' && typeof type === 'number'
        },
        'update:osd': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:pos': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:watermark': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        fullscreen() {
            return true
        },
        stop() {
            return true
        },
        pause() {
            return true
        },
        pauseBackwards() {
            return true
        },
        nextFrame() {
            return true
        },
        prevFrame() {
            return true
        },
        jump(seconds: number) {
            return typeof seconds === 'number'
        },
        resume() {
            return true
        },
        backwards() {
            return true
        },
        setSpeed(speed: number) {
            return typeof speed === 'number'
        },
        pos(bool: boolean) {
            return typeof bool === 'boolean'
        },
        clipStart() {
            return true
        },
        clipEnd() {
            return true
        },
        backUp() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const { openNotify } = useNotification()

        const WASM_SEG = [1, 4].map((split) => ({
            split,
            type: 1,
        }))

        const OCX_SEG = [1, 4, 9, 16, 25, 36]
            .filter((item) => {
                return item <= systemCaps.playbackMaxWin
            })
            .map((split) => ({
                split,
                type: 1,
            }))

        const pageData = ref({
            // H5模式分屏
            wasmSeg: WASM_SEG,
            // OCX模式分屏
            ocxSeg: OCX_SEG,
            // 播放可配置速度列表
            speedList: [1 / 32, 1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32],
            // 速度值索引
            speedIndex: 5,
            // 是否显示POS按钮
            isPosBtn: systemCaps.supportPOS,
        })

        // 没有播放视图时，禁用操作按钮
        const disabled = computed(() => {
            return prop.playingList <= 0
        })

        /**
         * @description 暂停播放
         */
        const pause = () => {
            if (disabled.value) {
                return
            }

            if (prop.playStatus === 'backwards') {
                ctx.emit('pauseBackwards')
            } else {
                ctx.emit('pause')
            }
        }

        /**
         * @description 停止播放
         */
        const stop = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('stop')
        }

        /**
         * @description 恢复播放
         */
        const resume = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('resume')
        }

        /**
         * @description 倒放
         */
        const backwards = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('backwards')
        }

        // 当前速度值
        const speed = computed(() => {
            return pageData.value.speedList[pageData.value.speedIndex]
        })

        // 禁用慢速
        const rewindDisabled = computed(() => {
            return pageData.value.speedIndex === 0 || disabled.value
        })

        /**
         * @description 设置速度. H5模式和OCX模式表示慢速的速度值有差异
         */
        const setSpeed = () => {
            if (prop.mode === 'h5') {
                ctx.emit('setSpeed', speed.value)
            } else if (prop.mode === 'ocx') {
                if (speed.value < 1) {
                    ctx.emit('setSpeed', (1 / speed.value) * -1)
                } else {
                    ctx.emit('setSpeed', speed.value)
                }
            }
        }

        /**
         * @description 慢速
         */
        const rewind = () => {
            if (rewindDisabled.value) {
                return
            }
            pageData.value.speedIndex--
            setSpeed()
        }

        // 禁用倍速
        const forwardDisabled = computed(() => {
            return pageData.value.speedIndex === pageData.value.speedList.length - 1 || disabled.value
        })

        /**
         * @description 倍速
         */
        const forward = () => {
            if (forwardDisabled.value) {
                return
            }
            pageData.value.speedIndex++
            setSpeed()
        }

        // 禁用重置倍速播放
        const resetSpeedDisabled = computed(() => {
            return speed.value === 1 || disabled.value
        })

        /**
         * @description 重置倍速播放
         */
        const resetSpeed = () => {
            if (resetSpeedDisabled.value) {
                return
            }
            pageData.value.speedIndex = pageData.value.speedList.findIndex((index) => index === 1)
            setSpeed()
        }

        // 显示播放速度
        const displaySpeed = computed(() => {
            return speed.value < 1 ? `X1/${1 / speed.value}` : `X${speed.value}`
        })

        watch(
            () => prop.playStatus,
            (newVal, oldVal) => {
                if (newVal === 'play' && oldVal !== 'play') {
                    ctx.emit('setSpeed', speed.value)
                }
            },
        )

        /**
         * @description 跳转播放
         * @param {number} seconds 单位：秒
         */
        const jump = (seconds: number) => {
            if (disabled.value) {
                return
            }
            ctx.emit('jump', seconds)
        }

        // description 是否禁用切换帧
        const nextFrameDisabled = computed(() => {
            return disabled.value || prop.playStatus !== 'pause'
        })

        /**
         * @description 下一帧
         */
        const nextFrame = () => {
            if (nextFrameDisabled.value) {
                return
            }
            ctx.emit('nextFrame')
        }

        /**
         * @description 上一帧
         */
        const prevFrame = () => {
            if (nextFrameDisabled.value) {
                return
            }
            ctx.emit('prevFrame')
        }

        // 是否禁用POS
        const posDisabled = computed(() => {
            return !prop.hasPosEvent || disabled.value
        })

        /**
         * @description 开启/关闭POS
         * @param {Boolean} bool
         */
        const togglePos = (bool: boolean) => {
            if (posDisabled.value) {
                return
            }
            ctx.emit('update:pos', bool)
        }

        /**
         * @description 设置备份开始点
         */
        const setClipStart = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('clipStart')
        }

        /**
         * @description 设置备份结束点
         */
        const setClipEnd = () => {
            if (disabled.value) {
                return
            }
            ctx.emit('clipEnd')
        }

        // 禁用备份按钮
        const backUpDisabled = computed(() => {
            return disabled.value || prop.clipRange.length !== 2 || prop.clipRange[0] >= prop.clipRange[1]
        })

        /**
         * @description 备份
         */
        const backUp = () => {
            if (disabled.value) {
                return
            }

            if (backUpDisabled.value) {
                openNotify(Translate('IDCS_SELECT_BACKUP_START_END_TIME'), true)
                return
            }
            ctx.emit('backUp')
        }

        return {
            speed,
            pageData,
            disabled,
            stop,
            resume,
            backwards,
            pause,
            forward,
            rewind,
            resetSpeed,
            resetSpeedDisabled,
            forwardDisabled,
            rewindDisabled,
            jump,
            nextFrameDisabled,
            nextFrame,
            prevFrame,
            posDisabled,
            togglePos,
            displaySpeed,
            setClipStart,
            setClipEnd,
            backUpDisabled,
            backUp,
        }
    },
})
