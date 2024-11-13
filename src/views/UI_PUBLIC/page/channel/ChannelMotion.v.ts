/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-10 16:03:56
 * @Description: 通道 - 移动侦测配置
 */
import { ChannelMotionDto } from '@/types/apiType/channel'
import CanvasMotion from '@/utils/canvas/canvasMotion'
import { type XMLQuery } from '@/utils/xmlParse'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const userSessionStore = useUserSessionStore()
        const router = useRouter()
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelMotionDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref([] as ChannelMotionDto[])
        const btnOKDisabled = ref(true)
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const editRows = new Set<ChannelMotionDto>()
        const switchOptions = getBoolSwitchOptions()
        let motionDrawer: CanvasMotion
        let motionAlarmList: string[] = []

        const REFRESH_INTERVAL = 3000
        const alarmStatusTimer = useRefreshTimer(() => {
            getAlarmStatus()
        }, REFRESH_INTERVAL)

        const holdTimeList = ref<string[]>([])

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
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
                return
            }
            router.push({
                path: '/config/alarm/motion',
            })
        }

        const handleChangeVal = () => {
            const rowData = getRowById(selectedChlId.value)!
            editRows.add(rowData)
            btnOKDisabled.value = false
        }

        const handleChangeAll = (type: 'switch' | 'holdTime', val: boolean | string) => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    if (type === 'switch') {
                        ele.switch = val as boolean
                    } else {
                        ele.holdTime = val as string
                    }
                    btnOKDisabled.value = false
                    editRows.add(ele)
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

                rowData.isOnvifChl = !$('content/chl/param/holdTimeNote').length
                if (!holdTimeList.value.length && !rowData.isOnvifChl) {
                    holdTimeList.value = ['5', '10', '20', '30', '60', '120']
                }

                if ($('status').text() === 'success') {
                    const areaInfo = $('content/chl/param/area/item').map((ele) => ele.text().trim())

                    const holdTimeNote = $('content/chl/param/holdTimeNote').text().split(',')
                    const holdTime = $('content/chl/param/holdTime').text()
                    // 如果当前的持续时间holdTime不在持续时间列表holdTimeArr中，则添加到持续时间列表中
                    if (!holdTimeNote.includes(holdTime)) {
                        holdTimeNote.push(holdTime)
                        holdTimeNote.sort((a, b) => {
                            return Number(a) - Number(b)
                        })
                    }

                    if (rowData.isOnvifChl) {
                        rowData.holdTime = ''
                    } else {
                        rowData.holdTime = holdTime
                    }

                    rowData.holdTimeList = holdTimeNote
                    rowData.switch = $('content/chl/param/switch').text().toBoolean()
                    rowData.sensitivity = Number($('content/chl/param/sensitivity').text())
                    rowData.status = ''
                    rowData.disabled = false

                    if ($('content/chl/param/sensitivity').length) rowData.sensitivityMinValue = Number($('content/chl/param/sensitivity').attr('min'))
                    if ($('content/chl/param/objectFilter/car').length) rowData.objectFilterCar = $('content/chl/param/objectFilter/car/switch').text().toBoolean()
                    if ($('content/chl/param/objectFilter/person').length) rowData.objectFilterPerson = $('content/chl/param/objectFilter/person/switch').text().toBoolean()
                    let max = $('content/chl/param/sensitivity').length ? Number($('content/chl/param/sensitivity').attr('max')) : NaN
                    if (import.meta.env.VITE_UI_TYPE === 'UI1-F' && max === 100) max = 120
                    rowData.sensitivityMaxValue = max
                    rowData.column = Number($('content/chl/param/area/itemType').attr('maxLen'))
                    rowData.row = Number($('content/chl/param/area').attr('count'))
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
            btnOKDisabled.value = true
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
                    const eleXml = queryXml(ele.element)
                    const newData = new ChannelMotionDto()
                    newData.id = ele.attr('id')!
                    newData.name = eleXml('name').text()
                    newData.chlIndex = eleXml('chlIndex').text()
                    newData.chlType = eleXml('chlType').text()
                    newData.status = 'loading'
                    newData.supportSMD = eleXml('supportSMD').text().toBoolean()
                    return newData
                })
                pageTotal.value = Number($('content').attr('total'))
            } else {
                tableData.value = []
            }

            for (let i = 0; i < tableData.value.length; i++) {
                const ele = tableData.value[i]
                if (ele.chlType !== 'recorder') {
                    await getData(ele.id)
                } else {
                    ele.status = ''
                }

                if (!getRowById(ele.id)) {
                    break
                }

                if (i === 0) {
                    selectedChlId.value = tableData.value[0].id
                    tableRef.value!.setCurrentRow(tableData.value[0])
                    formData.value = tableData.value[0]
                }
            }
        }

        const getAlarmStatus = () => {
            if (selectedChlId.value) {
                queryAlarmStatus().then((res) => {
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        motionAlarmList = $('content/motions/item').map((ele) => {
                            return queryXml(ele.element)('sourceChl').attr('id')!
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
                            ${ternary(
                                rowData.supportSMD,
                                rawXml`
                                    <objectFilter>
                                        ${ternary(rowData.objectFilterCar, `<car><switch>${rowData.objectFilterCar}</switch></car>`)}
                                        ${ternary(rowData.objectFilterPerson, `<person><switch>${rowData.objectFilterPerson}</switch></person>`)}
                                    </objectFilter>
                                `,
                            )}
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
            if (!editRows.size) return

            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))
            for (let i = 0; i < tableData.value.length; i++) {
                const ele = tableData.value[i]
                if (editRows.has(ele)) {
                    try {
                        const res = await editMotion(getSaveData(ele))
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            ele.status = 'success'
                            editRows.delete(ele)
                        } else {
                            const errorCode = Number($('errorCode').text())
                            ele.status = 'error'
                            ele.statusTip = errorCode === ErrorCode.USER_ERROR_NO_AUTH ? Translate('IDCS_NO_PERMISSION') : ''
                        }
                    } catch {
                        ele.status = 'error'
                    }
                }
            }

            if (!editRows.size) {
                btnOKDisabled.value = true
            }
            closeLoading()
        }

        const LiveNotify2Js = ($: XMLQuery) => {
            if ($("statenotify[@type='MotionArea']").length) {
                const rowData = getRowById(selectedChlId.value)!
                rowData.areaInfo = $('statenotify/areaInfo/item').map((ele) => ele.text())
                editRows.add(rowData)
                btnOKDisabled.value = false
            }
        }

        const handleSelAll = () => {
            const rowData = getRowById(selectedChlId.value)!
            if (rowData.disabled) return
            if (mode.value === 'h5') {
                motionDrawer?.selectAll()
            } else {
                const sendXML = OCX_XML_SetMotionAreaAction('ALL')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            motionAreaChange()
        }

        const handleSelReverse = () => {
            if (mode.value === 'h5') {
                motionDrawer?.reverse()
            } else {
                const sendXML = OCX_XML_SetMotionAreaAction('INVERSE')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            motionAreaChange()
        }

        const handleClear = () => {
            if (mode.value === 'h5') {
                motionDrawer?.clear()
            } else {
                const sendXML = OCX_XML_SetMotionAreaAction('NONE')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            motionAreaChange()
        }

        const motionAreaChange = (netArr?: string[][]) => {
            const rowData = getRowById(selectedChlId.value)!
            const areaInfo: string[] = (rowData.areaInfo = [])
            if (mode.value === 'h5') {
                const arr = netArr || motionDrawer!.getArea()
                arr.forEach((ele) => {
                    areaInfo.push(ele.join(''))
                })
            } else {
                const sendXML = OCX_XML_GetMotionArea()
                plugin.AsynQueryInfo(plugin.GetVideoPlugin(), sendXML, (result: string) => {
                    const $ = queryXml(XMLStr2XMLDoc(result))
                    $('//areaInfo/item').forEach((ele) => {
                        areaInfo.push(ele.text())
                    })
                })
            }
            editRows.add(rowData)
            btnOKDisabled.value = false
        }

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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                motionDrawer = new CanvasMotion({
                    el: player.getDrawbordCanvas(0) as HTMLCanvasElement,
                    onchange: motionAreaChange,
                })
            } else {
                plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                const sendXML = OCX_XML_SetPluginModel(osType === 'mac' ? 'MotionConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            if (!ready.value) return
            const rowData = getRowById(selectedChlId.value)!
            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            } else {
                if (osType === 'mac') {
                } else {
                    plugin.RetryStartChlView(rowData.id, rowData.name)
                }
            }

            if (rowData.column) {
                const motion = {
                    column: rowData.column,
                    row: rowData.row,
                    areaInfo: rowData.areaInfo,
                }
                if (mode.value === 'h5') {
                    motionDrawer?.setOption(motion)
                } else {
                    const sendXML = OCX_XML_SetMotionArea(motion)
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            if (ready.value) {
                if (mode.value === 'ocx') {
                    plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    motionDrawer?.destroy()
                }
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            btnOKDisabled,
            pageIndex,
            pageSize,
            pageTotal,
            selectedChlId,
            holdTimeList,
            showNote,
            handleRowClick,
            handleChlSel,
            handleDisposeWayClick,
            handleChangeVal,
            handleChangeAll,
            save,
            onReady,
            handleSelAll,
            handleSelReverse,
            handleClear,
            getTranslateForSecond,
            switchOptions,
            getDataList,
        }
    },
})
