/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-26 17:04:12
 * @Description: 现场预览-操作视图
 */
export default defineComponent({
    props: {
        /**
         * @property 播放模式
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
         * @property 用户权限表
         */
        auth: {
            type: Object as PropType<UserChlAuth>,
            required: true,
        },
        /**
         * @property 通道能力映射
         */
        chl: {
            type: Object as PropType<Record<string, LiveChannelList>>,
            required: true,
        },
        /**
         * @property 是否远程录像
         */
        remote: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 分屏数
         */
        split: {
            type: Number,
            required: true,
        },
        /**
         * @property 音量
         */
        volume: {
            type: Number,
            required: true,
        },
    },
    emits: {
        snap() {
            return true
        },
        closeImg() {
            return true
        },
        zoom(bool: boolean) {
            return typeof bool === 'boolean'
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
        localRecord(bool: boolean) {
            return typeof bool === 'boolean'
        },
        remoteRecord(bool: boolean) {
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
        talk(bool: boolean) {
            return typeof bool === 'boolean'
        },
        trigger() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            // 码流类型1：主码流，2：子码流
            streamMenuOptions: [
                {
                    label: Translate('IDCS_MAIN_STREAM'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_SUB_STREAM'),
                    value: 2,
                },
            ] as SelectOption<number, string>[],
            //
            GOP: '',
            //
            QoI: '',
            //
            chlType: '',
            onlyRead: false,
            // 是否RTSP
            isRTSP: false,
            // 分辨率选项列表
            resolutionOptions: [] as LiveResolutionOptions[],
            // 最大帧率
            maxFps: 25,
            //
            enct: '',
            //
            bitType: '',
            // 是否禁用码率选项
            qualityDisabled: false,
            // 码率列表
            qualityOptions: [] as LiveQualityOptions[],
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

            if (prop.winData.PLAY_STATUS === 'stop' || (!prop.auth.hasAll && !prop.auth.lp[chlID.value])) {
                return true
            }

            if (prop.winData.isPolling) {
                return true
            }

            if (prop.winData.PLAY_STATUS === 'play') {
                return false
            }
            return true
        })

        // 是否禁用抓图
        const snapDisabled = computed(() => {
            if (!chlID.value) {
                return true
            }

            if (prop.winData.PLAY_STATUS === 'stop' || (!prop.auth.hasAll && !prop.auth.lp[chlID.value])) {
                return true
            }

            if (prop.winData.PLAY_STATUS === 'play') {
                if (prop.winData.isDwellPlay) {
                    return true
                } else {
                    return false
                }
            }
            return false
        })

        // 是否禁用关闭图像
        const closeImgDisabled = computed(() => {
            return snapDisabled.value
        })

        // 是否禁用3D放大
        const zoom3DDisabled = computed(() => {
            const magnify3DAuth = prop.auth.hasAll || prop.auth.ptz[chlID.value]
            // 系统能力集、通道ptz能力集、用户权限、enable
            const enableMagnify3D = prop.chl[chlID.value]?.supportPtz && magnify3DAuth && !disabled.value
            return !enableMagnify3D
        })

        // 是否禁用原始比例
        const originalDisplayDisabled = computed(() => {
            return !systemCaps.supportOriginalDisplay || disabled.value
        })

        // 是否禁用手动开门
        const openDoorDisabled = computed(() => {
            // 用户权限、通道accessControl能力集、enable
            const enableOpenDoor = (prop.auth.hasAll || prop.auth.accessControl) && prop.chl[chlID.value]?.supportAccessControl && !disabled.value
            return !enableOpenDoor
        })

        /**
         * @description 手动开门
         */
        const openDoor = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${chlID.value}"></chl>
                </content>
            `
            const result = await manualUnlocking(sendXml)
            const $ = queryXml(result)

            if ($('status').text() !== 'success') {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorInfo = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox(errorInfo)
            }
        }

        // 是否禁用本地录像
        const localRecordDisabled = computed(() => {
            return !userSession.hasAuth('rec') || systemCaps.hotStandBy || disabled.value
        })

        /**
         * @description 开启/关闭本地录像
         * @param {Boolean} bool
         */
        const localRecord = (bool: boolean) => {
            ctx.emit('trigger')
            ctx.emit('localRecord', bool)
        }

        // 是否禁用远程录像
        const remoteRecordDisabled = computed(() => {
            return localRecordDisabled.value
        })

        /**
         * @description 开启/关闭远程录像
         * @param {Boolean} bool
         */
        const remoteRecord = async (bool: boolean) => {
            const sendXml = rawXml`
                <content>
                    <chlId>${chlID.value}</chlId>
                    <switch>${bool}</switch>
                </content>
            `
            await editManualRecord(sendXml)
            ctx.emit('trigger')
            ctx.emit('remoteRecord', bool)
        }

        /**
         * @description 获取远程录像状态
         */
        const getRemoteRecordStatus = async () => {
            if (!chlID.value) {
                return
            }
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlID.value}</chlId>
                </condition>
            `
            const result = await queryManualRecord(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                ctx.emit('remoteRecord', $('content/switch').text().bool())
            }
        }

        // 码流表单
        const streamFormData = ref(new LiveStreamForm())

        // 是否禁用码流类型
        const streamTypeDisabled = computed(() => {
            if (prop.mode === 'h5') {
                return prop.split > 1
            }

            if (prop.mode === 'ocx') {
                return prop.split > 4
            }

            return true
        })

        // 是否禁用子码流选项
        const streamOptionDisabled = computed(() => {
            return pageData.value.isRTSP || !pageData.value.resolutionOptions.length || pageData.value.chlType === 'recorder' || pageData.value.onlyRead
        })

        // 是否禁用码率选项
        const streamQualityDisabled = computed(() => {
            if (import.meta.env.VITE_UI_TYPE === 'UI1-E' && prop.mode === 'ocx') {
                return false
            }
            return pageData.value.enct === 'h265p'
        })

        // 码率选项
        const displayQualityOptions = computed<SelectOption<string, string>[]>(() => {
            let isQualityCapsMatch = false
            let isQualityCapsEmpty = true
            const options: SelectOption<string, string>[] = []
            pageData.value.qualityOptions.forEach((item) => {
                if (item.enct === pageData.value.enct && item.res === streamFormData.value.resolution) {
                    if (item.value) {
                        isQualityCapsEmpty = false
                        const qualitys = item.value.split(',')
                        qualitys.forEach((quality) => {
                            options.push({
                                label: quality + 'Kbps',
                                value: quality,
                            })
                        })
                    }
                    isQualityCapsMatch = true
                }
            })

            // 没有完全匹配的项就找低于该值的最近的一项
            if (!isQualityCapsMatch) {
                const res = streamFormData.value.resolution.split('x')
                pageData.value.qualityOptions.forEach((item) => {
                    const curRes = item.res.split('x')
                    if (item.enct === pageData.value.enct && (Number(curRes[0]) < Number(res[0]) || (curRes[0] === res[0] && Number(curRes[1]) < Number(res[1])))) {
                        if (item.value) {
                            isQualityCapsEmpty = false
                            const qualitys = item.value.split(',')
                            qualitys.forEach((quality) => {
                                options.push({
                                    label: quality + 'Kbps',
                                    value: quality,
                                })
                            })
                        }
                    }
                })
            }

            // 对应项如果码率列表为空，则取所有支持的码率列表
            if (isQualityCapsEmpty) {
                pageData.value.qualityOptions.forEach((item) => {
                    if (item.enct === pageData.value.enct && item.res === '0x0') {
                        const qualitys = item.value.split(',')
                        qualitys.forEach((quality) => {
                            options.push({
                                label: quality + 'Kbps',
                                value: quality,
                            })
                        })
                    }
                })
            }

            return options
        })

        watch(displayQualityOptions, (newVal) => {
            const value = newVal.map((item) => item.value)
            if (value.includes(pageData.value.QoI)) {
                streamFormData.value.quality = pageData.value.QoI
            } else {
                streamFormData.value.quality = value[0]
            }

            if (pageData.value.bitType === 'CBR') {
                const qualitys = pageData.value.qualityOptions
                    .find((item) => item.value)!
                    .value.split(',')
                    .map((item) => Number(item))

                streamFormData.value.quality =
                    getVideoQuality({
                        videoEncodeType: pageData.value.enct,
                        resolution: streamFormData.value.resolution,
                        qualitys: qualitys,
                    }) + ''
            }
        })

        const getVideoQuality = (rowData: { videoEncodeType: string; resolution: string; qualitys: number[] }) => {
            const videoEncodeType = rowData.videoEncodeType // h264、h265
            const resolution = rowData.resolution // 2MP
            const split = resolution.split('x')
            if (!videoEncodeType || !split || split.length === 0) {
                return 0
            }

            const row = Number(split[0])
            const column = Number(split[1])
            const isH264 = videoEncodeType.indexOf('h264') > -1
            const isH265 = videoEncodeType.indexOf('h265') > -1
            const product = row * column

            let videoQuality = 0

            // D1及以下
            if (product <= 5e5) {
                videoQuality = isH264 ? 768 : isH265 ? 512 : 0
            }
            // (D1, 720p]
            else if (product > 5e5 && product <= 1e6) {
                videoQuality = isH264 ? 1536 : isH265 ? 1024 : 0
            }
            // (720p, 2MP]
            else if (product > 1e6 && product <= 2e6) {
                videoQuality = isH264 ? 3072 : isH265 ? 2048 : 0
            }
            // (2MP, 3MP]
            else if (product > 2e6 && product <= 3e6) {
                videoQuality = isH264 ? 4096 : isH265 ? 3072 : 0
            }
            // (3MP, 4MP]
            else if (product > 3e6 && product <= 4e6) {
                videoQuality = isH264 ? 5120 : isH265 ? 4096 : 0
            }
            // (4MP, 6MP]
            else if (product > 4e6 && product <= 6e6) {
                videoQuality = isH264 ? 6144 : isH265 ? 5120 : 0
            }
            // (6MP, 12MP]
            else if (product > 6e6 && product <= 12e6) {
                videoQuality = isH264 ? 8192 : isH265 ? 6144 : 0
            }
            // 12MP以上
            else if (product > 12e6) {
                videoQuality = isH264 ? 8192 : isH265 ? 8192 : 0
            }

            const qualitys = rowData.qualitys
            const find = qualitys.find((item, index) => {
                return item >= videoQuality || index === qualitys.length - 1
            })

            if (find) {
                videoQuality = find
            }

            return videoQuality
        }

        /**
         * @description 更新码流
         * @param {number} type
         */
        const changeStreamType = (type: string | number | boolean | undefined) => {
            if (prop.winData.streamType === type) {
                return
            }

            if (streamTypeDisabled.value && pageData.value.isRTSP && type === 1) {
                return
            }

            ctx.emit('trigger')
            ctx.emit('streamType', type as number)
        }

        /**
         * @description 获取码流数据
         */
        const getStreamData = async () => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlID.value}</chlId>
                </condition>
                <requireField>
                    <chlType/>
                    <subCaps/>
                    <sub/>
                    <subStreamQualityCaps/>
                </requireField>
            `
            const result = await queryNodeEncodeInfo(sendXml)
            const $ = queryXml(result)
            const content = $('content/item')
            if (content.length) {
                const $item = queryXml(content[0].element)
                pageData.value.GOP = $item('sub').attr('GOP')
                pageData.value.chlType = $item('chlType').text()
                pageData.value.onlyRead = $item('sub').attr('OnlyRead').bool()
            } else {
                // rtsp通道无子码流
                pageData.value.isRTSP = true
            }

            if ($('status').text() === 'success') {
                // 多分割时会遍历窗口触发请求，异步请求返回值通过通道id来确定最后一次的数据正确
                const chl = $(`content/item[@id="${chlID.value}"]`)
                if (!chl.length) {
                    return
                }
                const $chl = queryXml(chl[0].element)

                pageData.value.enct = $chl('sub').attr('enct')
                pageData.value.bitType = $chl('sub').attr('bitType')
                pageData.value.QoI = $chl('sub').attr('QoI')

                streamFormData.value.frameRate = $chl('sub').attr('fps').num()
                streamFormData.value.resolution = $chl('sub').attr('res')
                streamFormData.value.quality = $chl('sub').attr('QoI')

                pageData.value.resolutionOptions = $chl('subCaps/res').map((item) => {
                    return {
                        label: item.text(),
                        value: item.text(),
                        maxFps: item.attr('fps').num(),
                    }
                })

                pageData.value.qualityOptions = $chl('subStreamQualityCaps/item').map((item) => {
                    return {
                        enct: item.attr('enct'),
                        res: item.attr('res'),
                        value: item.text(),
                        chlType: item.attr('chlType'),
                    }
                })

                changeResolution()
            }
        }

        /**
         * @description 更改分辨率
         */
        const changeResolution = () => {
            const find = pageData.value.resolutionOptions.find((item) => item.value === streamFormData.value.resolution)
            if (find) {
                pageData.value.maxFps = find.maxFps
                if (streamFormData.value.frameRate > find.maxFps) {
                    streamFormData.value.frameRate = find.maxFps
                }
            }
        }

        /**
         * @description 提交码流表单数据
         */
        const setStreamData = async () => {
            if (!chlID.value) {
                return
            }
            const res = streamFormData.value.resolution
            const fps = streamFormData.value.frameRate
            const qoi = streamFormData.value.quality
            const gop = pageData.value.GOP || streamFormData.value.frameRate * 4
            const sendXml = rawXml`
                <content type="list" total="1">
                    <item id="${chlID.value}">
                        <sub res="${res}" fps="${fps}" QoI="${qoi}" GOP="${gop}" />
                    </item>
                </content>
            `
            const result = await editNodeEncodeInfo(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_UNSUPPORTED_FUNC) {
                    errorInfo = Translate('IDCS_NOT_SUPPORTFUNC')
                }
                openMessageBox(errorInfo)
            }
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

            ctx.emit('trigger')
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

            ctx.emit('trigger')
            ctx.emit('audio', !bool)
        }

        // 是否禁用对讲
        const talkDisabled = computed(() => {
            const enableTalked = prop.chl[chlID.value]?.supportTalkback && !disabled.value
            return !enableTalked
        })

        const wiperDisabled = computed(() => {
            const endableWiper = prop.chl[chlID.value]?.supportWiper && !disabled.value
            return !endableWiper
        })

        const runWiper = () => {
            ctx.emit('trigger')
            setWiper('WiperOn')
        }

        const stopWiper = () => {
            ctx.emit('trigger')
            setWiper('WiperOff')
        }

        const setWiper = async (actionType: string) => {
            const sendXML = rawXml`
                <content>
                    <chlId>${chlID.value}</chlId>
                    <actionType>${actionType}</actionType>
                </content>
            `
            const result = await ptzMoveCall(sendXML)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === 536870953) {
                    errorInfo = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox(errorInfo)
            }
        }

        const fpsOptions = computed(() => {
            return Array(pageData.value.maxFps)
                .fill(1)
                .map((item, index) => {
                    const value = item + index
                    return {
                        label: value,
                        value,
                    }
                })
        })

        watch(
            () => prop.winData.chlID,
            (newVal) => {
                if (newVal && prop.winData.PLAY_STATUS === 'play') {
                    getRemoteRecordStatus()
                    getStreamData()
                }
            },
            {
                immediate: true,
            },
        )

        return {
            pageData,
            disabled,
            snapDisabled,
            closeImgDisabled,
            zoom3DDisabled,
            originalDisplayDisabled,
            openDoorDisabled,
            openDoor,
            localRecordDisabled,
            localRecord,
            remoteRecord,
            remoteRecordDisabled,
            changeStreamType,
            setStreamData,
            streamTypeDisabled,
            setVolume,
            setAudioStatus,
            streamOptionDisabled,
            streamQualityDisabled,
            streamFormData,
            changeResolution,
            displayQualityOptions,
            audioDisabled,
            talkDisabled,
            fpsOptions,
            wiperDisabled,
            runWiper,
            stopWiper,
            systemCaps,
        }
    },
})
