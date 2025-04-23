/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 18:07:29
 * @Description: 现场预览
 */
import { type XMLQuery } from '@/utils/xmlParse'
import LiveChannelPanel, { type ChannelPanelExpose } from '../live/LiveChannelPanel.vue'
import LiveScreenPanel from '../live/LiveScreenPanel.vue'
import LiveControlPanel from '../live/LiveControlPanel.vue'
import LiveLensPanel from '../live/LiveLensPanel.vue'
import LiveAsidePanel from '../live/LiveAsidePanel.vue'
import LivePtzPanel from '../live/LivePtzPanel.vue'
import LiveSnapPanel from '../live/LiveSnapPanel.vue'
import LiveFishEyePanel, { type FishEyePanelExpose } from '../live/LiveFishEyePanel.vue'

/**
 * @description 状态订阅模块（通道在线状态、录像事件、报警推送）
 * @param {Object} userSession
 * @param {Object} playerRef
 * @param {Object} chlRef
 * @param {Function} recordCallback
 * @param {Function} recordRemoteCallback
 */
const useStateSubscribe = (
    userSession: ReturnType<typeof useUserSessionStore>,
    playerRef: Ref<PlayerInstance | undefined>,
    chlRef: Ref<ChannelPanelExpose | undefined>,
    recordCallback: (chlID: string, status: boolean) => void,
    recordRemoteCallback: (status: boolean) => void,
) => {
    let ws: ReturnType<typeof WebsocketState> | null = null

    // 报警节点id和通道GUID的映射
    const chlIdMap = ref<Record<string, string>>({})

    type AlarmStatusChlId = string
    type AlarmStatusAlarmType = string
    type AlarmStatusIsAlarming = boolean
    const alarmStatusMap = ref<Record<AlarmStatusChlId, Record<AlarmStatusAlarmType, AlarmStatusIsAlarming>>>({})

    type RecordStatusItem = {
        type: string[]
        isRecording: boolean
    }

    const recordStatusMap = ref<Record<string, RecordStatusItem>>({})

    const ready = computed(() => {
        return playerRef.value?.ready || false
    })

    const mode = computed(() => {
        if (!ready.value) {
            return ''
        }

        return playerRef.value?.mode
    })

    /**
     * @description 订阅状态
     */
    const createStateSubscribe = () => {
        ws = WebsocketState({
            config: {
                channel_state_info: true,
                alarm_state_info: userSession.hasAuth('alarmMgr'),
            },
            onmessage(data) {
                handleChlState(data.channel_state_info)
                handleAlarmState(data.alarm_state_info)
            },
        })
    }

    interface ChlState {
        // 通道id
        channel_id: string
        // 在线状态
        connect_state: boolean
        // 通道录像类型
        record_type_list: string[]
        // 录像状态
        record_status: string
    }

    /**
     * @description 处理通道在线状态和录像状态
     * @param {ChlState[]} chlStateInfo
     */
    const handleChlState = (chlStateInfo?: ChlState[]) => {
        if (!chlStateInfo || !chlStateInfo.length) {
            return
        }

        const chlOnlineList = chlRef.value?.getOnlineChlList() || []
        const recordList: RecordState[] = []

        // 火点检测/温度检测录像类型映射转换
        const recordTypeMap: Record<string, string> = {
            smart_fire_point: 'fire_point',
            smart_temperature: 'temperature',
        }

        chlStateInfo.forEach((item) => {
            const isOnline = item.connect_state
            const chlId = item.channel_id
            const recordTypes = item.record_type_list
            const isRecording = item.record_status === 'on'
            const tempRecordTypes: string[] = []

            // 将火点检测、温度检测的录像类型进行转换（去掉"smart_"），保证与事件报警类型字段一致
            recordTypes.forEach((item) => {
                const type = recordTypeMap[item] || item
                tempRecordTypes.push(type)
            })
            const findChlIndex = chlOnlineList.indexOf(chlId)
            if (isOnline) {
                recordList.push({
                    id: chlId,
                    recType: tempRecordTypes,
                    isRecording,
                })
                if (findChlIndex === -1) {
                    chlOnlineList.push(chlId)
                }
            } else {
                if (findChlIndex > -1) {
                    chlOnlineList.splice(findChlIndex, 1)
                }
            }
        })

        handleRecordState(recordList)
        chlRef.value?.setOnlineChlList(chlOnlineList)
    }

    interface AlarmState {
        // 报警节点id
        node_id: string
        // 通道GUID
        chl_id: string
        // 报警类型
        alarm_type: string
        // 报警状态
        alarm_state: boolean
        // 报警触发的UTC时间，单位为秒
        alarm_time: number
    }

    /**
     * @description 处理报警信息
     * @param {AlarmState[]} alarmInfo
     */
    const handleAlarmState = (alarmInfo?: AlarmState[]) => {
        if (!alarmInfo || !alarmInfo.length) {
            return
        }
        alarmInfo.forEach((item) => {
            const alarmType = item.alarm_type
            const isAlarming = item.alarm_state
            // 报警为开时, chl_id会传回正确的GUID; 为关时, chl_id会返回空, 所以这里用chlIdMap记录通道GUID
            if (!chlIdMap.value[item.node_id]) {
                chlIdMap.value[item.node_id] = item.chl_id
            }
            const chlId = chlIdMap.value[item.node_id] || ''
            const chlList = chlRef.value?.getChlMap() || {}
            const find = chlList[chlId]
            if (find) {
                if (mode.value === 'h5') {
                    playerRef.value?.player.setAlarmStatus(chlId, alarmType, isAlarming)
                }

                // 缓存每个通道报警状态
                if (!alarmStatusMap.value[chlId]) {
                    alarmStatusMap.value[chlId] = {}
                }
                alarmStatusMap.value[chlId][alarmType] = isAlarming
            }
        })
    }

    interface RecordState {
        id: string
        recType: string[]
        isRecording: boolean
    }

    /**
     * @description 根据通道录像状态更新录像osd
     * @param {string} chlId
     * @param {Array} recordTypes
     * @param {Boolean} isRecording
     */
    const handleRecordState = (recordInfo: RecordState[]) => {
        recordInfo.forEach((item) => {
            if (mode.value === 'h5') {
                playerRef.value?.player.setRecordStatus(item.id, item.recType, item.isRecording)
            }

            recordStatusMap.value[item.id] = {
                type: item.recType,
                isRecording: item.isRecording,
            }

            const currentRemoteRecBtnStatus = item.isRecording && item.recType.length > 0 && item.recType.includes('manual')
            recordCallback(item.id, currentRemoteRecBtnStatus)
        })

        const recordingChls: string[] = []
        const cmdParms: { id: string; recType: string }[] = []

        Object.entries(recordStatusMap.value).forEach(([chlId, item]) => {
            if (item.type.includes('manual') && item.isRecording) {
                recordingChls.push(chlId)
            }
            cmdParms.push({
                id: chlId,
                recType: item.isRecording ? item.type.join(',') : 'noStatus',
            })
        })

        if (mode.value === 'ocx') {
            const sendXML = OCX_XML_SetRecStatus(cmdParms)
            playerRef.value?.plugin.ExecuteCmd(sendXML)
        }

        const onlineChlCount = (chlRef.value?.getOnlineChlList() || []).length
        recordRemoteCallback(!!onlineChlCount && !!recordingChls.length)
    }

    const stopWatch = watchEffect(() => {
        if (ready.value) {
            createStateSubscribe()
            stopWatch()
        }
    })

    onBeforeUnmount(() => {
        ws?.destroy()
        ws = null
    })

    return {
        alarmStatusMap,
        recordStatusMap,
        chlIdMap,
    }
}

/**
 * @description 记录当前录像模式（自动/手动）
 * @param {Ref<string>} mode 播放器模式
 */
const useRecType = (mode: Ref<string>) => {
    const recType = ref('')

    /**
     * @description 获取录像模式数据
     */
    const getData = async () => {
        const result = await queryRecordDistributeInfo()
        const $ = queryXml(result)
        recType.value = $('content/recMode/mode').text()
    }

    const stopWatch = watch(
        mode,
        (newVal) => {
            if (newVal === 'ocx') {
                getData()
                stopWatch()
            } else if (newVal === 'h5') {
                stopWatch()
            }
        },
        {
            immediate: true,
        },
    )

    return recType
}

export default defineComponent({
    components: {
        LiveChannelPanel,
        LiveScreenPanel,
        LiveControlPanel,
        LiveAsidePanel,
        LiveLensPanel,
        LivePtzPanel,
        LiveSnapPanel,
        LiveFishEyePanel,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const layoutStore = useLayoutStore()

        const playerRef = ref<PlayerInstance>()
        const chlRef = ref<ChannelPanelExpose>()
        const fisheyeRef = ref<FishEyePanelExpose>()

        const cloneWinData = new LiveSharedWinData()
        // OCX 记录窗口和通道的映射
        const cacheWinMap = Array(36)
            .fill(null)
            .map(() => ({ ...cloneWinData }))

        const pageData = ref({
            // 分屏数
            split: layoutStore.liveLastSegNum || 1,
            // 当前选中窗口的数据
            winData: new LiveSharedWinData(),
            // 正在播放的通道列表
            playingList: [] as string[],
            // 底部菜单栏本地录像状态
            allClientRecord: false,
            // 底部菜单栏远程录像状态
            allRemoteRecord: false,
            // 底部菜单栏对讲状态
            allTalk: false,
            // 底部菜单栏图像状态
            allPreview: true,
            // 是否开启OSD
            osd: true,
            // 是否开启远程录像
            remoteRecord: false,
            // 音量
            volume: 50,
            // AZ支持
            supportAz: false,
            // 鱼眼支持
            supportFishEye: false,
            // 通道与能力映射
            chlMap: {} as Record<string, LiveChannelList>,
        })

        // 播放模式
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

        const recType = useRecType(mode)
        const userAuth = useUserChlAuth()
        const stateSubscribe = useStateSubscribe(
            userSession,
            playerRef,
            chlRef,
            (chlID, status) => {
                if (chlID === pageData.value.winData.chlID) {
                    pageData.value.remoteRecord = status
                }
            },
            (status) => {
                pageData.value.allRemoteRecord = status
            },
        )

        // 抓拍视图是否显示
        const isSnapPanel = computed(() => {
            if (userSession.appType === 'P2P') {
                return false
            }

            return true
        })

        // 鱼眼视图是否显示
        const isFishEyePanel = computed(() => {
            return mode.value === 'ocx' && userSession.appType === 'STANDARD'
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    openNotify(formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`), true)
                }

                if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                    player.getChlIp()
                }
            }

            if (mode.value === 'ocx') {
                if (userSession.appType === 'STANDARD' && isHttpsLogin()) {
                    // 本地https访问时，提示不支持目标检测（依赖websocket与设备端的通信，仅支持http）
                    openNotify(formatHttpsTips(Translate('IDCS_TARGET_DETECTION')), true)
                }

                {
                    const sendXML = OCX_XML_SetPluginModel('Interactive', 'Live')
                    plugin.ExecuteCmd(sendXML)
                }

                const sendXML = OCX_XML_SetProperty({
                    calendarType: userSession.calendarType,
                    supportRecStatus: true,
                    supportImageRotate: systemCaps.supportImageRotate,
                    showVideoLossMessage: systemCaps.showVideoLossMessage,
                    productModel: systemCaps.productModel,
                })
                plugin.ExecuteCmd(sendXML)
            }

            // 视频预览默认铺满显示，设置走廊模式旋转时，需要选择“原始比例”显示
            displayOriginal(true)

            toggleOSD(true)
        }

        /**
         * @description 获取OSD配置
         */
        const getDeviceOSDDisplayConfig = async () => {
            const result = await queryDevOsdDisplayCfg()
            const $ = queryXml(result)
            const nameSwitch = $('content/nameSwitch').text().bool()
            const iconSwitch = $('content/iconSwitch').text().bool()
            const addressSwitch = $('content/addressSwitch').text().bool()
            const sendXML = OCX_XML_SetPropertyOSD(nameSwitch, iconSwitch, addressSwitch)
            plugin.ExecuteCmd(sendXML)
        }

        /**
         * @description 更新播放器回调的页面窗口状态
         * @param {number} index
         * @param {Object} winData
         */
        const updateWinData = (index: number, winData: TVTPlayerWinDataListItem) => {
            if (playerRef.value && index === player?.getSelectedWinIndex()) {
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
                    chlName: winData.CHANNEL_INFO?.chlID ? pageData.value.chlMap[winData.CHANNEL_INFO!.chlID]?.value || '' : '',
                    streamType: winData.CHANNEL_INFO?.streamType || 2,
                    talk: false,
                    isDwellPlay: false,
                    groupID: '',
                    supportAudio: true,
                }
            }
        }

        // 页面准备就绪时初始化播放
        const stopInitialPlay = watchEffect(() => {
            if (Object.keys(pageData.value.chlMap).length && ready.value) {
                nextTick(() => {
                    if (isHttpsLogin() && mode.value === 'h5') {
                        stopInitialPlay()
                        return
                    }

                    if (layoutStore.liveLastChlList.length) {
                        const curerntOnlineList = chlRef.value?.getOnlineChlList() || []
                        const onlineList = layoutStore.liveLastChlList
                            .filter((item) => {
                                return curerntOnlineList.includes(item)
                            })
                            .map((item, index) => {
                                return {
                                    chlIndex: index,
                                    chlId: item,
                                }
                            })
                        setTimeout(() => {
                            playCustomView(onlineList, layoutStore.liveLastSegNum)
                        }, 100)
                    } else {
                        setTimeout(() => {
                            playSplitVideo(1)
                        }, 100)
                    }

                    if (mode.value === 'ocx') {
                        if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                            getDeviceOSDDisplayConfig()
                        }
                    }
                    stopInitialPlay()
                })
            }
        })

        /**
         * @description 播放分屏
         * @param {number} segNum
         */
        const playSplitVideo = (segNum: number, type = 1) => {
            if (!ready.value) {
                return
            }

            // 切换分屏时，取消通道组轮询
            stopPollingChlGroup()

            const splitChlData = (chlRef.value?.getOnlineChlList() || []).slice(0, segNum)
            const offlineChlList = chlRef.value?.getOfflineChlList() || []
            while (offlineChlList.length && splitChlData.length < segNum) {
                splitChlData.push(offlineChlList.pop()!)
            }

            pageData.value.split = segNum

            if (mode.value === 'h5') {
                player.stopAll()
                player.setSplit(segNum)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetScreenMode(segNum, type)
                plugin.ExecuteCmd(sendXML)
            }

            nextTick(() => {
                playChls(splitChlData)
            })
        }

        /**
         * @description 处理多个窗口播放
         * @param {Array} chlList
         */
        const playChls = (chlList: string[]) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                chlList.forEach((chlID, index) => {
                    // 切换分割数时，默认使用子码流
                    const params = {
                        chlID,
                        streamType: 2,
                        winIndex: index,
                        supportPtz: pageData.value.chlMap[chlID].supportPtz,
                        volumn: pageData.value.volume,
                    }
                    player.play(params)
                })
            }

            if (mode.value === 'ocx') {
                chlList.forEach((chlID, index) => {
                    const sendXML = OCX_XML_SelectScreen(index)
                    plugin.ExecuteCmd(sendXML)

                    if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                        const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value, {
                            chlIp: pageData.value.chlMap[chlID].chlIp,
                            poeSwitch: pageData.value.chlMap[chlID].poeSwitch,
                        })
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                        plugin.ExecuteCmd(sendXML)
                    }
                })
            }
        }

        /**
         * @description 当前选中窗口播放
         * @param {string} chlID
         */
        const playChl = (chlID: string) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                const winIndex = player.getSelectedWinIndex()

                // 当前点击的通道与正在选中播放的窗口相同
                if (chlID === pageData.value.winData.chlID) {
                    return
                }

                stopPollingChlGroup(winIndex)

                // 点击的通道正处于播放状态
                if (pageData.value.playingList.includes(chlID)) {
                    if (pageData.value.playingList.length === 1) {
                        return
                    }

                    const winData = player.getWinData()
                    const find = winData.find((item) => item.CHANNEL_INFO?.chlID === chlID && !item.isPolling)

                    if (find) {
                        const curChlID = pageData.value.winData.chlID
                        const findIndex = find.winIndex
                        player.play({
                            chlID: curChlID,
                            winIndex: findIndex,
                            streamType: 2,
                            supportPtz: pageData.value.chlMap[curChlID].supportPtz,
                            volume: pageData.value.volume,
                        })
                        player.play({
                            chlID: chlID,
                            winIndex: winIndex,
                            streamType: 2,
                            supportPtz: pageData.value.chlMap[chlID].supportPtz,
                            volume: pageData.value.volume,
                        })
                        return
                    }
                }

                player.play({
                    chlID: chlID,
                    streamType: 2,
                    winIndex: player.getSelectedWinIndex(),
                    supportPtz: pageData.value.chlMap[chlID].supportPtz,
                    audioStatus: false,
                    volume: pageData.value.volume,
                })
            }

            if (mode.value === 'ocx') {
                const currentChlID = pageData.value.winData.chlID
                const currentChlWinIndex = pageData.value.winData.winIndex

                // 当前点击的通道与正在选中播放的窗口相同
                if (chlID === pageData.value.winData.chlID) {
                    return
                }

                stopPollingChlGroup(currentChlWinIndex)

                // 点击的通道正处于播放状态
                if (pageData.value.playingList.includes(chlID)) {
                    if (pageData.value.playingList.length === 1) {
                        return
                    }

                    const find = cacheWinMap.find((item) => item.chlID === chlID && !item.isPolling)
                    if (find) {
                        const findIndex = find.winIndex
                        {
                            const sendXML = OCX_XML_SelectScreen(findIndex)
                            plugin.ExecuteCmd(sendXML)
                        }

                        {
                            const sendXML = OCX_XML_SetViewChannelID(currentChlID, pageData.value.chlMap[currentChlID].value)
                            plugin.ExecuteCmd(sendXML)
                        }

                        {
                            const sendXML = OCX_XML_SelectScreen(currentChlWinIndex)
                            plugin.ExecuteCmd(sendXML)
                        }

                        {
                            const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                            plugin.ExecuteCmd(sendXML)
                        }
                    }

                    return
                }

                const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                plugin.ExecuteCmd(sendXML)
            }
        }

        const chlGroupTimer: (NodeJS.Timeout | number)[] = Array(36).fill(0)

        /**
         * @description 通道组轮询播放
         * @param {Array} chlList
         * @param {number} dwellTime
         */
        const playChlGroup = (chlList: { id: string; value: string }[], groupId: string, dwellTime: number) => {
            if (!ready.value) {
                return
            }

            stopPollingChlGroup()

            if (mode.value === 'h5') {
                const winIndex = player.getSelectedWinIndex()
                let currentIndex = 0

                const startPollingChlGroup = () => {
                    const chl = chlList[currentIndex % chlList.length]
                    player.play({
                        chlID: chl.id,
                        winIndex,
                        streamType: 2,
                        isSelect: false,
                        callback: () => startPollingChlGroup,
                        audioStatus: false,
                        isPolling: true,
                        volume: pageData.value.volume,
                    })
                    player.setPollIndex(winIndex)

                    chlGroupTimer[winIndex] = setTimeout(() => {
                        currentIndex++
                        startPollingChlGroup()
                    }, dwellTime * 1000)
                }

                startPollingChlGroup()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_CallChlGroup(chlList, groupId, dwellTime)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 停止轮询播放
         * @param {number} index -1为所有窗口
         */
        const stopPollingChlGroup = (index = -1) => {
            if (mode.value === 'h5') {
                if (index === -1) {
                    chlGroupTimer.forEach((timer) => {
                        clearTimeout(timer)
                        timer = 0
                    })
                } else {
                    clearTimeout(chlGroupTimer[index])
                    chlGroupTimer[index] = 0
                }
            }

            if (mode.value === 'ocx') {
                let sendXML = ''
                if (index === -1) {
                    sendXML = OCX_XML_StopPreview('CURRENT')
                } else if (index === pageData.value.winData.winIndex) {
                    sendXML = OCX_XML_StopPreview('CURRENT')
                } else {
                    sendXML = OCX_XML_StopPreview(index)
                }
                plugin?.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 播放自定义视图
         * @param {Array} arr
         * @param {number} segNum
         */
        const playCustomView = (arr: LiveCustomViewChlList[], segNum: number) => {
            if (!ready.value) {
                return
            }

            stopPollingChlGroup()

            if (mode.value === 'h5') {
                player.stopAll()
                player.setSplit(segNum)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetScreenMode(segNum, segNum === 10 ? 2 : 1)
                plugin.ExecuteCmd(sendXML)
            }

            pageData.value.split = segNum
            // pageData.value.playingList = []
            playChls(arr.map((item) => item.chlId))
        }

        /**
         * @description WASM播放器播放器更改选中分屏回调
         * @param index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerSelect = (index: number, data: TVTPlayerWinDataListItem) => {
            updateWinData(index, data)
        }

        /**
         * @description WASM播放器播放成功回调
         * @param {number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerSuccess = (index: number, data: TVTPlayerWinDataListItem) => {
            const chlId = data.CHANNEL_INFO!.chlID

            updateWinData(index, data)
            setAlarmStatus(chlId)
            setRecStatus(chlId)
        }

        // UI1-D UI1-G 选择高画质登录
        if (import.meta.env.VITE_UI_TYPE === 'UI1-D' || import.meta.env.VITE_UI_TYPE === 'UI1-G') {
            const stopFirstLoadStream = watchEffect(() => {
                if (mode.value === 'h5' || mode.value === 'ocx') {
                    if (userSession.defaultStreamType === 'main') {
                        if (mode.value === 'h5') {
                            if (pageData.value.split === 1) {
                                changeStreamType(1)
                            }
                        }

                        if (mode.value === 'ocx') {
                            changeStreamType(1)
                        }

                        userSession.defaultStreamType = 'sub'
                    }

                    stopFirstLoadStream()
                }
            })
        }

        /**
         * @description WASM播放器停止播放回调
         * @param {number} index
         * @param {TVTPlayerWinDataListItem} data
         */
        const handlePlayerStop = (index: number, data: TVTPlayerWinDataListItem) => {
            updateWinData(index, data)
        }

        /**
         * @description WASM播放器播放状态回调
         * @param {Array} data
         */
        const handlePlayerStatus = (data: TVTPlayerWinDataListItem[]) => {
            const type = data.length ? true : false
            // 设置底部栏按钮显示状态
            pageData.value.allPreview = type

            // 设置通道列表图标显示状态
            pageData.value.playingList = []
            data.forEach((item) => {
                const chlId = item.CHANNEL_INFO!.chlID
                if (chlId) {
                    pageData.value.playingList.push(chlId)
                }
            })
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
            } else {
                updateWinData(index, data)
            }
        }

        /**
         * @description wasm播放器录像文件回调
         * @param {ArrayBuffer} recordBuf
         * @param {Object} data
         * @param {number} recordStartTime
         */
        const handlePlayerRecordFile = (recordBuf: ArrayBuffer, data: TVTPlayerWinDataListItem, recordStartTime: number) => {
            const chlId = data.CHANNEL_INFO!.chlID
            const chlName = chlRef.value!.getChlMap()[chlId].value
            const date = formatDate(recordStartTime, 'YYYYMMDDHHmmss')
            download(new Blob([recordBuf]), `${chlName}_${date}.avi`)
            if (!localStorage.getItem(LocalCacheKey.KEY_LOCAL_AVI_NOT_ENCRYPTED)) {
                openNotify(Translate('IDCS_AVI_UNENCRYPTED_TIP'))
                localStorage.setItem(LocalCacheKey.KEY_LOCAL_AVI_NOT_ENCRYPTED, 'true')
            }
        }

        /**
         * @description 所有通道本地录像
         * @param {boolean} bool
         */
        const toggleAllClientRecord = (bool: boolean) => {
            if (!ready.value) {
                return
            }
            pageData.value.allClientRecord = bool

            if (mode.value === 'h5') {
                if (bool) {
                    player.startAllRecord()
                } else {
                    player.stopAllRecord()
                }
            }

            if (mode.value === 'ocx') {
                pageData.value.winData.localRecording = bool
                const sendXML = OCX_XML_AllRecSwitch(bool ? 'ON' : 'OFF')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 所有通道远程录像
         * @param {boolean} bool
         */
        const toggleAllRemoteRecord = (bool: boolean) => {
            if (!playerRef.value?.ready) {
                return
            }
            pageData.value.allRemoteRecord = bool
            // 设置完全部录像的时候按通道查询不一定会更新到，延迟一下
            setTimeout(() => {
                pageData.value.remoteRecord = bool
            }, 1000)
        }

        /**
         * @description 开启/关闭预览
         * @param {boolean} bool
         */
        const toggleAllPreview = (bool: boolean) => {
            stopPollingChlGroup()

            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                if (bool) {
                    playSplitVideo(pageData.value.split)
                } else {
                    player.setPollingState(false)
                    player.stopAll()
                }
            }

            if (mode.value === 'ocx') {
                if (bool) {
                    const chlIds = (chlRef.value?.getOnlineChlList() || []).slice(0, pageData.value.split)
                    const chlNames = chlIds.map((item) => pageData.value.chlMap[item].value)
                    if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                        const chlPoe = chlIds.map((item) => {
                            return {
                                chlIp: pageData.value.chlMap[item].chlIp,
                                poeSwitch: pageData.value.chlMap[item].poeSwitch,
                            }
                        })
                        const sendXML = OCX_XML_SetAllViewChannelId(chlIds, chlNames, chlPoe)
                        plugin.ExecuteCmd(sendXML)
                    } else {
                        const sendXML = OCX_XML_SetAllViewChannelId(chlIds, chlNames)
                        plugin.ExecuteCmd(sendXML)
                    }
                } else {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.ExecuteCmd(sendXML)
                }
            }
            pageData.value.allPreview = bool
        }

        /**
         * @description 和NVMS-9000对讲
         * @param {boolean} bool
         */
        const toggleAllTalk = (bool: boolean) => {
            if (!playerRef.value?.ready) {
                return
            }

            if (mode.value === 'ocx') {
                if (bool) {
                    toggleTalk(false)
                    // 打开对讲时，关闭音频
                    setAudio(false)
                }
                const sendXML = OCX_XML_TalkSwitch(bool ? 'ON' : 'OFF')
                plugin.ExecuteCmd(sendXML)
            }
            pageData.value.allTalk = bool
        }

        /**
         * @description 切换全部通道码流
         * @param {number} type 1: 主码流 2: 子码流
         */
        const changeAllStreamType = (type: number) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetStreamType('ALL', type)
                plugin.ExecuteCmd(sendXML)
            }
            pageData.value.winData.streamType = type
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
                const sendXML = OCX_XML_OSDSwitch(bool ? 'ON' : 'OFF')
                plugin.ExecuteCmd(sendXML)

                if (bool) {
                    setRecStatus()
                }
            }
        }

        /**
         * @description 设置报警状态OSD
         * @param {string} chlId h5模式需传chlId，ocx不需要
         */
        const setAlarmStatus = (chlId = '') => {
            if (mode.value === 'h5') {
                const alaramStatus = stateSubscribe.alarmStatusMap.value[chlId]
                if (alaramStatus) {
                    Object.entries(alaramStatus).forEach(([type, bool]) => {
                        playerRef.value!.player.setAlarmStatus(chlId, type, bool)
                    })
                }
            }
        }

        /**
         * @description 设置录像状态OSD
         * @param {string} chlId h5模式需传chlId，ocx不需要
         */
        const setRecStatus = (chlId = '') => {
            if (mode.value === 'h5') {
                const recordStatus = stateSubscribe.recordStatusMap.value[chlId]
                if (recordStatus) {
                    playerRef.value!.player.setRecordStatus(chlId, recordStatus.type, recordStatus.isRecording)
                }
            }

            if (mode.value === 'ocx') {
                const cmdParms = Object.entries(stateSubscribe.recordStatusMap.value).map((item) => {
                    return {
                        id: item[0],
                        recType: item[1].isRecording ? item[1].type.join(',') : 'noStatus',
                    }
                })
                const sendXML = OCX_XML_SetRecStatus(cmdParms)
                plugin.ExecuteCmd(sendXML)
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
                const sendXML = OCX_XML_FullScreen()
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 更新分屏
         * @param {number} split
         */
        const updateSplit = (split: number) => {
            if (!playerRef.value?.ready) {
                return
            }

            // 点击相同分割数时切换通道
            if (pageData.value.split === split) {
                chlRef.value?.switchChl(split)
                return
            }

            pageData.value.split = split
            playSplitVideo(split)
        }

        /**
         * @description 更新通道与能力的映射
         * @param {Object} chlMap
         */
        const getChlMap = (chlMap: Record<string, LiveChannelList>) => {
            pageData.value.chlMap = cloneDeep(chlMap)
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
         */
        const closeImg = () => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                const winIndex = player.getSelectedWinIndex()
                stopPollingChlGroup(winIndex)

                player.setPollingState(false, winIndex)
                player.stop(winIndex)
            }

            if (mode.value === 'ocx') {
                stopPollingChlGroup(pageData.value.winData.winIndex)
                pageData.value.winData.PLAY_STATUS = 'stop'
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
         * @description 当前通道开启3D放大
         * @param {boolean} bool
         */
        const zoom3D = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            if (mode.value === 'h5') {
                player.zoom3D(player.getSelectedWinIndex(), bool)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_3DSwitch(bool)
                plugin.ExecuteCmd(sendXML)
            }
            pageData.value.winData.magnify3D = bool
        }

        /**
         * @description 更改当前通道的码流类型
         * @param {number} streamType
         */
        const changeStreamType = async (streamType: number) => {
            if (!ready.value) {
                return
            }
            pageData.value.winData.streamType = streamType
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.winData.chlID,
                    streamType,
                    supportPtz: pageData.value.chlMap[pageData.value.winData.chlID].supportPtz,
                    volume: pageData.value.volume,
                })
            }

            if (mode.value === 'ocx') {
                if (streamType === 1) {
                    openLoading(document.querySelector('.base-home-panel.right') as HTMLElement)

                    const sendXml = rawXml`
                        <condition>
                            <chlId>${pageData.value.winData.chlID}</chlId>
                            <requireField>
                                <chlType />
                                <an />
                                <ae />
                            </requireField>
                        </condition>
                    `
                    const result = await queryNodeEncodeInfo(sendXml)
                    const $ = queryXml(result)
                    const content = $('content/item')

                    let mainResolution = ''
                    if (content.length) {
                        const $el = queryXml(content[0].element)
                        if (recType.value) {
                            mainResolution = recType.value === 'auto' ? $el('ae').attr('res') : $el('an').attr('res')
                        }
                    }
                    const sendXML = OCX_XML_SetStreamType(pageData.value.winData.winIndex, streamType, mainResolution.replace(/[x|X|*]/g, 'x'))
                    plugin.ExecuteCmd(sendXML)

                    closeLoading(document.querySelector('.base-home-panel.right') as HTMLElement)
                } else {
                    const sendXML = OCX_XML_SetStreamType(pageData.value.winData.winIndex, streamType)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 本地录像
         * @param {boolean} bool
         */
        const recordLocal = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.winData.localRecording = bool

            if (mode.value === 'h5') {
                if (bool) {
                    player.startRecord(player.getSelectedWinIndex())
                } else {
                    player.stopRecord(player.getSelectedWinIndex())
                }
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_RecSwitch(bool ? 'ON' : 'OFF')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 远程录像
         * @param {boolean} bool
         */
        const recordRemote = (bool: boolean) => {
            pageData.value.remoteRecord = bool
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
                player.setVolume(player.getSelectedWinIndex(), volume)
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVolume(volume)
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 设置当前通道是否静音
         * @param {boolean} bool
         */
        const setAudio = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.winData.audio = bool
            if (mode.value === 'h5') {
                if (bool) {
                    player.openAudio(player.getSelectedWinIndex())
                } else {
                    player.closeAudio(player.getSelectedWinIndex())
                }
            }

            if (mode.value === 'ocx') {
                if (userAuth.value.audio[pageData.value.winData.chlID] === false) {
                    openMessageBox(Translate('IDCS_NO_PERMISSION'))
                    return
                }

                if (bool) {
                    // 打开音频时，先关闭对讲
                    if (pageData.value.winData.talk) {
                        toggleTalk(false)
                    } else if (pageData.value.allTalk) {
                        toggleAllTalk(false)
                    }

                    const sendXML = OCX_XML_SetVolume(pageData.value.volume)
                    plugin.ExecuteCmd(sendXML)
                } else {
                    const sendXML = OCX_XML_SetVolume(0)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        /**
         * @description 开启/关闭对讲
         * @param {boolean} bool
         */
        const toggleTalk = (bool: boolean) => {
            if (!ready.value) {
                return
            }

            pageData.value.winData.talk = bool
            if (mode.value === 'ocx') {
                if (bool) {
                    toggleAllTalk(false)
                    // 打开对讲时，关闭音频
                    setAudio(false)
                }
                const sendXML = OCX_XML_TalkSwitch(bool ? 'ON' : 'OFF', pageData.value.winData.chlID)
                plugin.ExecuteCmd(sendXML)
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

        /**
         * @description 更新当前镜头控制支持
         * @param {boolean} bool
         */
        const updateSupportAz = (bool: boolean) => {
            pageData.value.supportAz = bool
        }

        /**
         * @description 更新当前通道鱼眼支持
         * @param {boolean} bool
         */
        const updateSupportFishEye = (bool: boolean) => {
            pageData.value.supportFishEye = bool
        }

        let notifyTimer: NodeJS.Timeout | number = 0

        /**
         * @description 插件接收消息
         * @param {XMLQuery} $
         */
        const notify = ($: XMLQuery, stateType: string) => {
            // 设置预览通道状态
            if (stateType === 'StartViewChl') {
                const status = $('statenotify/status').text()
                const chlId = $('statenotify/chlId').text()
                const winIndex = $('statenotify/winIndex').text().num()
                switch (status) {
                    case 'success':
                        cacheWinMap[winIndex].PLAY_STATUS = 'play'
                        cacheWinMap[winIndex].chlID = chlId
                        cacheWinMap[winIndex].winIndex = winIndex

                        if (!pageData.value.playingList.includes(chlId)) {
                            pageData.value.playingList.push(chlId)
                        }

                        if (pageData.value.winData.chlID === chlId) {
                            // pageData.value.winData = new LiveSharedWinData()
                            pageData.value.winData.PLAY_STATUS = 'play'
                            pageData.value.winData.chlID = chlId
                            pageData.value.winData.winIndex = winIndex
                        }

                        //设置通道是否显示POS信息
                        const pos = player.getPosInfo(chlId)
                        if (pos.previewDisplay) {
                            const area = pos.displayPosition
                            const sendXml = OCX_XML_SetPOSDisplayArea(true, winIndex, area.x, area.y, area.width, area.height, pos.printMode)
                            plugin.ExecuteCmd(sendXml)
                        } else {
                            const sendXml = OCX_XML_SetPOSDisplayArea(false, winIndex, 0, 0, 0, 0)
                            plugin.ExecuteCmd(sendXml)
                        }

                        setRecStatus()
                        break
                    case 'offline':
                        // openNotify(Translate("IDCS_NODE_NOT_ONLINE"))
                        break
                    case 'busy':
                        openNotify(Translate('IDCS_DEVICE_BUSY'))
                        break
                    case 'noRight':
                        openNotify(Translate('IDCS_CHL_NO_PLAY_REC_AUTH'))
                        break
                }
            }

            // 设置停止预览通道状态
            if (stateType === 'StopViewChl') {
                const chlId = $('statenotify/chlId').text()
                const winIndex = $('statenotify/winIndex').text().num()

                cacheWinMap[winIndex] = { ...cloneWinData }

                if (pageData.value.winData.chlID === chlId) {
                    pageData.value.winData.PLAY_STATUS = 'stop'
                }

                const index = pageData.value.playingList.indexOf(chlId)
                if (index > -1) {
                    pageData.value.playingList.splice(index, 1)
                }
            }

            // 设置预览通道失败
            if (stateType === 'SetViewChannelId') {
                if ($('statenotify/status').text() !== 'success') {
                    const errorCode = $('statenotify/errorCode').text().num()
                    // 主码流预览失败超过上限，切换回子码流预览
                    if (errorCode === ErrorCode.USER_ERROR_CHANNEL_NO_OPEN_VIDEO) {
                        changeStreamType(2)
                        openNotify(Translate('IDCS_OPEN_STREAM_FAIL'))
                    }
                }
            }

            // 窗口状态改变通知
            if (stateType === 'WindowStatus') {
                if ($('statenotify/previewingWinNum').text().num()) {
                    pageData.value.allPreview = true
                    // pageData.value.winData.PLAY_STATUS = 'stop'
                } else {
                    pageData.value.allPreview = false
                }

                if ($('statenotify/recordingWinNum').text().num()) {
                    pageData.value.winData.localRecording = true
                    pageData.value.allClientRecord = true
                } else {
                    pageData.value.winData.localRecording = false
                    pageData.value.allClientRecord = false
                }
            }

            // 如果是选中窗体改变通知，重新绑定预置点和巡航线
            if (stateType === 'CurrentSelectedWindow') {
                const $item = queryXml($('statenotify')[0].element)
                const winIndex = $item('winIndex').text().trim().num()
                cacheWinMap[winIndex] = { ...cloneWinData }

                let chlID = $item('chlId').text().trim()
                if (chlID === DEFAULT_EMPTY_ID) {
                    chlID = ''
                }

                if (pageData.value.playingList.includes(chlID)) {
                    cacheWinMap[winIndex].PLAY_STATUS = 'play'
                }

                cacheWinMap[winIndex].chlID = chlID
                cacheWinMap[winIndex].winIndex = $item('winIndex').text().trim().num()

                cacheWinMap[winIndex].isPolling = $item('isGroupPlay').text().bool()
                cacheWinMap[winIndex].isDwellPlay = $item('isDwellPlay').text().bool()
                let groupID = $item('groupId').text()
                if (groupID === DEFAULT_EMPTY_ID) {
                    groupID = ''
                }
                cacheWinMap[winIndex].groupID = groupID

                cacheWinMap[winIndex].localRecording = $item('recing').text().bool()
                cacheWinMap[winIndex].audio = $item('volumOn').text().bool()
                cacheWinMap[winIndex].talk = $item('ipcTalking').text().bool()
                cacheWinMap[winIndex].original = $item('isOriginalDisplayOn').text().bool()
                cacheWinMap[winIndex].magnify3D = $item('is3DMagnifyOn').text().bool()
                cacheWinMap[winIndex].supportAudio = $item('isSupportAudio').text().bool()

                const streamTypeNode = $item('streamType')
                cacheWinMap[winIndex].streamType = !streamTypeNode.length ? 2 : streamTypeNode.text().num()

                if ($item('isFocusView').text().bool()) {
                    clearTimeout(notifyTimer)
                    notifyTimer = setTimeout(() => {
                        pageData.value.winData = { ...cacheWinMap[winIndex] }
                    }, 100)
                }
            }

            // 通知分割屏数目
            if (stateType === 'CurrentFrameNum' || stateType === 'CurrentScreenMode') {
                pageData.value.split = $('statenotify').text().trim().num()
            }

            // 通知抓图结果
            if (stateType === 'TakePhoto') {
                if ($('statenotify/status').text() === 'success') {
                    if (import.meta.env.VITE_UI_TYPE !== 'UI1-E') {
                        if (!localStorage.getItem(LocalCacheKey.KEY_SNAP_PIC_NOT_ENCRYPTED)) {
                            openNotify(Translate('IDCS_IMG_UNENCRYPTED_TIP'))
                            localStorage.setItem(LocalCacheKey.KEY_SNAP_PIC_NOT_ENCRYPTED, 'true')
                        }
                    }
                    openNotify(Translate('IDCS_SNAP_SUCCESS_PATH') + $('statenotify/dir').text())
                } else {
                    const errorDescription = $('statenotify/errorDescription').text()
                    openNotify(Translate('IDCS_SNAP_FAIL') + errorDescription)
                }
            }

            // 通知手动录像结果
            if (stateType === 'RecComplete') {
                if ($('statenotify/status').text() === 'success') {
                    if (import.meta.env.VITE_UI_TYPE !== 'UI1-E') {
                        if (!localStorage.getItem(LocalCacheKey.KEY_LOCAL_AVI_NOT_ENCRYPTED)) {
                            openNotify(Translate('IDCS_AVI_UNENCRYPTED_TIP'))
                            localStorage.setItem(LocalCacheKey.KEY_LOCAL_AVI_NOT_ENCRYPTED, 'true')
                        }
                    }
                    openNotify(Translate('IDCS_REC_SUCCESS_PATH') + $('statenotify/dir').text())
                } else {
                    // 延迟100毫秒防止通知过快，导致之前操作状态未设置好
                    setTimeout(() => {
                        if (pageData.value.winData.localRecording) {
                            recordLocal(false)
                        }

                        const errorDescription = $('statenotify/errorDescription').text()
                        openNotify(Translate('IDCS_REC_FAIL') + errorDescription)
                    }, 100)
                }
            }

            // 对讲
            if (stateType === 'TalkSwitch') {
                if ($('statenotify/status').text() === 'success') {
                    if ($('statenotify/chlId').text() === pageData.value.winData.chlID) {
                        pageData.value.winData.talk = true
                    } else {
                        pageData.value.allTalk = true
                    }
                    // 打开对讲时，关闭音频
                    setAudio(false)
                } else {
                    const errorCode = $('statenotify/errorCode').text().num()
                    const errorCodes: Record<number, string> = {
                        [ErrorCode.USER_ERROR_DEVICE_BUSY]: Translate('IDCS_AUDIO_BUSY'),
                        [ErrorCode.USER_ERROR_CHANNEL_AUDIO_OPEN_FAIL]: Translate('IDCS_DEVICE_BUSY'),
                        4294967295: Translate('IDCS_REQUEST_TALKBACK_BREAK'),
                        [ErrorCode.USER_ERROR_NO_AUTH]: Translate('IDCS_NO_AUTH'),
                    }
                    const errorInfo = errorCodes[errorCode] || Translate('IDCS_REQUEST_TALKBACK_FAIL')
                    if (pageData.value.allTalk) {
                        pageData.value.allTalk = false
                    }

                    if (pageData.value.winData.talk) {
                        pageData.value.winData.talk = false
                    }
                    openNotify(errorInfo)
                }
            }
        }

        onBeforeUnmount(() => {
            layoutStore.liveLastSegNum = pageData.value.split
            layoutStore.liveLastChlList = [...pageData.value.playingList]

            stopPollingChlGroup()

            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                // 离开时切换为一分屏，防止safari上其余用到插件的地方出现多分屏
                {
                    const sendXML = OCX_XML_SetScreenMode(1)
                    plugin.ExecuteCmd(sendXML)
                }

                // 离开时关闭osd信息，防止pc其他带视频的地方显示两个通道名
                toggleOSD(false)
            }
        })

        return {
            mode,
            playerRef,
            fisheyeRef,
            pageData,
            handlePlayerReady,
            handlePlayerSelect,
            handlePlayerSuccess,
            handlePlayerStop,
            handlePlayerStatus,
            handlePlayerError,
            systemCaps,
            handlePlayerRecordFile,
            chlRef,
            toggleAllClientRecord,
            toggleAllRemoteRecord,
            toggleAllPreview,
            toggleAllTalk,
            toggleOSD,
            fullScreen,
            changeAllStreamType,
            changeFishEyeMode,
            updateSplit,
            updateSupportFishEye,
            userAuth,
            getChlMap,
            snap,
            closeImg,
            zoomIn,
            zoomOut,
            zoom3D,
            toggleTalk,
            playChl,
            displayOriginal,
            changeStreamType,
            recordLocal,
            recordRemote,
            setVolume,
            playChlGroup,
            playCustomView,
            setAudio,
            updateSupportAz,
            isSnapPanel,
            isFishEyePanel,
            notify,
        }
    },
})
