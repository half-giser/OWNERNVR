/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 18:07:29
 * @Description: 现场预览
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:22:03
 */
import { cloneDeep } from 'lodash-es'
import { type LiveChannelList, type LiveCustomViewChlList, LiveSharedWinData } from '@/types/apiType/live'
import { type TVTPlayerWinDataListItem, type TVTPlayerPosInfoItem } from '@/utils/wasmPlayer/tvtPlayer'
import WebsocketState from '@/utils/websocket/websocketState'
import { APP_TYPE } from '@/utils/constants'
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
    let ws: WebsocketState | null = null

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

    /**
     * @description 订阅状态
     */
    const createStateSubscribe = () => {
        ws = new WebsocketState({
            config: {
                channel_state_info: true,
                alarm_state_info: userSession.hasAuth('alarmMgr'),
            },
            onmessage(data: any) {
                handleChlState(data.channel_state_info)
                handleAlarmInfo(data.alarm_state_info)
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
                handleRecordStatus(chlId, tempRecordTypes, isRecording)
                if (findChlIndex === -1) {
                    chlOnlineList.push(chlId)
                }
            } else {
                if (findChlIndex > -1) {
                    chlOnlineList.splice(findChlIndex, 1)
                }
            }
        })
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
    const handleAlarmInfo = (alarmInfo?: AlarmState[]) => {
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
                playerRef.value?.player.setAlarmStatus(chlId, alarmType, isAlarming)
                // 缓存每个通道报警状态
                if (!alarmStatusMap.value[chlId]) {
                    alarmStatusMap.value[chlId] = {}
                }
                alarmStatusMap.value[chlId][alarmType] = isAlarming
            }
        })
    }

    /**
     * @description 根据通道录像状态更新录像osd
     * @param {string} chlId
     * @param {Array} recordTypes
     * @param {Boolean} isRecording
     */
    const handleRecordStatus = (chlId: string, recordTypes: string[], isRecording: boolean) => {
        playerRef.value?.player.setRecordStatus(chlId, recordTypes, isRecording)
        recordStatusMap.value[chlId] = {
            type: recordTypes,
            isRecording,
        }
        handleManualRecBtnStatus(chlId, recordTypes, isRecording)
    }

    /**
     * @description 更新手动录像操作按钮的状态
     * @param {string} chlId
     * @param {Array} recordTypes
     * @param {Boolean} isRecording
     */
    const handleManualRecBtnStatus = (chlId: string, recordTypes: string[], isRecording: boolean) => {
        const currentRemoteRecBtnStatus = isRecording && recordTypes.length > 0 && recordTypes.includes('manual')
        recordCallback(chlId, currentRemoteRecBtnStatus)

        const resultArr: string[] = []
        Object.entries(recordStatusMap.value).forEach(([chlId, item]) => {
            if (item.type.includes('manual') && item.isRecording) {
                resultArr.push(chlId)
            }
        })
        const isActiveRemoteRecBtn = false // 底部菜单.IsActiveAllRemoteRec()
        if (isActiveRemoteRecBtn && resultArr.length) {
            return
        }
        const onlineChlCount = (chlRef.value?.getOnlineChlList() || []).length
        const allRemoteRecBtnStatus = !!resultArr.length && onlineChlCount === resultArr.length
        recordRemoteCallback(allRemoteRecBtnStatus)
    }

    onMounted(() => {
        createStateSubscribe()
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
        recType.value = $('//content/recMode/mode').text()
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

/**
 * @description 是否显示POS信息
 */
const usePos = (mode: Ref<string>) => {
    const posInfo: Record<string, TVTPlayerPosInfoItem> = {}

    /**
     * @description 获取POS数据列表
     */
    const getData = async () => {
        const result = await queryPosList()
        const $ = queryXml(result)
        if ($('//status').text() !== 'success') return
        const $systemX = $('//content/itemType/coordinateSystem/X')
        const $systemY = $('//content/itemType/coordinateSystem/Y')
        const width = Number($systemX.attr('max')) - Number($systemX.attr('min'))
        const height = Number($systemY.attr('max')) - Number($systemY.attr('min'))

        $('//channel/chl').forEach((ele) => {
            const chlId = ele.attr('id') as string
            const $ele = queryXml(ele.element)
            const previewDisplay = $ele('previewDisplay').text() === 'true'
            const printMode = $ele('printMode').text()
            posInfo[chlId] = {
                previewDisplay: previewDisplay, // 现场预览是否显示pos
                printMode: printMode as 'page' | 'scroll', // pos显示模式：page翻页/scroll滚屏
                displayPosition: {
                    // pos显示区域
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                },
                timeout: 10, // pos超时隐藏时间，默认10秒
            }
        })
        $('//content/item').forEach((ele) => {
            const $ele = queryXml(ele.element)
            const $position = `param/displaySetting/displayPosition/`
            const $triggerChls = $ele('trigger/triggerChl/chls/item')
            const timeout = $ele('param/displaySetting/common/timeOut').text()
            if ($triggerChls.length === 0) return
            const displayPosition = {
                x: Number($ele(`${$position}X`).text()),
                y: Number($ele(`${$position}Y`).text()),
                width: Number($ele(`${$position}width`).text()),
                height: Number($ele(`${$position}height`).text()),
            }
            $triggerChls.forEach((item) => {
                const chlId = item.attr('id')!
                if (posInfo[chlId]) {
                    posInfo[chlId].displayPosition = displayPosition
                    posInfo[chlId].timeout = Number(timeout)
                }
            })
        })
    }

    /**
     * @description 查询通道的POS信息
     * @param {string} chlId
     */
    const getPosInfo = (chlId: string) => {
        if (posInfo[chlId]) {
            return posInfo[chlId]
        }
        return {
            previewDisplay: false,
            printMode: 'page',
            timeout: 10,
            displayPosition: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }
    }

    /**
     * @description 生成OCX命令
     * @param {Boolean} bool
     * @param {String} chlId
     * @param {Number} winIndex
     */
    const getCmd = (bool: boolean, chlId: string, winIndex: number) => {
        const pos = getPosInfo(chlId)
        if (pos.previewDisplay) {
            const area = pos.displayPosition
            return OCX_XML_SetPOSDisplayArea(bool, winIndex, area.x, area.y, area.width, area.height, pos.printMode)
        } else {
            return OCX_XML_SetPOSDisplayArea(false, winIndex, 0, 0, 0, 0)
        }
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

    return getCmd
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
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const layoutStore = useLayoutStore()
        const pluginStore = usePluginStore()
        const theme = getUiAndTheme()

        const playerRef = ref<PlayerInstance>()
        const chlRef = ref<ChannelPanelExpose>()
        const fisheyeRef = ref<FishEyePanelExpose>()

        const cloneWinData = new LiveSharedWinData()
        // OCX 记录窗口和通道的映射
        const cacheWinMap = Array(36)
            .fill(null)
            .map(() => ({ ...cloneWinData }))

        const pageData = ref({
            // 通知数据
            notification: [] as string[],
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
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
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
        const pos = usePos(mode)

        // 抓拍视图是否显示
        const isSnapPanel = computed(() => {
            if (mode.value === 'h5') {
                return true
            }
            if (mode.value === 'ocx' && APP_TYPE === 'STANDARD') {
                return true
            }
            return false
        })

        // 鱼眼视图是否显示
        const isFishEyePanel = computed(() => {
            return mode.value === 'ocx' && APP_TYPE === 'STANDARD'
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器准备就绪回调
         */
        const handlePlayerReady = async () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }

                if (theme.name === 'UI1-E') {
                    player.getChlIp()
                }
            }
            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }

                if (APP_TYPE === 'STANDARD' && isHttpsLogin()) {
                    // 本地https访问时，提示不支持目标检测（依赖websocket与设备端的通信，仅支持http）
                    pageData.value.notification = [formatHttpsTips(Translate('IDCS_TARGET_DETECTION'))]
                }

                const productModel = await getDeviceInfo()
                plugin.VideoPluginNotifyEmitter.addListener(notify)

                {
                    const sendXML = OCX_XML_SetPluginModel('Interactive', 'Live')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }

                {
                    const sendXML = OCX_XML_SetProperty({
                        calendarType: userSession.calendarType,
                        supportRecStatus: true,
                        supportImageRotate: systemCaps.supportImageRotate,
                        showVideoLossMessage: systemCaps.showVideoLossMessage,
                        productModel: productModel,
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    // 视频预览默认铺满显示，设置走廊模式旋转时，需要选择“原始比例”显示
                    if (systemCaps.supportOriginalDisplay) {
                        pageData.value.winData.original = true
                    }
                }
            }
        }

        /**
         * @description 获取产品型号
         */
        const getDeviceInfo = async () => {
            const result = await queryBasicCfg(getXmlWrapData(''))
            return queryXml(result)('//content/productModel').text()
        }

        /**
         * @description 更新播放器回调的页面窗口状态
         * @param {number} index
         * @param {Object} winData
         */
        const updateWinData = (index: number, winData: TVTPlayerWinDataListItem) => {
            if (playerRef.value && index === playerRef.value.player.getSelectedWinIndex()) {
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
                    if (layoutStore.liveLastChlList.length > 0) {
                        const curerntOnlineList = chlRef.value?.getOnlineChlList() || []
                        const onlineList = layoutStore.liveLastChlList.filter((item) => {
                            return curerntOnlineList.includes(item)
                        })
                        setTimeout(() => {
                            playChls(onlineList)
                        }, 100)
                    } else {
                        setTimeout(() => {
                            playSplitVideo(1)
                        }, 100)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetScreenMode(segNum, type)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                chlList.forEach((chlID, index) => {
                    {
                        const sendXML = OCX_XML_SelectScreen(index)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                    {
                        const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                stopPollingChlGroup(winIndex)

                // 当前点击的通道与正在选中播放的窗口相同
                if (chlID === pageData.value.winData.chlID) {
                    return
                }

                // 点击的通道正处于播放状态
                if (pageData.value.playingList.includes(chlID)) {
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
            } else if (mode.value === 'ocx') {
                const currentChlID = pageData.value.winData.chlID
                const currentChlWinIndex = pageData.value.winData.winIndex

                stopPollingChlGroup(currentChlWinIndex)

                // 当前点击的通道与正在选中播放的窗口相同
                if (chlID === pageData.value.winData.chlID) {
                    return
                }

                // 点击的通道正处于播放状态
                if (pageData.value.playingList.includes(chlID)) {
                    const find = cacheWinMap.find((item) => item.chlID === chlID && !item.isPolling)
                    if (find) {
                        const findIndex = find.winIndex
                        {
                            const sendXML = OCX_XML_SelectScreen(findIndex)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                        {
                            const sendXML = OCX_XML_SetViewChannelID(currentChlID, pageData.value.chlMap[currentChlID].value)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                        {
                            const sendXML = OCX_XML_SelectScreen(currentChlWinIndex)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                        {
                            const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                            plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                        }
                    }

                    return
                }

                const sendXML = OCX_XML_SetViewChannelID(chlID, pageData.value.chlMap[chlID].value)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                    if (playerRef.value) {
                        playerRef.value.player.play({
                            chlID: chl.id,
                            winIndex,
                            streamType: 2,
                            isSelect: false,
                            callback: () => startPollingChlGroup,
                            audioStatus: false,
                            isPolling: true,
                            volume: pageData.value.volume,
                        })
                        playerRef.value.player.screen.setPollIndex(winIndex)
                    }
                    chlGroupTimer[winIndex] = setTimeout(() => {
                        currentIndex++
                        startPollingChlGroup()
                    }, dwellTime * 1000)
                }

                startPollingChlGroup()
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_CallChlGroup(chlList, groupId, dwellTime)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                let sendXML = ''
                if (index === -1) {
                    sendXML = OCX_XML_StopPreview('ALL')
                } else if (index === pageData.value.winData.winIndex) {
                    sendXML = OCX_XML_StopPreview('CURRENT')
                } else {
                    sendXML = OCX_XML_StopPreview(index)
                }
                plugin?.GetVideoPlugin()?.ExecuteCmd(sendXML)
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

            pageData.value.split = segNum
            if (mode.value === 'h5') {
                player.setSplit(segNum)
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetScreenMode(segNum, segNum === 10 ? 2 : 1)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }

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

            if (!pageData.value.playingList.includes(chlId)) {
                pageData.value.playingList.push(chlId)
            }

            const alaramStatus = stateSubscribe.alarmStatusMap.value[chlId]
            if (alaramStatus) {
                Object.entries(alaramStatus).forEach(([type, bool]) => {
                    playerRef.value!.player.setAlarmStatus(chlId, type, bool)
                })
            }

            const recordStatus = stateSubscribe.recordStatusMap.value[chlId]
            if (recordStatus) {
                playerRef.value!.player.setRecordStatus(chlId, recordStatus.type, recordStatus.isRecording)
            }
        }

        // UI1-D UI1-G 选择高画质登录
        if (['UI1-D', 'UI1-G'].includes(theme.name) && userSession.defaultStreamType === 'main') {
            const stopFirstLoadStream = watchEffect(() => {
                if (pageData.value.split === 1 && pageData.value.playingList.length) {
                    changeStreamType(1)
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
            const chlId = data.CHANNEL_INFO!.chlID

            updateWinData(index, data)

            const findIndex = pageData.value.playingList.indexOf(chlId)
            if (findIndex > -1) {
                pageData.value.playingList.splice(findIndex, 1)
            }
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
            if (type) {
                data.forEach((item) => {
                    const chlId = item.CHANNEL_INFO!.chlID
                    if (!pageData.value.playingList.includes(chlId)) {
                        pageData.value.playingList.push(chlId)
                    }
                })
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
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_AUDIO_NOT_SUPPORT'),
                })
                pageData.value.winData.supportAudio = false
                pageData.value.winData.audio = false
            }
            // 当前用户打开无音频的权限
            else if (error === 'noPermission') {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_PERMISSION'),
                })
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
            const date = formatDate(new Date(recordStartTime), 'YYYYMMDDHHmmss')
            download(new Blob([recordBuf]), `${chlName}_${date}.avi`)
            if (!localStorage.localAviNotEncrypted) {
                pageData.value.notification.push(Translate('IDCS_AVI_UNENCRYPTED_TIP'))
                localStorage.localAviNotEncrypted = 'true'
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
            } else if (mode.value === 'ocx') {
                pageData.value.winData.localRecording = bool
                const sendXML = OCX_XML_AllRecSwitch(bool ? 'ON' : 'OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else {
                if (bool) {
                    // TODO
                } else {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    // TODO
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
                    setAudio(false)
                }
                const sendXML = OCX_XML_TalkSwitch(bool ? 'ON' : 'OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_OSDSwitch(bool ? 'ON' : 'OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_FullScreen()
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            if (pageData.value.split === split) {
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
                if (!localStorage.getItem('snapPicNotEncrypted')) {
                    pageData.value.notification.push(Translate('IDCS_IMG_UNENCRYPTED_TIP'))
                    localStorage.setItem('snapPicNotEncrypted', 'true')
                }
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_TakePhotoByWinIndex(pageData.value.winData.winIndex)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
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
                player.zoomOut(player.getSelectedWinIndex())
            } else if (mode.value === 'ocx') {
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)

                const sendXML = OCX_XML_MagnifyImg()
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                player.zoomIn(player.getSelectedWinIndex())
            } else if (mode.value === 'ocx') {
                fisheyeRef.value?.exitAdjust(pageData.value.winData.chlID)

                const sendXML = OCX_XML_MinifyImg()
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_OriginalDisplaySwitch(pageData.value.winData.winIndex, bool.toString() as 'true' | 'false')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_3DSwitch(bool)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                if (streamType === 1) {
                    openLoading(LoadingTarget.FullScreen)

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
                    const content = $('//content/item')

                    let mainResolution = ''
                    if (content.length > 0) {
                        const $el = queryXml(content[0].element)
                        if (recType.value) {
                            mainResolution = recType.value === 'auto' ? $el('ae').attr('res')! : $el('an').attr('res')!
                        }
                    }
                    const sendXML = OCX_XML_SetStreamType(pageData.value.winData.winIndex, streamType, mainResolution.replace(/[x|X|*]/g, 'x'))
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)

                    closeLoading(LoadingTarget.FullScreen)
                } else {
                    const sendXML = OCX_XML_SetStreamType(pageData.value.winData.winIndex, streamType)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_RecSwitch(bool ? 'ON' : 'OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetVolume(volume)
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            } else if (mode.value === 'ocx') {
                if (userAuth.value.audio[pageData.value.winData.chlID] === false) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NO_PERMISSION'),
                    })
                    return
                }
                if (bool) {
                    const sendXML = OCX_XML_SetVolume(0)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    const sendXML = OCX_XML_SetVolume(pageData.value.volume)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                    setAudio(false)
                }
                const sendXML = OCX_XML_TalkSwitch(bool ? 'ON' : 'OFF')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
        const notify = ($: XMLQuery) => {
            // 设置预览通道状态
            if ($('statenotify[@type="StartViewChl"]').length) {
                const status = $("statenotify[@type='StartViewChl']/status").text()
                const chlId = $("statenotify[@type='StartViewChl']/chlId").text()
                const winIndex = Number($("statenotify[@type='StartViewChl']/winIndex").text())
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
                        plugin.GetVideoPlugin().ExecuteCmd(pos(true, chlId, winIndex))
                        break
                    case 'offline':
                        // pageData.value.notification.push(Translate("IDCS_NODE_NOT_ONLINE"))
                        break
                    case 'busy':
                        pageData.value.notification.push(Translate('IDCS_DEVICE_BUSY'))
                        break
                    case 'noRight':
                        pageData.value.notification.push(Translate('IDCS_CHL_NO_PLAY_REC_AUTH'))
                        break
                }
            }
            // 设置停止预览通道状态
            else if ($('statenotify[@type="StopViewChl"]').length) {
                const chlId = $('statenotify[@type="StopViewChl"]/chlId').text()
                const winIndex = Number($('statenotify[@type="StopViewChl"]/winIndex').text())

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
            else if ($('statenotify[@type="SetViewChannelId"]').length) {
                if ($('statenotify[@type="SetViewChannelId"]/status').text() !== 'success') {
                    const errorCode = Number($('statenotify[@type="SetViewChannelId"]/errorCode').text())
                    // 主码流预览失败超过上限，切换回子码流预览
                    if (errorCode == ErrorCode.USER_ERROR_CHANNEL_NO_OPEN_VIDEO) {
                        changeStreamType(2)
                        pageData.value.notification.push(Translate('IDCS_OPEN_STREAM_FAIL'))
                    }
                }
            }
            // 窗口状态改变通知
            else if ($('statenotify[@type="WindowStatus"]').length) {
                if (Number($('statenotify[@type="WindowStatus"]/previewingWinNum').text())) {
                    pageData.value.allPreview = false
                    pageData.value.winData.PLAY_STATUS = 'stop'
                } else {
                    pageData.value.allPreview = true
                }
                if (Number($('statenotify[@type="WindowStatus"]/recordingWinNum').text())) {
                    pageData.value.winData.localRecording = true
                    pageData.value.allClientRecord = true
                } else {
                    pageData.value.winData.localRecording = false
                    pageData.value.allClientRecord = false
                }
            }
            // 如果是选中窗体改变通知，重新绑定预置点和巡航线
            else if ($('statenotify[@type="CurrentSelectedWindow"]').length) {
                const $item = queryXml($("statenotify[@type='CurrentSelectedWindow']")[0].element)
                const winIndex = Number($item('winIndex').text().trim())
                cacheWinMap[winIndex] = { ...cloneWinData }

                let chlID = $item('chlId').text().trim()
                if (chlID === '{00000000-0000-0000-0000-000000000000}') {
                    chlID = ''
                }

                if (pageData.value.playingList.includes(chlID)) {
                    cacheWinMap[winIndex].PLAY_STATUS = 'play'
                }

                cacheWinMap[winIndex].chlID = chlID
                cacheWinMap[winIndex].winIndex = Number($item('winIndex').text().trim())

                cacheWinMap[winIndex].isPolling = $item('isGroupPlay').text().toBoolean()
                cacheWinMap[winIndex].isDwellPlay = $item('isDwellPlay').text().toBoolean()
                let groupID = $item('groupId').text()
                if (groupID === '{00000000-0000-0000-0000-000000000000}') {
                    groupID = ''
                }
                cacheWinMap[winIndex].groupID = groupID

                cacheWinMap[winIndex].localRecording = $item('recing').text().toBoolean()
                cacheWinMap[winIndex].audio = $item('volumOn').text().toBoolean()
                cacheWinMap[winIndex].talk = $item('ipcTalking').text().toBoolean()
                cacheWinMap[winIndex].original = $item('isOriginalDisplayOn').text().toBoolean()
                cacheWinMap[winIndex].magnify3D = $item('is3DMagnifyOn').text().toBoolean()
                cacheWinMap[winIndex].supportAudio = $item('isSupportAudio').text().toBoolean()

                const streamTypeNode = $item('streamType')
                cacheWinMap[winIndex].streamType = !streamTypeNode.length ? 2 : Number(streamTypeNode.text())

                if ($item('isFocusView').text().toBoolean()) {
                    clearTimeout(notifyTimer)
                    notifyTimer = setTimeout(() => {
                        pageData.value.winData = { ...cacheWinMap[winIndex] }
                    }, 100)
                }
            }
            // 通知分割屏数目
            else if ($('statenotify[@type="CurrentFrameNum"]').length || $('statenotify[@type="CurrentScreenMode"]').length) {
                pageData.value.split = Number($('statenotify').text().trim())
            }
            // 通知抓图结果
            else if ($('statenotify[@type="TakePhoto"]').length) {
                if ($('statenotify[@type="TakePhoto"]/status').text() === 'success') {
                    if (!window.localStorage.getItem('snapPicNotEncrypted')) {
                        pageData.value.notification.push(Translate('IDCS_IMG_UNENCRYPTED_TIP'))
                        window.localStorage.setItem('snapPicNotEncrypted', 'true')
                    }
                    pageData.value.notification.push(Translate('IDCS_SNAP_SUCCESS_PATH') + $('statenotify[@type="TakePhoto"]/dir').text())
                } else {
                    const errorDescription = $('statenotify[@type="TakePhoto"]/errorDescription').text()
                    pageData.value.notification.push(Translate('IDCS_SNAP_FAIL') + (errorDescription ? errorDescription : ''))
                }
            }
            // 通知手动录像结果
            else if ($('statenotify[@type="RecComplete"]').length) {
                if ($('statenotify[@type="RecComplete"]/status').text() == 'success') {
                    if (!window.localStorage.getItem('localAviNotEncrypted')) {
                        pageData.value.notification.push(Translate('IDCS_AVI_UNENCRYPTED_TIP'))
                        window.localStorage.setItem('localAviNotEncrypted', 'true')
                    }
                    pageData.value.notification.push(Translate('IDCS_REC_SUCCESS_PATH') + $('statenotify[@type="RecComplete"]/dir').text())
                } else {
                    // 延迟100毫秒防止通知过快，导致之前操作状态未设置好
                    setTimeout(function () {
                        if (pageData.value.winData.localRecording) {
                            recordLocal(false)
                        }

                        const errorDescription = $('statenotify[@type="RecComplete"]/errorDescription').text()
                        pageData.value.notification.push(Translate('IDCS_REC_FAIL') + (errorDescription ? errorDescription : ''))
                    }, 100)
                }
            }
            // 对讲
            else if ($('statenotify[@type="TalkSwitch"]').length) {
                if ($('statenotify[@type="TalkSwitch"]/status').text() == 'success') {
                    if ($('statenotify[@type="TalkSwitch"]/chlId').text() == pageData.value.winData.chlID) {
                        pageData.value.winData.talk = true
                    } else {
                        pageData.value.allTalk = true
                    }
                    setAudio(false)
                } else {
                    const errorCode = Number($('statenotify[@type="TalkSwitch"]/errorCode').text())
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
                    pageData.value.notification.push(errorInfo)
                }
            }
        }

        onBeforeUnmount(() => {
            layoutStore.liveLastSegNum = pageData.value.split
            layoutStore.liveLastChlList = [...pageData.value.playingList]

            stopPollingChlGroup()

            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                // 离开时切换为一分屏，防止safari上其余用到插件的地方出现多分屏
                {
                    const sendXML = OCX_XML_SetScreenMode(1)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }

                plugin.VideoPluginNotifyEmitter.removeListener(notify)
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
            LiveChannelPanel,
            LiveScreenPanel,
            LiveControlPanel,
            LiveAsidePanel,
            LiveLensPanel,
            LivePtzPanel,
            LiveSnapPanel,
            LiveFishEyePanel,
        }
    },
})
