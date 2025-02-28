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
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const editRows = useWatchEditRows<ChannelMotionDto>()
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)

        let motionAlarmList: string[] = []

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
                            label: getTranslateForSecond(Number(item)),
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
                    rowData.disabled = false

                    if ($param('sensitivity').length) rowData.sensitivityMinValue = $param('sensitivity').attr('min').num()
                    if ($param('objectFilter/car').length) rowData.objectFilterCar = $param('objectFilter/car/switch').text().bool()
                    if ($param('objectFilter/person').length) rowData.objectFilterPerson = $param('objectFilter/person/switch').text().bool()
                    let max = $param('sensitivity').length ? $param('sensitivity').attr('max').num() : 100
                    if (import.meta.env.VITE_UI_TYPE === 'UI1-F' && max === 100) max = 120
                    rowData.sensitivityMaxValue = max
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

            tableData.value.forEach(async (item, i) => {
                if (item.chlType !== 'recorder') {
                    await getData(item.id)
                } else {
                    item.status = ''
                }

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                editRows.listen(item)

                if (i === 0) {
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                    formData.value = item
                }
            })
        }

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
                            <sensitivity min='${rowData.sensitivityMinValue}' max='${rowData.sensitivityMaxValue}'>${rowData.sensitivity}</sensitivity>
                            <holdTime unit='s'>${rowData.holdTime}</holdTime>
                            ${
                                rowData.supportSMD
                                    ? rawXml`
                                        <objectFilter>
                                            ${rowData.objectFilterCar ? `<car><switch>${rowData.objectFilterCar}</switch></car>` : ''}
                                            ${rowData.objectFilterPerson ? `<person><switch>${rowData.objectFilterPerson}</switch></person>` : ''}
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
            if (stateType === 'MotionArea') {
                const rowData = getRowById(selectedChlId.value)!
                rowData.areaInfo = $('statenotify/areaInfo/item').map((ele) => ele.text())
            }
        }

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

        /**
         * @description 切换播放通道
         */
        const play = () => {
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

        onMounted(() => {
            if (import.meta.env.VITE_UI_TYPE !== 'UI2-A') {
                alarmStatusTimer.repeat(true)
            }
            getDataList()
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx') {
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
        }
    },
})
