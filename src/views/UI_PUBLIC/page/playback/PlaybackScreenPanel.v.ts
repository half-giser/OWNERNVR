/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:38:08
 * @Description: 回放-底部控制视图
 */
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
        strategy: {
            type: Boolean,
            required: true,
        },
        isBackUpList: {
            type: Boolean,
            required: true,
        },
        detectTarget: {
            type: Boolean,
            required: true,
        },
        recList: {
            type: Array as PropType<PlaybackRecList[]>,
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
        'update:detectTarget': (bool: boolean) => {
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
        'update:strategy'(bool: boolean) {
            return typeof bool === 'boolean'
        },
        showBackUp() {
            return true
        },
        trigger(bool: boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

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
            forwardValue: 30,
            forwardOptions: [5, 10, 15, 20, 30].map((item) => {
                return {
                    value: item,
                    label: displaySecondWithUnit(item),
                }
            }),
            strategy: false,
            isStrategyPop: false,
        })

        // 没有播放视图时，禁用操作按钮
        const disabled = computed(() => {
            return prop.playingList <= 0
        })

        /**
         * @description 暂停播放
         */
        const pause = () => {
            if (prop.playStatus === 'backwards') {
                ctx.emit('pauseBackwards')
            } else {
                ctx.emit('pause')
            }
            ctx.emit('trigger', false)
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
            pageData.value.speedIndex--
            setSpeed()
            ctx.emit('trigger', true)
        }

        // 禁用倍速
        const forwardDisabled = computed(() => {
            return pageData.value.speedIndex === pageData.value.speedList.length - 1 || disabled.value
        })

        /**
         * @description 倍速
         */
        const forward = () => {
            pageData.value.speedIndex++
            setSpeed()
            ctx.emit('trigger', true)
        }

        // 禁用重置倍速播放
        const resetSpeedDisabled = computed(() => {
            return speed.value === 1 || disabled.value
        })

        /**
         * @description 重置倍速播放
         */
        const resetSpeed = () => {
            pageData.value.speedIndex = pageData.value.speedList.findIndex((index) => index === 1)
            setSpeed()
            ctx.emit('trigger', true)
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

        // description 是否禁用切换帧
        const nextFrameDisabled = computed(() => {
            return disabled.value || prop.playStatus !== 'pause'
        })

        // 是否禁用POS
        const posDisabled = computed(() => {
            return !prop.hasPosEvent || disabled.value
        })

        // 禁用备份按钮
        const backUpDisabled = computed(() => {
            return disabled.value || prop.clipRange.length !== 2 || prop.clipRange[0] >= prop.clipRange[1]
        })

        const openStrategyPop = () => {
            pageData.value.strategy = prop.strategy
            pageData.value.isStrategyPop = true
            ctx.emit('trigger', true)
        }

        const confirmStrategy = () => {
            ctx.emit('update:strategy', pageData.value.strategy)
            pageData.value.isStrategyPop = false
        }

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
            ctx.emit('trigger', true)
        }

        const detectTargetDisabled = computed(() => {
            if (!prop.winData.chlID) return true
            const find = prop.recList.find((item) => item.chlId === prop.winData.chlID)
            if (!find) {
                return true
            }
            return !find.records.length
        })

        return {
            speed,
            pageData,
            disabled,
            pause,
            forward,
            rewind,
            resetSpeed,
            resetSpeedDisabled,
            forwardDisabled,
            rewindDisabled,
            nextFrameDisabled,
            posDisabled,
            displaySpeed,
            backUpDisabled,
            backUp,
            openStrategyPop,
            confirmStrategy,
            systemCaps,
            detectTargetDisabled,
        }
    },
})
