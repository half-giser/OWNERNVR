/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-05 16:00:46
 * @Description: 回放
 */
import PlaybackChannelPanel, { type ChannelPanelExpose } from '../playback/PlaybackChannelPanel.vue'
import PlaybackEventPanel from '../playback/PlaybackEventPanel.vue'
import PlaybackAsidePanel from '../playback/PlaybackAsidePanel.vue'
import PlaybackControlPanel from '../playback/PlaybackControlPanel.vue'
import PlaybackScreenPanel from '../playback/PlaybackScreenPanel.vue'
import PlaybackFisheyePanel, { type FishEyePanelExpose } from '../playback/PlaybackFisheyePanel.vue'
import PlaybackBackUpPanel from '../playback/PlaybackBackUpPanel.vue'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import dayjs from 'dayjs'
import { type XMLQuery } from '@/utils/xmlParse'

/**
 * @description OCX窗口数据
 * @param {Number} maxWin
 */
const useOCXCacheWinMap = (maxWin: number) => {
    const winMap: string[] = Array(maxWin).fill('')

    /**
     * @description 获取窗口通道列表
     * @returns {Array}
     */
    const getList = () => {
        const index = winMap.findLastIndex((item) => !!item)
        return winMap.slice(0, index + 1)
    }

    /**
     * @description 更新窗口通道列表
     * @param {Array} chls
     */
    const update = (chls: PlaybackChlList[]) => {
        winMap.forEach((_item, index) => {
            if (chls[index]) {
                winMap[index] = chls[index].id
            } else {
                winMap[index] = ''
            }
        })
    }

    /**
     * @description 移除通道
     * @param {Array} chls
     */
    const remove = (chls: string[]) => {
        for (let i = 0; i < winMap.length; i++) {
            const index = chls.indexOf(winMap[i])
            if (index > -1) {
                winMap[i] = ''
                chls.splice(index, 1)
            }

            if (!chls.length) {
                break
            }
        }
    }

    /**
     * @description 获取通道的窗口索引
     * @param {Array} chls
     * @returns {Array}
     */
    const getIndexes = (chls: string[]) => {
        return chls.map((chl) => winMap.indexOf(chl))
    }

    return {
        getList,
        winMap,
        update,
        remove,
        getIndexes,
    }
}

export default defineComponent({
    components: {
        PlaybackChannelPanel,
        PlaybackEventPanel,
        PlaybackAsidePanel,
        PlaybackControlPanel,
        PlaybackScreenPanel,
        PlaybackBackUpPanel,
        BackupPop,
        BackupLocalPop,
        PlaybackFisheyePanel,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()

        const playerRef = ref<PlayerInstance>()
        const chlRef = ref<ChannelPanelExpose>()
        const timelineRef = ref<TimelineInstance>()
        const fisheyeRef = ref<FishEyePanelExpose>()

        const ocxCacheWinMap = useOCXCacheWinMap(systemCaps.playbackMaxWin)

        const pageData = ref({
            // 分屏数
            split: 1,
            // 事件图例
            legend: [] as PlaybackEventList[],
            // 正在播放的通道列表（H5）
            playingList: [] as string[],
            // 正在播放的通道数量（OCX）
            playingListNum: 0,
            // 事件类型数据
            typeMask: [] as string[],
            // 事件列表
            eventList: [] as string[],
            // POS关键字
            posKeyword: '',
            // 鱼眼安装类型
            fishEye: '',
            // 当前选中窗口的数据
            winData: new LiveSharedWinData(),
            // 音量
            volume: 65,
            // 当前打开音频的窗口索引
            audioWinIndex: -1,
            // 是否开启OSD
            osd: true,
            // 是否开启水印
            watermark: false,
            // 是否开启POS
            pos: false,
            // 当前回放时间点的X轴坐标
            timelineOffsetX: 0,
            // 最长时间条的最大X轴坐标,
            timelineMaxCoordinateX: 0,
            // 当前指针对应的时间
            timelineCurrentPointerTime: DEFAULT_EMPTY_TIME,
            // 当前时间轴剪切范围
            timelineClipRange: [] as number[],
            // 全局播放状态
            playStatus: 'stop',
            // 录像日期列表
            recTimeList: [] as number[],
            // 通道列表
            chls: [] as PlaybackChlList[],
            chlMap: {} as Record<string, string>[],
            // 事件录像列表
            recLogList: [] as PlaybackRecList[],
            // 事件录像列表是否有POS事件
            hasPosEvent: true,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 录像备份列表
            backupRecList: [] as PlaybackBackUpRecList[],
            // 是否打开备份列表
            isBackUpList: false,
            // 主码流的通道
            mainStreamTypeChl: '',
            // 是否打开本地备份弹窗（H5）
            isLocalBackUpPop: false,
            // 全屏的窗口（H5）
            fullScreenIndex: -1,
            // 是否全屏（OCX）
            isFullScreen: false,
            // 选择的日期
            startTime: dayjs().calendar('gregory').format(DEFAULT_DATE_FORMAT),
            calendarDate: dayjs().calendar('gregory').format(DEFAULT_DATE_FORMAT),
            strategy: false,
            isDetectTarget: false,
            detectTargetTime: 0,
            allEventList: [] as string[],
            isChangingSplit: false,
        })

        /**
         * @description 获取回放时间列表
         * @param {Array} chlList
         */
        const getRecSection = async (chlList: string[]) => {
            if (chlList.length) {
                const sendXml = rawXml`
                    <condition>
                        ${chlList.map((item) => `<chlId>${item}</chlId>`).join('')}
                    </condition>
                `
                const result = await queryDatesExistRec(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    pageData.value.recTimeList = $('content/item').map((item) => {
                        const date = dayjs.utc(item.text(), DEFAULT_YMD_FORMAT).valueOf()
                        return date
                    })
                }
            } else {
                pageData.value.recTimeList = []
            }
        }

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        const userAuth = useUserChlAuth()

        // 鱼眼视图是否显示
        const isFishEyePanel = computed(() => {
            return mode.value === 'ocx'
        })

        // 开始时间的时间戳（毫秒）
        const startTimeStamp = computed(() => {
            return dayjs(pageData.value.startTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).hour(0).minute(0).second(0).valueOf()
        })

        // 结束时间的时间戳（毫秒）
        const endTimeStamp = computed(() => {
            return dayjs(pageData.value.startTime, { format: DEFAULT_DATE_FORMAT, jalali: false }).hour(23).minute(59).second(59).valueOf()
        })

        // 播放窗口数量
        const playingListNum = computed(() => {
            if (mode.value === 'h5') {
                return pageData.value.playingList.length
            } else return pageData.value.playingListNum
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 发送OCX命令
         * @param {String} sendXML
         */
        const cmd = (sendXML: string) => {
            plugin?.ExecuteCmd(sendXML)
        }

        /**
         * @description 更新播放器回调的页面窗口状态
         * @param {number} index
         * @param {Object} winData
         */
        const updateWinData = (index: number, winData: TVTPlayerWinDataListItem) => {
            if (playerRef.value && index === playerRef.value.player.getSelectedWinIndex()) {
                const isSameChl = pageData.value.winData.chlID === winData.CHANNEL_INFO?.chlID
                pageData.value.winData = {
                    PLAY_STATUS: winData.PLAY_STATUS,
                    winIndex: winData.winIndex,
                    seeking: winData.seeking,
                    original: winData.original,
                    audio: winData.audio,
                    magnify3D: winData.magnify3D,
                    localRecording: winData.localRecording,
                    isPolling: winData.isPolling,
                    timestamp: winData.timestamp,
                    showWatermark: winData.showWatermark,
                    showPos: winData.showPos,
                    chlID: winData.CHANNEL_INFO?.chlID || '',
                    supportPtz: winData.CHANNEL_INFO?.supportPtz || false,
                    supportIntegratedPtz: winData.CHANNEL_INFO?.supportIntegratedPtz || false,
                    supportIris: winData.CHANNEL_INFO?.supportIris || false,
                    supportAZ: winData.CHANNEL_INFO?.supportAZ || false,
                    MinPtzCtrlSpeed: 1,
                    MaxPtzCtrlSpeed: 8,
                    chlName: winData.CHANNEL_INFO?.chlName || '',
                    streamType: typeof winData.CHANNEL_INFO?.streamType === 'number' ? winData.CHANNEL_INFO.streamType : 2,
                    talk: false,
                    isDwellPlay: false,
                    groupID: '',
                    supportAudio: true,
                    canShowAudioError: isSameChl ? pageData.value.winData.canShowAudioError : false,
                }
            }
        }

        /**
         * @description 处理通道选项变化回调
         * @param {Array} chls
         */
        const handleChlChange = (chls: PlaybackChlList[]) => {
            const newVal = cloneDeep(chls)
            const oldVal = cloneDeep(pageData.value.chls)

            const chlIds = chls.map((item) => item.id)
            const oldChlIds = pageData.value.chls.map((item) => item.id)

            timelineRef.value?.clearClipRange()

            if (!isEqual(chlIds, oldChlIds)) {
                pageData.value.chls = chls
                getRecSection(chlIds)

                if (!['pending', 'stop'].includes(pageData.value.playStatus) && chlIds.length) {
                    getRecList()
                }
            }

            nextTick(() => {
                if (pageData.value.isChangingSplit) {
                    playAll(timelineRef.value!.getTime() || startTimeStamp.value / 1000)
                    pageData.value.isChangingSplit = false
                    // timelineRef.value!.getTime()
                    return
                }

                if (!['play', 'pause', 'backwards'].includes(pageData.value.playStatus)) {
                    if (pageData.value.split < newVal.length) {
                        adjustSplit()
                    } else if (!newVal.length) {
                        setSplit(1)
                    }
                }

                if (['play', 'pause', 'backwards'].includes(pageData.value.playStatus)) {
                    if (!newVal.length) {
                        stop()
                        setSplit(1)
                        // pageData.value.recLogList = []
                        updateTimeline()
                        return
                    }

                    if (newVal.length < oldVal.length) {
                        const newChlIds = newVal.map((item) => item.id)
                        const filterChls = oldVal.filter((item) => !newChlIds.includes(item.id))
                        if (mode.value === 'h5') {
                            filterChls
                                .map((item) => player.getWinIndexesByChlId(item.id))
                                .flat()
                                .forEach((index) => {
                                    closeImg(index)
                                    // player.stop(index)
                                })
                        }

                        if (mode.value === 'ocx') {
                            const ids = filterChls.map((item) => item.id)
                            const indexes = ocxCacheWinMap.getIndexes(ids)
                            ocxCacheWinMap.remove(ids)
                            indexes.forEach((index) => {
                                closeImg(index)
                            })
                        }
                        renderTimeline(false)
                        return
                    }

                    if (!oldVal.length) {
                        playAll(timelineRef.value!.getTime() || startTimeStamp.value / 1000)
                        return
                    }

                    if (newVal.length > oldVal.length) {
                        const timestamp = timelineRef.value!.getTime()
                        if (mode.value === 'h5') {
                            const oldChlIds = oldVal.map((item) => item.id)
                            const unusedIndexes = player.getFreeWinIndexes()
                            if (pageData.value.playStatus === 'pause') {
                                resume()
                            }
                            const filterChls = newVal.filter((item) => !oldChlIds.includes(item.id))
                            filterChls.forEach((item) => {
                                const index = unusedIndexes.shift()
                                player.play({
                                    chlID: item.id,
                                    chlName: item.value,
                                    startTime: Math.floor(timestamp),
                                    endTime: Math.floor(endTimeStamp.value / 1000),
                                    streamType: pageData.value.mainStreamTypeChl === item.id ? 0 : 1,
                                    audioStatus: false,
                                    typeMask: pageData.value.strategy ? pageData.value.typeMask : [],
                                    winIndex: index,
                                    showWatermark: pageData.value.watermark,
                                    showPos: pageData.value.pos,
                                    isEndRec: false,
                                    volume: pageData.value.volume,
                                    // callback: (winIndex: number) => {
                                    //     console.log(winIndex)
                                    // },
                                })
                            })
                        }

                        if (mode.value === 'ocx') {
                            playAll(timestamp)
                        }

                        renderTimeline(false)
                        return
                    }

                    playAll(timelineRef.value!.getTime() || startTimeStamp.value / 1000)
                    return
                }
            })
        }

        /**
         * @description 处理通道搜索回调
         * @param {Array} chls
         */
        const handleChlSearch = async (chls: PlaybackChlList[]) => {
            if (pageData.value.playStatus !== 'stop') {
                stop(false)
            }
            pageData.value.chls = chls
            pageData.value.startTime = pageData.value.calendarDate
            timelineRef.value?.setTime(startTimeStamp.value / 1000)

            await getRecSection(pageData.value.chls.map((item) => item.id))

            if (mode.value === 'ocx') {
                ocxCacheWinMap.update(pageData.value.chls)

                if (pageData.value.playStatus !== 'play') {
                    const sendXML = OCX_XML_SearchRec(
                        'RecSearch',
                        formatGregoryDate(startTimeStamp.value),
                        formatGregoryDate(endTimeStamp.value),
                        pageData.value.chls.map((_item, index) => index),
                        pageData.value.chls.map((item) => item.id),
                        pageData.value.chls.map((item) => item.value),
                        pageData.value.strategy ? pageData.value.eventList : pageData.value.allEventList,
                        localToUtc(startTimeStamp.value),
                        localToUtc(endTimeStamp.value),
                    )
                    cmd(sendXML)
                }
            }

            if (mode.value === 'h5') {
                if (pageData.value.playStatus !== 'play') {
                    const winIndex = player.getSelectedWinIndex()
                    const winData = player.getWinData()
                    const cloneData = cloneDeep(winData[winIndex])
                    if (!cloneData.CHANNEL_INFO?.chlID && pageData.value.chls[winIndex]) {
                        cloneData.CHANNEL_INFO = {
                            chlID: pageData.value.chls[winIndex].id,
                            supportPtz: false,
                            supportAZ: false,
                            supportIris: false,
                            supportIntegratedPtz: false,
                            chlName: '',
                            streamType: 2,
                        }
                    }
                    updateWinData(winIndex, cloneData)
                }
            }

            await getRecList()
            pageData.value.playStatus = 'pending'
        }

        /**
         * @description 处理通道播放回调
         * @param {Array} chls
         */
        const handleChlPlay = async (chls: PlaybackChlList[], timestamp?: number) => {
            pageData.value.mainStreamTypeChl = ''
            await handleChlSearch(chls)
            adjustSplit()
            playAll(timestamp)
        }

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                watch(
                    () => player.getSplit(),
                    (val) => {
                        pageData.value.split = val
                    },
                )
            }

            if (mode.value === 'ocx') {
                //设置插件为回放交互模式
                cmd(OCX_XML_SetPluginModel('Interactive', 'Playback'))

                //设置录像位置
                cmd(OCX_XML_SetRecLocation('LOCAL'))

                cmd(
                    OCX_XML_SetProperty({
                        calendarType: userSession.calendarType,
                        supportImageRotate: systemCaps.supportImageRotate,
                    }),
                )

                cmd(OCX_XML_SetRecPlayMode('SYNC'))
            }

            toggleOSD(true)
            toggleWatermark(false)
        }

        const stopWatchPlayFromSearch = watchEffect(async () => {
            if (ready.value) {
                if (history.state.chlId) {
                    pageData.value.startTime = formatGregoryDate(history.state.startTime)
                    pageData.value.calendarDate = pageData.value.startTime
                    chlRef.value?.setChls([history.state.chlId])
                    await handleChlPlay(
                        [
                            {
                                id: history.state.chlId,
                                value: history.state.chlName,
                            },
                        ],
                        history.state.startTime / 1000,
                    )
                    nextTick(() => {
                        delete history.state.chlId
                        delete history.state.chlName
                        delete history.state.startTime
                        delete history.state.endTime
                    })
                }
                stopWatchPlayFromSearch()
            }
        })

        /**
         * @description 播放时间戳更新
         * @param {Number} index
         * @param {TVTPlayerWinDataListItem} data
         * @param {Number} timestamp 毫秒
         */
        const handlePlayerTimeUpdate = (_index: number, _data: TVTPlayerWinDataListItem, timestamp: number) => {
            timelineRef.value?.setTime(timestamp / 1000)
            toggleVideoDisplay(timestamp)
        }

        /**
         * @description 当前时间条下, 无数据的通道隐藏画面, 反之显示
         * @param {Number} timestamp
         */
        const toggleVideoDisplay = (timestamp: number) => {
            pageData.value.recLogList.forEach((item) => {
                if (!item.records.length) {
                    return
                }

                if (timestamp >= item.records.at(-1)!.endTime) {
                    return
                }
                const index = player.getWinIndexesByChlId(item.chlId)
                if (!index.length) {
                    return
                }
                const flag = item.records.some((record) => {
                    return timestamp >= record.startTime && timestamp <= record.endTime
                })
                if (flag) {
                    player.hideErrorTips(index[0])
                } else {
                    player.showErrorTips('none', index[0])
                }
            })
        }

        /**
         * @description 播放器播放状态回调（H5）
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerStatus = (data: TVTPlayerWinDataListItem[]) => {
            const type = data.length ? 'play' : 'stop'
            pageData.value.playStatus = type
            // 设置通道列表图标显示状态
            pageData.value.playingList = data.map((item) => item.CHANNEL_INFO!.chlID)
        }

        /**
         * @description WASM播放器播放成功回调
         * @param {number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerSuccess = (index: number, data: TVTPlayerWinDataListItem) => {
            const chlId = data.CHANNEL_INFO!.chlID
            pageData.value.playStatus = 'play'

            if (!pageData.value.playingList.includes(chlId)) {
                pageData.value.playingList.push(chlId)
            }

            updateWinData(index, data)
        }

        /**
         * @description WASM播放器停止播放回调
         * @param {number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerStop = (index: number, data: TVTPlayerWinDataListItem) => {
            const chlId = data.CHANNEL_INFO!.chlID

            updateWinData(index, data)

            const findIndex = pageData.value.playingList.indexOf(chlId)
            if (findIndex > -1) {
                pageData.value.playingList.splice(findIndex, 1)
            }
        }

        /**
         * @description wasm播放器错误回调
         * @param {number} index
         * @param {Object} data
         * @param {string} error
         */
        const handlePlayerError = (index: number, data: TVTPlayerWinDataListItem, error?: string) => {
            // 不支持打开音频
            if (error === 'notSupportAudio') {
                openMessageBox(Translate('IDCS_AUDIO_NOT_SUPPORT'))
                pageData.value.winData.supportAudio = false
                pageData.value.winData.audio = false
            }
            // 当前用户打开无音频的权限
            else if (error === 'noPermission') {
                openMessageBox(Translate('IDCS_NO_PERMISSION'))
            }
            // 音频流关闭事件，将对应通道的音频图标置为关闭状态
            else if (error === 'audioClosed') {
                updateWinData(index, data)
            } else if (error === 'offline') {
                // 播放器已处理
            } else {
                updateWinData(index, data)
                // RecLogsTableModule.clear()
            }
        }

        const handlePlayerAudioError = () => {
            // 不支持打开音频
            if (pageData.value.winData.canShowAudioError) {
                openMessageBox(Translate('IDCS_UNSUPPORT_AUDIO_CODEC_TYPE'))
                pageData.value.winData.canShowAudioError = false
            }
        }

        /**
         * @description WASM播放器播放器更改选中分屏回调
         * @param {Number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerSelect = (index: number, data: TVTPlayerWinDataListItem) => {
            const cloneData = cloneDeep(data)
            if (cloneData.PLAY_STATUS === 'stop' && !cloneData.CHANNEL_INFO?.chlID) {
                if (pageData.value.chls[index]) {
                    cloneData.CHANNEL_INFO = {
                        chlID: pageData.value.chls[index].id,
                        supportPtz: false,
                        supportAZ: false,
                        supportIris: false,
                        supportIntegratedPtz: false,
                        chlName: '',
                        streamType: 2,
                    }
                }
            }
            updateWinData(index, cloneData)
        }

        /**
         * @description WASM播放器播放器双击全屏回调
         * @param {number} winIndex
         */
        const handlePlayerDblclickChange = (winIndex: number) => {
            pageData.value.fullScreenIndex = winIndex
            updateTimeline()
        }

        /**
         * @description 播放
         * @param {number} timestamp 单位：秒
         * @param {number} toTimeStamp 单位：秒
         * @param {Boolean} audioStatus
         */
        const playAll = (timestamp?: number, toTimeStamp?: number, audioStatus = false) => {
            if (!ready.value) {
                return
            }

            if (!pageData.value.chls) {
                return
            }

            if (mode.value === 'h5') {
                player.stopAll()
                pageData.value.chls.forEach((item, index) => {
                    player.play({
                        chlID: item.id,
                        chlName: item.value,
                        startTime: Math.floor(timestamp || startTimeStamp.value / 1000),
                        endTime: Math.floor(toTimeStamp || endTimeStamp.value / 1000),
                        streamType: pageData.value.mainStreamTypeChl === item.id ? 0 : 1,
                        audioStatus,
                        typeMask: pageData.value.strategy ? pageData.value.typeMask : [],
                        winIndex: index,
                        showWatermark: pageData.value.watermark,
                        showPos: pageData.value.pos,
                        // isPlayback: false, // 当前是否在回放
                        isEndRec: false,
                        volume: pageData.value.volume,
                        // callback: (winIndex: number) => {
                        //     console.log(winIndex)
                        // },
                    })
                })
            }

            if (mode.value === 'ocx') {
                ocxCacheWinMap.update(pageData.value.chls)
                pageData.value.playStatus = 'play'
                cmd(OCX_XML_StopPreview('ALL'))
                changeStreamType(pageData.value.split <= 4 ? 1 : 0)
                // RecPlay
                const startTime = Math.floor(timestamp ? timestamp * 1000 : startTimeStamp.value)
                const endTime = Math.floor(toTimeStamp ? toTimeStamp * 1000 : endTimeStamp.value)
                cmd(
                    OCX_XML_SearchRec(
                        'RecPlay',
                        formatGregoryDate(startTime),
                        formatGregoryDate(endTime),
                        pageData.value.chls.map((_item, index) => index),
                        pageData.value.chls.map((item) => item.id),
                        pageData.value.chls.map((item) => item.value),
                        pageData.value.strategy ? pageData.value.eventList : pageData.value.allEventList,
                        localToUtc(startTime),
                        localToUtc(endTime),
                    ),
                )
            }
        }

        /**
         * @description 事件更改回调
         * @param {Array} legend
         * @param {Array} typeMask
         * @param {Array} eventList
         */
        const changeEvent = (legend: PlaybackEventList[], typeMask: string[], eventList: string[], posKeyword: string) => {
            pageData.value.legend = legend
            pageData.value.typeMask = typeMask
            pageData.value.eventList = eventList
            pageData.value.posKeyword = posKeyword

            if (pageData.value.recLogList.length) {
                pageData.value.recLogList.forEach((item) => {
                    item.records.forEach((record) => {
                        record.eventColorType = getEventColorType(record.event)
                    })
                })
                renderTimeline(false)
            }

            if (ready.value && ['play', 'pause', 'backwards'].includes(pageData.value.playStatus)) {
                if (pageData.value.strategy) {
                    playAll(timelineRef.value!.getTime() || startTimeStamp.value / 1000)
                }
            }
        }

        const getAllEventList = (eventList: string[]) => {
            pageData.value.allEventList = eventList
        }

        /**
         * @description 时间轴的通道排序
         */
        const sortTimelineChlList = () => {
            if (pageData.value.playStatus === 'stop' || pageData.value.playStatus === 'pending') {
                const chlList = pageData.value.chls
                const currentList: PlaybackRecList[] = chlList.map((item) => {
                    const find = pageData.value.recLogList.find((rec) => item.id === rec.chlId)
                    if (find) {
                        return toRaw(find)
                    } else {
                        return {
                            chlId: '',
                            chlName: '',
                            records: [],
                            timeZone: '',
                        }
                    }
                }) as PlaybackRecList[]

                return currentList
            }

            if (mode.value === 'ocx') {
                if (pageData.value.isFullScreen) {
                    const find = pageData.value.recLogList.find((rec) => pageData.value.winData.chlID === rec.chlId)
                    if (find) {
                        return [toRaw(find)]
                    } else {
                        return [
                            {
                                chlId: '',
                                chlName: '',
                                records: [],
                                timeZone: '',
                            },
                        ] as PlaybackRecList[]
                    }
                }
                const chlList = ocxCacheWinMap.getList()
                const currentList: PlaybackRecList[] = chlList.map((item) => {
                    const find = pageData.value.recLogList.find((rec) => item === rec.chlId)
                    if (find) {
                        return toRaw(find)
                    } else {
                        return {
                            chlId: '',
                            chlName: '',
                            records: [],
                            timeZone: '',
                        }
                    }
                }) as PlaybackRecList[]

                return currentList
            }
            const chlList = player.getChlList()
            // if (!playingList.length) return pageData.value.recLogList
            if (pageData.value.fullScreenIndex > -1) {
                const item = chlList[pageData.value.fullScreenIndex]
                const find = pageData.value.recLogList.find((rec) => item.CHANNEL_INFO && item.CHANNEL_INFO.chlID === rec.chlId)
                if (find) {
                    return [toRaw(find)]
                } else {
                    return [
                        {
                            chlId: '',
                            chlName: '',
                            records: [],
                            timeZone: '',
                        },
                    ] as PlaybackRecList[]
                }
            }

            chlList.sort((a, b) => {
                return a.position - b.position
            })

            const currentList: PlaybackRecList[] = chlList.map((item) => {
                const find = pageData.value.recLogList.find((rec) => item.CHANNEL_INFO && item.CHANNEL_INFO.chlID === rec.chlId)
                if (find) {
                    return toRaw(find)
                } else {
                    return {
                        chlId: '',
                        chlName: '',
                        records: [],
                        timeZone: '',
                    }
                }
            }) as PlaybackRecList[]

            return currentList
        }

        /**
         * @description 渲染时间轴
         */
        const renderTimeline = (autoPointer = true) => {
            if (!ready.value) {
                return
            }

            if (!timelineRef.value) {
                return
            }
            const timeline = timelineRef.value
            const sortChlList = sortTimelineChlList()
            timeline.setColorMap(pageData.value.legend)
            timeline.setDstDayTime(pageData.value.calendarDate)
            timeline.updateChlList(sortChlList, autoPointer, 'record')
        }

        /**
         * @description 更新时间轴
         */
        const updateTimeline = () => {
            if (!ready.value) {
                return
            }

            if (!timelineRef.value) {
                return
            }
            const timeline = timelineRef.value
            const sortChlList = sortTimelineChlList()
            timeline.updateChlList(sortChlList, false, 'record')
        }

        /**
         * @description 当前通道抓图
         */
        const snap = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                const date = formatDate(new Date(), 'YYYYMMDDHHmmss')
                const chlName = pageData.value.winData.chlName
                player.snap(pageData.value.winData.winIndex, `${chlName}_${date}`)
                // NT-12559 首次本地抓图，提示图片数据未加密
                if (!localStorage.getItem(LocalCacheKey.KEY_SNAP_PIC_NOT_ENCRYPTED)) {
                    openNotify(Translate('IDCS_IMG_UNENCRYPTED_TIP'))
                    localStorage.setItem(LocalCacheKey.KEY_SNAP_PIC_NOT_ENCRYPTED, 'true')
                }
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_TakePhotoByWinIndex(pageData.value.winData.winIndex)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 关闭当前通道图像
         * @param {Number} winIndex
         */
        const closeImg = (winIndex?: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                let index = player.getSelectedWinIndex()
                if (typeof winIndex === 'number') {
                    index = winIndex
                }
                player.setPollingState(false, index)
                player.stop(index)
            }

            if (mode.value === 'ocx') {
                pageData.value.winData.PLAY_STATUS = 'stop'
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)

                let index = pageData.value.winData.winIndex
                if (typeof winIndex === 'number') {
                    index = winIndex
                }
                cmd(OCX_XML_SetPlayStatus('STOP', index))
            }
        }

        /**
         * @description 选中通道放大
         */
        const zoomIn = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.zoomIn(player.getSelectedWinIndex())
            }

            if (mode.value === 'ocx') {
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)

                const sendXML = OCX_XML_MagnifyImg()
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 选中通道缩小
         */
        const zoomOut = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.zoomOut(player.getSelectedWinIndex())
            }

            if (mode.value === 'ocx') {
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)

                const sendXML = OCX_XML_MinifyImg()
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 选中通道设置原始比例
         * @param {boolean} bool
         */
        const displayOriginal = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.winData.original = bool

            if (mode.value === 'h5') {
                player.displayOriginal(player.getSelectedWinIndex(), bool)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_OriginalDisplaySwitch(pageData.value.winData.winIndex, bool)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 设置当前通道音量
         * @param {number} volume
         */
        const setVolume = (volume: number) => {
            pageData.value.volume = volume

            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                const winIndex = player.getSelectedWinIndex()
                player.setVolume(player.getSelectedWinIndex(), volume)
                pageData.value.audioWinIndex = winIndex
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetVolume(volume))
                pageData.value.audioWinIndex = pageData.value.winData.winIndex
            }
        }

        /**
         * @description 设置当前通道是否静音
         * @param {boolean} bool
         */
        const setAudio = (bool: boolean, current?: number) => {
            if (!ready.value) {
                return
            }

            pageData.value.winData.audio = bool
            pageData.value.winData.canShowAudioError = bool

            if (mode.value === 'h5') {
                const winIndex = typeof current === 'number' ? current : player.getSelectedWinIndex()
                if (bool) {
                    pageData.value.audioWinIndex = winIndex
                    player.openAudio(winIndex)
                } else {
                    pageData.value.audioWinIndex = -1
                    player.closeAudio(winIndex)
                }
            }

            if (mode.value === 'ocx') {
                if (!pageData.value.winData.chlID) {
                    openNotify(Translate('IDCS_OPERATE_CLOSE_WIN'))
                    return
                }

                if (userAuth.value.audio[pageData.value.winData.chlID] === false) {
                    openMessageBox(Translate('IDCS_NO_PERMISSION'))
                    return
                }
                const winIndex = pageData.value.winData.winIndex
                if (bool) {
                    pageData.value.audioWinIndex = winIndex
                    cmd(OCX_XML_SetVolume(pageData.value.volume))
                } else {
                    pageData.value.audioWinIndex = -1
                    cmd(OCX_XML_SetVolume(0))
                }
            }
        }

        /**
         * @description 开启OSD
         * @param {boolean} bool
         */
        const toggleOSD = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.osd = bool
            if (mode.value === 'h5') {
                player.toggleOSD(bool)
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_OSDSwitch(bool ? 'ON' : 'OFF'))
            }
        }

        /**
         * @description 开启POS
         * @param {boolean} bool
         */
        const togglePos = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.togglePos(bool)
            }

            if (mode.value === 'ocx') {
                ocxCacheWinMap.winMap.forEach((chlId, index) => {
                    const pos = player.getPosInfo(chlId)
                    if (bool) {
                        const area = pos.displayPosition
                        const sendXml = OCX_XML_SetPOSDisplayArea(bool, index, area.x, area.y, area.width, area.height, pos.printMode)
                        cmd(sendXml)
                    } else {
                        const sendXml = OCX_XML_SetPOSDisplayArea(false, index, 0, 0, 0, 0)
                        cmd(sendXml)
                    }
                })
            }
            pageData.value.pos = bool
        }

        /**
         * @description 显示/隐藏水印
         * @param {boolean} bool
         */
        const toggleWatermark = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.watermark = bool
            if (mode.value === 'h5') {
                player.toggleWatermark(bool)
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_WaterMarkSwitch(bool))
            }
        }

        /**
         * @description 开启全屏模式
         */
        const fullScreen = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.fullscreen()
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_FullScreen())
            }
        }

        /**
         * @description 暂停播放
         */
        const pause = () => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'pause'
            if (mode.value === 'h5') {
                player.pauseAll()
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetPlayStatus('FORWARDS_PAUSE'))
            }
        }

        /**
         * @description 暂停倒放
         */
        const pauseBackwards = () => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'pause'
            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetPlayStatus('BACKWARDS_PAUSE'))
            }
        }

        /**
         * @description 倒放
         */
        const playBackwards = () => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'backwards'
            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetPlayStatus('BACKWARDS'))
                changeStreamType(pageData.value.split <= 4 ? 1 : 0)
            }
        }

        /**
         * @description 恢复正向播放
         */
        const resume = () => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'play'
            if (mode.value === 'h5') {
                player.resumeAll()
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetPlayStatus('FORWARDS'))
                // changeStreamType(pageData.value.split <= 4 ? 1 : 0)
            }
        }

        /**
         * @description 停止播放
         */
        const stop = (isResetChannel = true) => {
            if (!ready.value) {
                return
            }

            pageData.value.playStatus = 'stop'
            pageData.value.isFullScreen = false

            if (mode.value === 'h5') {
                player.stopAll()
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_StopPreview('ALL'))
            }

            timelineRef.value!.clearClipRange()

            if (isResetChannel) {
                chlRef.value!.setChls([])
            }
        }

        const adjustSplit = () => {
            const splitList = [1, 4, 9, 16, 25, 36]
            let i = 0
            while (pageData.value.chls.length > splitList[i]) {
                i++
            }
            setSplit(splitList[i])
        }

        /**
         * @description 设置分屏
         * @param {number} split
         */
        const setSplit = (split: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.setSplit(split)
            }

            if (mode.value === 'ocx') {
                pageData.value.isFullScreen = false
                pageData.value.fullScreenIndex = -1
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)
                cmd(OCX_XML_SetScreenMode(split))
            }

            pageData.value.split = split
            //
        }

        const changeSplit = (split: number) => {
            setSplit(split)
            if (['play', 'pause', 'backwards'].includes(pageData.value.playStatus)) {
                if (split < pageData.value.chls.length) {
                    pageData.value.isChangingSplit = true
                    const sliceChl = pageData.value.chls.slice(pageData.value.split)
                    chlRef.value?.removeChls(sliceChl.map((item) => item.id))
                }
            }
        }

        /**
         * @description 前进/后退跳转设定秒数
         * @param {number} seconds
         */
        const jump = (seconds: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                const currentTime = timelineRef.value?.getTime() || 0
                const startTime = startTimeStamp.value / 1000
                const endTime = endTimeStamp.value / 1000
                const distTime = currentTime + seconds
                seek(clamp(distTime, startTime, endTime))
            }

            if (mode.value === 'ocx') {
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)
                cmd(OCX_XML_Skip(seconds))
            }
        }

        const handleTimelineSeek = (timestamp: number) => {
            seek(timestamp)
            clearTargetDetect(false)
        }

        /**
         * @description 跳转指定位置播放
         * @param {number} timestamp
         */
        const seek = (timestamp: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                if (pageData.value.playStatus === 'stop') {
                    playAll(timestamp)
                } else {
                    player.seek(timestamp)
                }
            }

            if (mode.value === 'ocx') {
                if (pageData.value.playingListNum === 0) {
                    playAll(timestamp)
                } else {
                    const sendXML = OCX_XML_RecCurPlayTime(
                        [
                            {
                                index: 4294967295,
                                time: getUTCDateByMilliseconds(timestamp),
                                timeStamp: Math.round(timestamp - startTimeStamp.value / 1000),
                            },
                        ],
                        Date.now(),
                    )
                    cmd(sendXML)
                }
            }
        }

        /**
         * @description 设置播放速度
         * @param {number} speed
         */
        const setSpeed = (speed: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                if (pageData.value.audioWinIndex > -1) {
                    setAudio(false)
                }
                player.setSpeed(speed)
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_SetPlaySpeed(speed))
            }
        }

        /**
         * @description 上一帧
         */
        const prevFrames = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_RecPreFrame())
            }
        }

        /**
         * @description 下一帧
         */
        const nextFrame = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.nextFrame()
            }

            if (mode.value === 'ocx') {
                cmd(OCX_XML_RecNextFrame())
            }
        }

        /**
         * @description 更改码率
         * @param {number} type
         */
        const changeStreamType = (type: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                pageData.value.winData.streamType = type
                if (type === 1) {
                    pageData.value.mainStreamTypeChl = pageData.value.winData.chlID
                } else {
                    pageData.value.mainStreamTypeChl = ''
                }
                player.play({
                    chlID: pageData.value.winData.chlID,
                    chlName: pageData.value.winData.chlName,
                    winIndex: pageData.value.winData.winIndex,
                    startTime: timelineRef.value?.getTime() || startTimeStamp.value / 1000,
                    endTime: endTimeStamp.value / 1000,
                    streamType: type, // 0主码流，其他子码流
                    showPos: pageData.value.pos,
                    typeMask: pageData.value.strategy ? pageData.value.typeMask : [],
                    showWatermark: pageData.value.watermark,
                    volume: pageData.value.volume, // 当前音量
                    isDblClickSplit: true, // 切换主子码流时，如果当前分屏winIndex不是0分屏（这种场景出现的原因：多通道播放时，双击其中一个通道放大，就会切换为一分屏，但是当前的一分屏可能是0分屏以外的分屏），如果此时切换主子码流，播放器则认为是播放了0分屏以外的通道，就会自动增加分屏，此时就会将分屏会自动切割为四分屏-MAX_SPLIT，isDblClickSplit为true则认为当前是双击分屏操作，不会自动切割分屏。
                })
            }

            if (mode.value === 'ocx') {
                pageData.value.winData.streamType = type
                if (type === 1) {
                    pageData.value.mainStreamTypeChl = pageData.value.winData.chlID
                } else {
                    pageData.value.mainStreamTypeChl = ''
                }
                cmd(OCX_XML_SetStreamType(pageData.value.winData.winIndex, type === 1 ? 0 : 1))
            }
        }

        /**
         * @description 更改当前通道鱼眼模式
         * @param {string} installType
         * @param {string} fishEyeMode
         */
        const changeFishEyeMode = (installType: string, fishEyeMode: string) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetFishEyeMode(installType, fishEyeMode)
                plugin.ExecuteCmd(sendXML)
            }
        }

        const changeStrategy = (strategy: boolean) => {
            pageData.value.strategy = strategy
            if (['play', 'pause', 'backwards'].includes(pageData.value.playStatus)) {
                playAll(timelineRef.value!.getTime() || startTimeStamp.value / 1000)
            }
        }

        /**
         * @description 设置裁切开始点
         */
        const clipStart = () => {
            timelineRef.value?.setClipStart()
        }

        /**
         * @description 设置裁切结束点
         */
        const clipEnd = () => {
            timelineRef.value?.setClipEnd()
        }

        /**
         * @description 备份，打开备份表单
         */
        const backUp = () => {
            if (plugin.BackUpTask.isExeed(pageData.value.recLogList.length)) {
                openMessageBox(Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(plugin.BackUpTask.limit))
                return
            }
            const startTime = pageData.value.timelineClipRange[0] * 1000
            const endTime = pageData.value.timelineClipRange[1] * 1000
            pageData.value.backupRecList = pageData.value.recLogList
                .filter((item) => {
                    return item.records.length
                })
                .map((item) => {
                    const events = Array.from(new Set(item.records.map((item) => item.event)))

                    return {
                        chlId: item.chlId,
                        chlName: item.chlName,
                        events: events
                            .map((item) => {
                                const find = pageData.value.legend.find((legend) => legend.value === item)
                                if (find) {
                                    if (find.children.length) return find.children
                                    else return find.value
                                } else return []
                            })
                            .flat(),
                        startTime,
                        endTime,
                        streamType: pageData.value.mainStreamTypeChl === item.chlId ? 0 : 1,
                    }
                })
            if (pageData.value.backupRecList.length) {
                pageData.value.isBackUpPop = true
            } else {
                openMessageBox(Translate('IDCS_NO_RECORD_DATA'))
            }
        }

        /**
         * @description 确认备份
         * @param {string} type
         * @param {string} path
         * @param {string} format
         */
        const confirmBackUp = (type: string, path: string, format: string) => {
            if (type === 'local') {
                if (mode.value === 'h5') {
                    pageData.value.isLocalBackUpPop = true
                }

                if (mode.value === 'ocx') {
                    plugin.BackUpTask.addTask(pageData.value.backupRecList, path, format)
                    pageData.value.isBackUpList = true
                }

                pageData.value.isBackUpPop = false
            } else {
                pageData.value.isBackUpPop = false
                pageData.value.isBackUpList = true
            }
        }

        const getEventColorType = (str: string) => {
            const findInEvent = pageData.value.eventList.includes(str)
            const findInLegend = pageData.value.legend.find((item) => item.children.includes(str))
            if (findInLegend && findInEvent) {
                return findInLegend.value
            }
            return 'otherType'
        }

        const getRecItem = async (item: PlaybackRecList) => {
            // 查询全部事件，后续在web端筛选选中的事件类型
            const sendXml = rawXml`
                <condition>
                    <startTime isUTC="true">${localToUtc(startTimeStamp.value)}</startTime>
                    <endTime isUTC="true">${localToUtc(endTimeStamp.value)}</endTime>
                    <recTypes type='list'></recTypes>
                    <keyword>${pageData.value.posKeyword}</keyword>
                    <chl id="${item.chlId}"></chl>
                </condition>
            `
            const result = await queryRecLog(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                item.chlId = $('content/chl').attr('id')
                item.chlName = $('content/chl').text()
                item.records = $('content/recList/item').map((item) => {
                    const $item = queryXml(item.element)
                    const startTime = $item('startTime').text().num() * 1000
                    const endTime = $item('endTime').text().num() * 1000
                    const recType = $item('recType').text()
                    const size = $item('size').text()

                    if (recType === 'pos') {
                        pageData.value.pos = true
                        pageData.value.hasPosEvent = true
                    }

                    return {
                        startTime,
                        endTime,
                        event: recType,
                        recSubType: recType,
                        size: size ? size + 'MB' : '--',
                        duration: dayjs.utc(endTime - startTime).format('HH:mm:ss'),
                        eventColorType: getEventColorType(recType),
                    }
                })
            } else {
                const errorType = $('errorDescription').text()
                if (errorType === 'noRecord') {
                    openNotify(item.chlName + ' : ' + Translate('IDCS_NO_RECORD_DATA'))
                }
            }
        }

        /**
         * @description 获取录像列表
         */
        const getRecList = async () => {
            pageData.value.pos = false
            pageData.value.hasPosEvent = false

            const tableData: PlaybackRecList[] = pageData.value.chls.map((item) => {
                const row = new PlaybackRecList()
                row.chlId = item.id
                row.chlName = item.value
                return row
            })

            await Promise.all(tableData.map((item) => getRecItem(item)))
            pageData.value.recLogList = cloneDeep(tableData.filter((item) => !!item.records.length))

            renderTimeline(false)
            // removeNoRecChl()

            if (!ready.value) {
                return
            }

            if (mode.value === 'ocx') {
                tableData.forEach((item, index) => {
                    const recordList = item.records.map((record) => {
                        return {
                            chlId: item.chlId,
                            chlName: item.chlName,
                            event: record.event,
                            startTime: formatGregoryDate(record.startTime, DEFAULT_DATE_FORMAT),
                            startTimeEx: localToUtc(record.startTime),
                            endTime: formatGregoryDate(record.endTime, DEFAULT_DATE_FORMAT),
                            endTimeEx: localToUtc(record.endTime),
                            duration: record.duration,
                        }
                    })
                    cmd(OCX_XML_SetRecList(item.chlId, index, recordList, item.timeZone))
                })
            }
        }

        const changeDetectTarget = (bool: boolean) => {
            if (!pageData.value.isDetectTarget && bool) {
                pause()
                pageData.value.detectTargetTime = timelineRef.value!.getTime() * 1000
                pageData.value.isDetectTarget = bool
            } else if (pageData.value.isDetectTarget && !bool) {
                if (pageData.value.playStatus === 'pause') {
                    resume()
                }
                pageData.value.isDetectTarget = bool
            }
        }

        const clearTargetDetect = (isResume = true) => {
            if (pageData.value.isDetectTarget) {
                if (isResume && pageData.value.playStatus === 'pause') {
                    resume()
                }
                pageData.value.isDetectTarget = false
            }
        }

        /**
         * @description 插件通知回调
         * @param {XMLQuery} $
         */
        const notify = ($: XMLQuery, stateType: string) => {
            // 播放进度
            if (stateType === 'RecCurPlayTime') {
                const time = $('statenotify/win').text().num()
                timelineRef.value?.setTime(time + Math.floor(startTimeStamp.value / 1000))
            }

            // 通知当前选中窗口信息
            if (stateType === 'CurrentSelectedWindow') {
                const $item = queryXml($('statenotify')[0].element)
                const winIndex = $item('winIndex').text().num()

                pageData.value.winData.chlID = $item('chlId').text()
                pageData.value.winData.winIndex = winIndex
                pageData.value.winData.audio = $item('volumOn').text().bool()
                pageData.value.winData.original = $item('isOriginalDisplayOn').text().bool()
                pageData.value.winData.streamType = $item('streamType').text().num() === 1 ? 0 : 1
                if (pageData.value.isFullScreen) {
                    pageData.value.fullScreenIndex = winIndex
                } else {
                    pageData.value.fullScreenIndex = -1
                }

                if (pageData.value.winData.streamType === 0) {
                    pageData.value.mainStreamTypeChl = pageData.value.winData.chlID
                }
                const playStatus = $item('playStatus').text()
                if (['FORWARDS', 'BACKWARDS', 'BACKWARDS_PAUSE', 'FORWARDS_PAUSE'].includes(playStatus)) {
                    if (pageData.value.winData.chlID === DEFAULT_EMPTY_ID) {
                        pageData.value.winData.PLAY_STATUS = 'stop'
                    } else {
                        pageData.value.winData.PLAY_STATUS = 'play'
                    }
                } else {
                    pageData.value.winData.PLAY_STATUS = 'stop'
                }
                // 是否启用鱼眼
                pageData.value.fishEye = $item('fishEyeInstallType').text()
            }

            // 通知窗口状态信息
            if (stateType === 'WindowStatus') {
                // const eventOpenWinNum = $("statenotify/eventOpenWinNum").text().num()
                const vedioOpenWinNum = $('statenotify/vedioOpenWinNum').text().num()
                pageData.value.playingListNum = vedioOpenWinNum
            }

            // 通知分割屏数目
            if (stateType === 'CurrentFrameNum' || stateType === 'CurrentScreenMode') {
                pageData.value.split = $('statenotify').text().trim().num()
            }

            // 通知双击大屏分割屏数目
            if (stateType === 'MaxFrameMode') {
                const segNum = $('statenotify').text().trim().num()
                pageData.value.split = segNum
                pageData.value.isFullScreen = segNum === 1 ? false : true
            }

            // 播放
            if (stateType === 'RecPlay') {
                const status = $('statenotify/status').text()
                const chlId = $('statenotify/chlId').text()
                // const winIndex = $("statenotify/winIndex").text()
                const errorCode = $('statenotify/errorCode').text().num()
                if (status === 'fail') {
                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_CHANNEL_NO_OPEN_VIDEO: // 解码能力不足
                            const find = pageData.value.chls.find((item) => item.id === chlId)
                            if (find) {
                                openNotify(find.value + ': ' + Translate('IDCS_OPEN_STREAM_FAIL'))
                            }
                            break
                    }
                } else if (status === 'noRecord') {
                    const find = pageData.value.chls.find((item) => item.id === chlId)
                    openNotify(find ? `${find.value}: ${Translate('IDCS_NO_REC_DATA')}` : Translate('IDCS_NO_REC_DATA'))
                }
            }

            // 通知抓图结果
            if (stateType === 'TakePhoto') {
                const status = $('statenotify/status').text()
                if (status === 'success') {
                    openNotify(Translate('IDCS_SNAP_SUCCESS_PATH') + Translate($('statenotify/dir').text()))
                } else {
                    const errorDescription = $('statenotify/errorDescription').text()
                    openNotify(Translate('IDCS_SNAP_FAIL') + (errorDescription || ''))
                }
            }

            // StartViewChl
            if (stateType === 'StartViewChl') {
                const status = $('statenotify/status').text()
                const chlId = $('statenotify/chlId').text()
                const winIndex = $('statenotify/winIndex').text().num()
                if (status === 'success') {
                    if (systemCaps.supportPOS) {
                        //设置通道是否显示POS信息
                        const pos = player.getPosInfo(chlId)
                        const area = pos.displayPosition
                        const sendXml = OCX_XML_SetPOSDisplayArea(true, winIndex, area.x, area.y, area.width, area.height, pos.printMode)
                        cmd(sendXml)
                    }
                }
            }

            // 通知通道是否支持当前音频格式解码
            if (stateType === 'AudioNoSupport') {
                if (pageData.value.winData.canShowAudioError) {
                    pageData.value.winData.canShowAudioError = false
                    openMessageBox(Translate('IDCS_UNSUPPORT_AUDIO_CODEC_TYPE'))
                }
            }
        }

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                // 离开时切换为一分屏，防止safari上其余用到插件的地方出现多分屏
                cmd(OCX_XML_SetScreenMode(1))
                pageData.value.recLogList.map((_item, index) => {
                    cmd(OCX_XML_ClearRecList(index))
                })
                // 离开时关闭osd信息，防止pc其他带视频的地方显示两个通道名
                toggleOSD(false)
                // 离开时关闭osd信息，防止pc其他带视频的地方显示两个通道名
                stop()
            }
        })

        return {
            pageData,
            userAuth,
            playingListNum,
            systemCaps,
            mode,
            changeEvent,
            handlePlayerReady,
            notify,
            playerRef,
            timelineRef,
            chlRef,
            snap,
            closeImg,
            zoomIn,
            zoomOut,
            displayOriginal,
            setVolume,
            setAudio,
            pauseBackwards,
            playBackwards,
            handleChlSearch,
            handleChlChange,
            handleChlPlay,
            handlePlayerTimeUpdate,
            handlePlayerSelect,
            handlePlayerSuccess,
            handlePlayerStop,
            handlePlayerStatus,
            handlePlayerError,
            handlePlayerDblclickChange,
            pause,
            stop,
            resume,
            setSplit,
            prevFrames,
            nextFrame,
            toggleOSD,
            fullScreen,
            setSpeed,
            seek,
            togglePos,
            jump,
            toggleWatermark,
            startTimeStamp,
            endTimeStamp,
            clipStart,
            clipEnd,
            backUp,
            confirmBackUp,
            changeStreamType,
            updateTimeline,
            changeFishEyeMode,
            isFishEyePanel,
            changeStrategy,
            changeDetectTarget,
            getAllEventList,
            handlePlayerAudioError,
            clearTargetDetect,
            changeSplit,
            handleTimelineSeek,
        }
    },
})
