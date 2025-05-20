/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-10 16:03:56
 * @Description: 通道 - 移动侦测配置
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSessionStore = useUserSessionStore()
        const router = useRouter()

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelMotionDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelMotionDto[]>([])

        const pageData = ref({
            onlineChlList: [] as string[],
            holdTimeList: [5, 10, 20, 30, 60, 120].map((item) => {
                return {
                    label: item + Translate('IDCS_SECONDS'),
                    value: item,
                }
            }),
        })

        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const editRows = useWatchEditRows<ChannelMotionDto>()
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)

        let motionAlarmList: string[] = []
        let webSocket: ReturnType<typeof WebsocketMotion>

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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
        let drawer = CanvasMotion()

        const REFRESH_INTERVAL = 3000
        const alarmStatusTimer = useRefreshTimer(() => {
            getAlarmStatus()
        }, REFRESH_INTERVAL)

        const chlOptions = computed(() => {
            return tableData.value.map((item) => {
                return {
                    value: item.id,
                    label: item.name,
                }
            })
        })

        const holdTimeList = ref<SelectOption<number, string>[]>([])

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = rowData
            tableRef.value!.setCurrentRow(rowData)
        }

        const handleRowClick = (rowData: ChannelMotionDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleDisposeWayClick = () => {
            if (!userSessionStore.hasAuth('alarmMgr')) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
                return
            }

            router.push({
                path: '/config/alarm/motion',
            })
        }

        const handleChangeAll = (type: 'switch' | 'holdTime', val: boolean | number) => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    if (type === 'switch') {
                        ele.switch = val as boolean
                    } else {
                        ele.holdTime = val as number
                    }
                }
            })
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        /**
         * @description 获取通道移动侦测配置
         * @param {string} chlId
         */
        const getData = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            try {
                const res = await queryMotion(sendXml)
                const $ = queryXml(res)
                const rowData = getRowById(chlId)
                if (!rowData) {
                    return
                }

                const $param = queryXml($('content/chl/param')[0].element)

                rowData.isOnvifChl = !$param('holdTimeNote').length
                if (!holdTimeList.value.length && !rowData.isOnvifChl) {
                    holdTimeList.value = [5, 10, 20, 30, 60, 120].map((item) => {
                        return {
                            label: item + Translate('IDCS_SECONDS'),
                            value: item,
                        }
                    })
                }

                if ($('status').text() === 'success') {
                    const areaInfo = $param('area/item').map((ele) => ele.text().trim())

                    if (rowData.isOnvifChl) {
                        rowData.holdTime = 0
                    } else {
                        rowData.holdTime = $param('holdTime').text().num()
                    }

                    rowData.holdTimeList = getAlarmHoldTimeList($param('holdTimeNote').text(), $param('holdTime').text().num())
                    rowData.switch = $param('switch').text().bool()
                    rowData.sensitivity = $param('sensitivity').text().num()

                    rowData.status = ''
                    rowData.disabled = !pageData.value.onlineChlList.includes(chlId)
                    rowData.sensitivityMin = $param('sensitivity').attr('min').num() || 0
                    rowData.sensitivityMax = $param('sensitivity').attr('max').num() || 100
                    //UI1-F 泰科最大值根据传过来的值判断，100的转成120,其他的不变  确认人：曹兆  CS-214
                    if (import.meta.env.VITE_UI_TYPE === 'UI1-F' && rowData.sensitivityMax === 100) {
                        rowData.sensitivityMax = 120
                    }

                    rowData.SMDVehicle = $param('objectFilter/car/switch').text().bool()
                    rowData.SMDVehicleDisabled = !$param('objectFilter/car/switch').length
                    rowData.SMDHuman = $param('objectFilter/person/switch').text().bool()
                    rowData.SMDHumanDisabled = !$param('objectFilter/person').length
                    rowData.column = $param('area/itemType').attr('maxLen').num()
                    rowData.row = $param('area').attr('count').num()
                    rowData.areaInfo = areaInfo
                } else {
                    rowData.status = ''
                }
            } catch {
                const rowData = getRowById(chlId)
                if (!rowData) {
                    return
                }
                rowData.status = ''
            }
        }

        /**
         * @description 获取数据列表
         */
        const getDataList = async () => {
            editRows.clear()
            openLoading()

            const result = await getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportMotion: true,
                requireField: ['supportSMD'],
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                holdTimeList.value = []
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const newData = new ChannelMotionDto()
                    newData.id = ele.attr('id')
                    newData.name = $item('name').text()
                    newData.chlIndex = $item('chlIndex').text()
                    newData.chlType = $item('chlType').text()
                    newData.status = 'loading'
                    newData.supportSMD = $item('supportSMD').text().bool()

                    return newData
                })
                pageTotal.value = $('content').attr('total').num()
            } else {
                tableData.value = []
            }

            let onlineChlId = ''

            tableData.value.forEach(async (item) => {
                if (!onlineChlId && pageData.value.onlineChlList.includes(item.id)) {
                    onlineChlId = item.id
                }

                if (item.chlType !== 'recorder') {
                    await getData(item.id)
                } else {
                    item.status = ''
                }

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                editRows.listen(item)

                if (item.id === onlineChlId) {
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                    formData.value = item
                }
            })
        }

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
        }

        /**
         * @description 获取移动侦测报警状态
         */
        const getAlarmStatus = () => {
            if (selectedChlId.value) {
                queryAlarmStatus().then((res) => {
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        motionAlarmList = $('content/motions/item').map((ele) => {
                            return queryXml(ele.element)('sourceChl').attr('id')
                        })
                        alarmStatusTimer.repeat()
                    }
                })
            } else {
                alarmStatusTimer.repeat()
            }
        }

        const showNote = computed(() => {
            return motionAlarmList.includes(selectedChlId.value)
        })

        const getSaveData = (rowData: ChannelMotionDto) => {
            return rawXml`
                <content>
                    <chl id='${rowData.id}'>
                        <param>
                            <switch>${rowData.switch}</switch>
                            <sensitivity min='${rowData.sensitivityMin}' max='${rowData.sensitivityMax}'>${rowData.sensitivity}</sensitivity>
                            <holdTime unit='s'>${rowData.holdTime}</holdTime>
                            ${
                                rowData.supportSMD
                                    ? rawXml`
                                        <objectFilter>
                                            ${!rowData.SMDVehicleDisabled ? `<car><switch>${rowData.SMDVehicle}</switch></car>` : ''}
                                            ${!rowData.SMDHumanDisabled ? `<person><switch>${rowData.SMDHuman}</switch></person>` : ''}
                                        </objectFilter>
                                    `
                                    : ''
                            }
                            <area type='list' count='${rowData.row}'>
                                <itemType minLen='${rowData.column}' maxLen='${rowData.column}'/>
                                ${rowData.areaInfo.map((ele) => `<item>${ele}</item>`).join('')}
                            </area>
                        </param>
                    </chl>
                </content>
            `
        }

        /**
         * @description 提交数据
         */
        const save = async () => {
            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))

            for (const ele of editRows.toArray()) {
                try {
                    const res = await editMotion(getSaveData(ele))
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        ele.status = 'success'
                        editRows.remove(ele)
                    } else {
                        const errorCode = $('errorCode').text().num()
                        ele.status = 'error'
                        ele.statusTip = errorCode === ErrorCode.USER_ERROR_NO_AUTH ? Translate('IDCS_NO_PERMISSION') : ''
                    }
                } catch {
                    ele.status = 'error'
                }
            }

            closeLoading()
        }

        const notify = ($: XMLQuery, stateType: string) => {
            if (stateType === 'StartViewChl') {
                const status = $('statenotify/status').text()
                if (status === 'success') {
                    // 通道获取视频流成功后再下发请求motion流指令
                    const sendXML = OCX_XML_SetDynamicMotion(true)
                    plugin.ExecuteCmd(sendXML)
                }
            }

            if (stateType === 'MotionArea') {
                const rowData = getRowById(selectedChlId.value)!
                rowData.areaInfo = $('statenotify/areaInfo/item').map((ele) => ele.text())
            }
        }

        /**
         * @description 全选区域
         */
        const handleSelAll = () => {
            const rowData = getRowById(selectedChlId.value)!

            if (rowData.disabled) return

            if (mode.value === 'h5') {
                drawer.selectAll()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMotionAreaAction('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            motionAreaChange()
        }

        /**
         * @description 反选区域
         */
        const handleSelReverse = () => {
            if (mode.value === 'h5') {
                drawer.reverse()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMotionAreaAction('INVERSE')
                plugin.ExecuteCmd(sendXML)
            }

            motionAreaChange()
        }

        /**
         * @description 清除区域
         */
        const handleClear = () => {
            if (mode.value === 'h5') {
                drawer.clear()
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetMotionAreaAction('NONE')
                plugin.ExecuteCmd(sendXML)
            }

            motionAreaChange()
        }

        /**
         * @description 更新移动侦测区域数据
         * @param {string[][]} netArr
         */
        const motionAreaChange = (netArr?: string[][]) => {
            const rowData = getRowById(selectedChlId.value)!
            const areaInfo: string[] = (rowData.areaInfo = [])
            if (mode.value === 'h5') {
                const arr = netArr || drawer.getArea()
                arr.forEach((ele) => {
                    areaInfo.push(ele.join(''))
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_GetMotionArea()
                plugin.AsynQueryInfo(sendXML, (result) => {
                    const $ = queryXml(XMLStr2XMLDoc(result))
                    $('response/areaInfo/item').forEach((ele) => {
                        areaInfo.push(ele.text())
                    })
                })
            }
        }

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasMotion({
                    el: player.getDrawbordCanvas(),
                    onchange: motionAreaChange,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const onPlayerSuccess = (_winIndex: number, item: TVTPlayerWinDataListItem) => {
            webSocket && webSocket.destroy()
            if (item.CHANNEL_INFO?.chlID) {
                webSocket = WebsocketMotion({
                    config: {
                        chlID: item.CHANNEL_INFO.chlID,
                        streamType: 33,
                        audio: false,
                    },
                    onmotion(data) {
                        player.setMotion(data, 0)
                    },
                })
            }
        }

        let drawerTime: NodeJS.Timeout | number = 0

        const onPlayerMotion = (motion: WebsocketMotionDto) => {
            clearTimeout(drawerTime)
            drawer.setMotion(motion)
            drawerTime = setTimeout(() => {
                drawer && drawer.clearRedArea()
            }, 1e3)
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            clearTimeout(drawerTime)
            drawer && drawer.clearRedArea()

            if (!selectedChlId.value) return

            const rowData = getRowById(selectedChlId.value)!

            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(rowData.id, rowData.name)
            }

            if (rowData.column) {
                const motion = {
                    column: rowData.column,
                    row: rowData.row,
                    areaInfo: rowData.areaInfo,
                }

                if (mode.value === 'h5') {
                    drawer.setOption(motion)
                }

                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetMotionArea(motion)
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(selectedChlId, () => {
            play()
        })

        onMounted(async () => {
            if (import.meta.env.VITE_UI_TYPE !== 'UI2-A') {
                alarmStatusTimer.repeat(true)
            }
            await getOnlineChlList()
            getDataList()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                plugin.ExecuteCmd(OCX_XML_SetDynamicMotion(false))

                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            playerRef,
            notify,
            formData,
            tableRef,
            tableData,
            chlOptions,
            editRows,
            pageIndex,
            pageSize,
            pageTotal,
            selectedChlId,
            holdTimeList,
            showNote,
            handleRowClick,
            handleChlSel,
            handleDisposeWayClick,
            handleChangeAll,
            save,
            onReady,
            handleSelAll,
            handleSelReverse,
            handleClear,
            switchOptions,
            getDataList,
            onPlayerSuccess,
            onPlayerMotion,
        }
    },
})
