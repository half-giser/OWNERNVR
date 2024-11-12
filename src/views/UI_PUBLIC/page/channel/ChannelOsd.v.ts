/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-24 10:38:27
 * @Description: 通道 - OSD配置
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { ChannelOsdDto } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash-es'
import CanvasOSD, { type CanvasOSDOptionNameConfig, type CanvasOSDOptionTimeConfig } from '@/utils/canvas/canvasOsd'
import { type TVTPlayerWinDataListItem } from '@/utils/wasmPlayer/tvtPlayer'
import { type OcxXmlSetOSDInfo } from '@/utils/ocx/ocxCmd'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const osType = getSystemInfo().platform
        const dateTime = useDateTimeStore()

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelOsdDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref([] as ChannelOsdDto[])
        const nameDisabled = ref(true)
        const btnOKDisabled = ref(true)
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const chlList = ref<ChannelOsdDto[]>([]) // 作为下拉列表选项来源，只需保证name为最新值即可
        const { supportSHDB } = useCababilityStore() // 是否支持上海地标
        const tempName = ref('')
        const switchOptions = getBoolSwitchOptions()
        const manufacturer: Record<string, string> = {}

        const dateFormatTip: Record<string, string> = {
            'yyyy-MM-dd': Translate('IDCS_DATE_FORMAT_YMD'),
            'MM-dd-yyyy': Translate('IDCS_DATE_FORMAT_MDY'),
            'dd-MM-yyyy': Translate('IDCS_DATE_FORMAT_DMY'),
            'yyyy/MM/dd': Translate('IDCS_DATE_FORMAT_YMD'),
            'MM/dd/yyyy': Translate('IDCS_DATE_FORMAT_MDY'),
            'dd/MM/yyyy': Translate('IDCS_DATE_FORMAT_DMY'),
            'year-month-day': Translate('IDCS_DATE_FORMAT_YMD'),
            'month-day-year': Translate('IDCS_DATE_FORMAT_MDY'),
            'day-month-year': Translate('IDCS_DATE_FORMAT_DMY'),
        }

        const dateFormatOptions: Record<string, string>[] = [
            {
                value: 'year-month-day',
                text: Translate('IDCS_DATE_FORMAT_YMD'),
            },
            {
                value: 'month-day-year',
                text: Translate('IDCS_DATE_FORMAT_MDY'),
            },
            {
                value: 'day-month-year',
                text: Translate('IDCS_DATE_FORMAT_DMY'),
            },
        ]

        const timeFormatTip: Record<string, string> = {
            '24': Translate('IDCS_TIME_FORMAT_24'),
            '12': Translate('IDCS_TIME_FORMAT_12'),
        }

        let nameMapping: Record<string, string> = {}
        let osdDrawer: CanvasOSD | undefined = undefined
        const editRows = new Set<ChannelOsdDto>()

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = cloneDeep(rowData)
            tableRef.value!.setCurrentRow(rowData)
            nameDisabled.value = rowData.disabled
            if (!rowData.supportDateFormat) nameDisabled.value = true
        }

        /**
         * @description 修改名称失去焦点时 判断名称是否规范
         * @param {stirng} chlId
         * @param {string} chlName
         */
        const handleNameBlur = (chlId: string, chlName: string) => {
            const rowData = getRowById(chlId)!
            const name = chlName.trim()
            if (!checkChlName(name)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                })
                rowData!.name = tempName.value
                formData.value = cloneDeep(rowData)
                chlList.value = cloneDeep(tableData.value)
            } else {
                // 当有重名IPC弹框时，新增保持和编辑按钮，让用户选择保持编辑或者返回重新编辑
                if (checkIsNameExit(name, rowData.id)) {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_NAME_EXISTED'),
                        confirmButtonText: Translate('IDCS_KEEP'),
                        cancelButtonText: Translate('IDCS_EDIT'),
                    })
                        .then(() => {
                            nameMapping[rowData.id] = name
                            rowData.name = name
                            formData.value = cloneDeep(rowData)
                            chlList.value = cloneDeep(tableData.value)
                        })
                        .catch(() => {
                            rowData.name = nameMapping[rowData.id]
                            formData.value = cloneDeep(rowData)
                            chlList.value = cloneDeep(tableData.value)
                        })
                } else {
                    nameMapping[rowData.id] = name
                    rowData.name = name
                    formData.value = cloneDeep(rowData)
                    chlList.value = cloneDeep(tableData.value)
                }
            }
        }

        /**
         * @description 行未被禁用时，点击行，切换该行
         * @param {ChannelOsdDto} rowData
         */
        const handleRowClick = (rowData: ChannelOsdDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = cloneDeep(rowData)
                nameDisabled.value = rowData.disabled
                if (!rowData.supportDateFormat) nameDisabled.value = true
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        /**
         * @description 回车时失去焦点
         * @param {Event} event
         */
        const handleKeydownEnter = (event: Event) => {
            ;(event.target as HTMLElement).blur()
        }

        const handleChangeSwitch = (flag: boolean, chlId: string, type: 'displayName' | 'displayTime' | 'remarkSwitch') => {
            const rowData = getRowById(chlId)!
            rowData[type] = flag
            formData.value = cloneDeep(rowData)
            // btnOKDisabled.value = false
            setOcxData(rowData)
            editRows.add(rowData)
        }

        const changeSwitchAll = (flag: boolean, type: 'displayName' | 'displayTime' | 'remarkSwitch') => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    ele[type] = flag
                    editRows.add(ele)
                }

                if (ele.id == selectedChlId.value) {
                    formData.value = cloneDeep(ele)
                    setOcxData(ele)
                }
            })
            btnOKDisabled.value = false
        }

        const changeDateFormatAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.status == 'loading') return
                if (ele.dateEnum.includes(val) && !ele.disabled) {
                    ele.dateFormat = val
                    editRows.add(ele)
                } else {
                    ElMessage({
                        type: 'info',
                        message: Translate('IDCS_NOT_SUPPORT_MODIFY_DATEFORMAT'),
                        grouping: true,
                    })
                }
            })
            const rowData = getRowById(selectedChlId.value)!
            formData.value = cloneDeep(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const changeTimeFormatAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.disabled || ele.status == 'loading') return
                ele.timeFormat = val
                editRows.add(ele)
            })
            const rowData = getRowById(selectedChlId.value)!
            formData.value = cloneDeep(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const handleRemarkNoteInput = (value: string) => {
            return value.replace(/[^A-Za-z0-9]/g, '')
        }

        const handleRemarkNoteBlur = (val: string, chlId: string) => {
            const rowData = getRowById(chlId)!
            rowData.remarkNote = val
            formData.value.remarkNote = val
        }

        const handleInputChange = (chlId: string) => {
            const rowData = getRowById(chlId)!
            btnOKDisabled.value = false
            setOcxData(rowData)
            editRows.add(rowData)
        }

        // 检测名字是否已经存在
        const checkIsNameExit = (name: string, currId: string): boolean => {
            let isSameName = false
            for (const key in nameMapping) {
                if (key != currId) {
                    if (name == nameMapping[key]) {
                        isSameName = true
                        break
                    }
                }
            }
            return isSameName
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id == chlId)
        }

        const LiveNotify2Js = ($: XMLQuery) => {
            //OSD位置改变
            if ($("statenotify[@type='OSDInfo']").length) {
                const preRowData = getRowById(selectedChlId.value)!
                if (osType == 'mac') {
                } else {
                    preRowData.timeX = Number($('statenotify/timeStamp/X').text())
                    preRowData.timeY = Number($('statenotify/timeStamp/Y').text())
                    preRowData.nameX = Number($('statenotify/deviceName/X').text())
                    preRowData.nameY = Number($('statenotify/deviceName/Y').text())
                }
                btnOKDisabled.value = false
            }
        }

        const getTimeEnabledData = async () => {
            const res = await queryDevList('')
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                $('content/item').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    manufacturer[ele.attr('id')!] = eleXml('manufacturer').text()
                })
            }
        }

        /**
         * @description 获取通道水印信息
         * @param {string} chlId
         */
        const getChlWaterMark = async (chlId: string) => {
            const data = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const res = await queryChlWaterMark(data)
            const $ = queryXml(res)
            const channelOsd = getRowById(chlId)
            if (!channelOsd) {
                return
            }

            if ($('status').text() == 'success') {
                channelOsd.remarkSwitch = $('content/chl/watermark/switch').text().toBoolean()
                channelOsd.remarkNote = $('content/chl/watermark/value').text()
                channelOsd.remarkDisabled = false
            } else {
                channelOsd.remarkDisabled = true
            }
        }

        /**
         * @description 获取行OSD数据
         * @param {string} chlId
         * @returns {Promise<boolean>}
         */
        const getData = async (chlId: string) => {
            const data = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            try {
                const res = await queryIPChlORChlOSD(data)
                const $ = queryXml(res)
                const channelOsd = getRowById(chlId)
                if (!channelOsd) {
                    return
                }

                if ($('status').text() == 'success') {
                    let isSpeco = false
                    // 时间枚举值
                    const timeEnum: string[] = []
                    $('types/timeFormat/enum').forEach((ele) => {
                        timeEnum.push(ele.text())
                    })
                    // 日期枚举值
                    const dateEnum: string[] = []
                    $('types/dateFormat/enum').forEach((ele) => {
                        dateEnum.push(ele.text())
                    })
                    channelOsd.dateEnum = dateEnum
                    channelOsd.timeEnum = timeEnum
                    channelOsd.supportDateFormat = dateEnum.length > 0
                    channelOsd.supportTimeFormat = dateEnum.length > 0

                    channelOsd.displayName = $('content/chl/chlName/switch').text().toBoolean()
                    channelOsd.displayTime = $('content/chl/time/switch').text().toBoolean()
                    channelOsd.dateFormat = $('content/chl/time/dateFormat').text()
                    channelOsd.timeFormat = $('content/chl/time/timeFormat').text()

                    channelOsd.status = ''
                    if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) isSpeco = true
                    channelOsd.isSpeco = isSpeco

                    channelOsd.timeX = Number($('content/chl/time/X').text())
                    channelOsd.timeXMinValue = Number($('content/chl/time/X').attr('min')!)
                    channelOsd.timeXMaxValue = Number($('content/chl/time/X').attr('max')!)
                    channelOsd.timeY = Number($('content/chl/time/Y').text())
                    channelOsd.timeYMinValue = Number($('content/chl/time/Y').attr('min')!)
                    channelOsd.timeYMaxValue = Number($('content/chl/time/Y').attr('max')!)
                    channelOsd.nameX = Number($('content/chl/chlName/X').text())
                    channelOsd.nameXMinValue = Number($('content/chl/chlName/X').attr('min')!)
                    channelOsd.nameXMaxValue = Number($('content/chl/chlName/X').attr('max')!)
                    channelOsd.nameY = Number($('content/chl/chlName/Y').text())
                    channelOsd.nameYMinValue = Number($('content/chl/chlName/Y').attr('min')!)
                    channelOsd.nameYMaxValue = Number($('content/chl/chlName/Y').attr('max')!)

                    channelOsd.disabled = isSpeco
                    return
                } else {
                    // 处理请求配置信息失败通道（离线）
                    channelOsd.status = ''
                }
            } catch {
                const channelOsd = getRowById(chlId)
                if (!channelOsd) {
                    return
                }
                channelOsd.status = ''
            }
            return
        }

        const getDataList = async () => {
            btnOKDisabled.value = true
            editRows.clear()
            nameMapping = {}
            openLoading()

            const res = await getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportOsd: true,
                requireField: ['ip'],
            })
            const $ = queryXml(res)

            closeLoading()

            if ($('status').text() == 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const eleXml = queryXml(ele.element)
                    const newData = new ChannelOsdDto()
                    newData.id = ele.attr('id')!
                    newData.name = eleXml('name').text()
                    newData.ip = eleXml('ip').text()
                    newData.chlIndex = eleXml('chlIndex').text()
                    newData.chlType = eleXml('chlType').text()
                    newData.status = 'loading'
                    nameMapping[newData.id] = newData.name
                    return newData
                })
                pageTotal.value = Number($('content').attr('total')!)
            } else {
                tableData.value = []
                selectedChlId.value = ''
            }

            for (let i = 0; i < tableData.value.length; i++) {
                const ele = tableData.value[i]

                if (manufacturer[ele.id]) {
                    ele.manufacturer = manufacturer[ele.id]
                }

                if (ele.chlType !== 'recorder') {
                    await getData(ele.id)
                    await getChlWaterMark(ele.id)
                } else {
                    // 通过cms添加的通道会走这里
                    ele.disabled = false
                    ele.status = ''
                    ele.displayNameDisabled = true // todo table cell置空
                    ele.displayTimeDisabled = true
                    // 置灰水印信息
                    ele.remarkDisabled = true
                    ele.remarkNote = ''
                }

                if (!getRowById(ele.id)) {
                    break
                }

                if (i === 0) {
                    selectedChlId.value = tableData.value[0].id
                    tableRef.value!.setCurrentRow(tableData.value[0])
                    formData.value = cloneDeep(tableData.value[0])
                    chlList.value = cloneDeep(tableData.value)
                }
            }
        }

        const setData = async () => {
            if (editRows.size === 0) return

            tableData.value.forEach((ele) => (ele.status = ''))

            openLoading()

            for (let i = 0; i < tableData.value.length; i++) {
                const rowData = tableData.value[i]
                if (editRows.has(rowData)) {
                    try {
                        if (!rowData.name.trim()) {
                            rowData.status = 'error'
                            rowData.statusTip = Translate('IDCS_PROMPT_NAME_EMPTY')
                            continue
                        }

                        const flagSetDevice = await setDevice(rowData)
                        if (!flagSetDevice) continue

                        if (rowData.manufacturer == 'TVT') {
                            await setChlWaterMark(rowData)
                        }

                        let flagSetOSD = true
                        if (rowData.chlType !== 'recorder') {
                            flagSetOSD = await setIPChlORChlOSD(rowData)
                        }

                        if (flagSetDevice && flagSetOSD) {
                            editRows.delete(rowData)
                            nameMapping[rowData.id] = rowData.name
                            rowData.status = 'success'
                        }
                    } catch {
                        rowData.status = 'error'
                        continue
                    }
                }
            }

            closeLoading()
            if (!editRows.size) {
                btnOKDisabled.value = true
            }
        }

        const setDevice = async (rowData: ChannelOsdDto) => {
            const sendXml = rawXml`
                <content>
                    <id>${rowData.id}</id>
                    <name maxByteLen="63">${wrapCDATA(rowData.name)}</name>
                </content>
            `
            const result = await editDev(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                return true
            } else {
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if (Number($('errorCode').text()) === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    errorInfo = Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')
                }
                rowData.status = 'error'
                rowData.statusTip = errorInfo
                return false
            }
        }

        const setChlWaterMark = async (rowData: ChannelOsdDto) => {
            const sendXml = rawXml`
                <content>
                    <chl id='${rowData.id}'>
                        <watermark>
                            <value>${rowData.remarkNote}</value>
                            <switch>${rowData.remarkSwitch}</switch>
                        </watermark>
                    </chl>
                </content>
            `
            await editChlWaterMark(sendXml)
        }

        const setIPChlORChlOSD = async (rowData: ChannelOsdDto) => {
            const sendXml = rawXml`
                <types>
                    ${ternary(rowData.supportDateFormat, `<dateFormat>${wrapEnums(rowData.dateEnum)}</dateFormat>`)}
                    ${ternary(rowData.supportTimeFormat, `<timeFormat>${wrapEnums(rowData.timeEnum)}</timeFormat>`)}
                </types>
                <content>
                    <chl id='${rowData.id}'>
                        <time>
                            <switch>${rowData.displayTime}</switch>
                            <X>${rowData.timeX}</X>
                            <Y>${rowData.timeY}</Y>
                            ${rowData.supportDateFormat ? '<dateFormat type="dateFormat">' + rowData.dateFormat + '</dateFormat>' : ''}
                            ${rowData.supportTimeFormat ? '<timeFormat type="timeFormat">' + rowData.timeFormat + '</timeFormat>' : ''}
                        </time>
                        <chlName>
                            <switch>${rowData.displayName}</switch>
                            <X>${rowData.nameX}</X>
                            <Y>${rowData.nameY}</Y>
                            <name>${rowData.name}</name>
                        </chlName>
                    </chl>
                </content>
            `
            const res = await editIPChlORChlOSD(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                // if (rowData.name === nameMapping[rowData.id]) {
                //     rowData.status = 'success'
                // }
                return true
            } else {
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if (Number($('errorCode').text()) == ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR) {
                    errorInfo = Translate('resourceNotExist').formatForLang(Translate('IDCS_CHANNEL'))
                }
                rowData.status = 'error'
                rowData.statusTip = errorInfo
                return false
            }
        }

        const setDateTime = async () => {
            let timeFormat = ''
            let dateFormat = ''
            tableData.value.some((ele) => {
                if (ele.timeFormat) timeFormat = ele.timeFormat
                if (ele.dateFormat) dateFormat = ele.dateFormat
                return !!timeFormat && !!dateFormat
            })
            const data = rawXml`
                <content>
                    <formatInfo>
                        <date type='dateFormat'>${dateFormat}</date>
                        <time type='timeFormat'>${timeFormat}</time>
                    </formatInfo>
                </content>`
            await editTimeCfg(data)
        }

        const save = async () => {
            await setData()
            await setDateTime()
            dateTime.getTimeConfig(true)
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
                osdDrawer = new CanvasOSD({
                    el: player.getDrawbordCanvas(0) as HTMLCanvasElement,
                    onchange: handleOSDChange,
                })
            } else {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }

                if (!plugin.IsPluginAvailable()) {
                    plugin.SetPluginNoResponse()
                    plugin.ShowPluginNoResponse()
                }
                plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'OSDConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        const onTime = (_winIndex: number, _data: TVTPlayerWinDataListItem, timeStamp: number) => {
            if (!supportSHDB) osdDrawer && osdDrawer.setTime(timeStamp)
        }

        const handleOSDChange = (nameCfg: CanvasOSDOptionNameConfig, timeCfg: CanvasOSDOptionTimeConfig) => {
            const preRowData = getRowById(selectedChlId.value)!
            preRowData.timeX = timeCfg.X
            preRowData.timeY = timeCfg.Y
            preRowData.nameX = nameCfg.X
            preRowData.nameY = nameCfg.Y
            btnOKDisabled.value = false
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            if (!ready.value) return
            const channelOsd = getRowById(selectedChlId.value)!
            if (mode.value === 'h5') {
                player.play({
                    chlID: channelOsd.id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                } else {
                    plugin.RetryStartChlView(channelOsd.id, channelOsd.name)
                }
            }
            setOcxData(channelOsd)
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const setOcxData = (rowData: ChannelOsdDto) => {
            if (supportSHDB) return
            if (mode.value === 'h5') {
                setCanvasDrawerData(rowData)
            } else {
                if (rowData.timeX) {
                    if (osType == 'mac') {
                    } else {
                        const osd: OcxXmlSetOSDInfo = {
                            timeStamp: {
                                switch: rowData.displayTime,
                                X: rowData.timeX,
                                XMinValue: rowData.timeXMinValue,
                                XMaxValue: rowData.timeXMaxValue,
                                Y: rowData.timeY,
                                YMinValue: rowData.timeYMinValue,
                                YMaxValue: rowData.timeYMaxValue,
                                dateFormat: rowData.dateFormat,
                                timeFormat: rowData.timeFormat,
                            },
                            deviceName: {
                                switch: rowData.displayName,
                                value: rowData.name,
                                X: rowData.nameX,
                                XMinValue: rowData.nameXMinValue,
                                XMaxValue: rowData.nameXMaxValue,
                                Y: rowData.nameY,
                                YMinValue: rowData.nameYMinValue,
                                YMaxValue: rowData.nameYMaxValue,
                            },
                        }
                        const sendXML = OCX_XML_SetOSDInfo(osd)
                        plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    }
                }
            }
        }

        const setCanvasDrawerData = (rowData: ChannelOsdDto) => {
            osdDrawer?.setCfg({
                nameCfg: {
                    value: rowData.name,
                    switch: rowData.displayName,
                    X: rowData.nameX,
                    XMinValue: rowData.nameXMinValue,
                    XMaxValue: rowData.nameXMaxValue,
                    Y: rowData.nameY,
                    YMinValue: rowData.nameYMinValue,
                    YMaxValue: rowData.nameYMaxValue,
                },
                timeCfg: {
                    switch: rowData.displayTime,
                    X: rowData.timeX,
                    XMinValue: rowData.timeXMinValue,
                    XMaxValue: rowData.timeXMaxValue,
                    Y: rowData.timeY,
                    YMinValue: rowData.timeYMinValue,
                    YMaxValue: rowData.timeYMaxValue,
                    dateFormat: rowData.dateFormat as 'year-month-day' | 'month-day-year' | 'day-month-year' | undefined,
                    timeFormat: rowData.timeFormat ? (Number(rowData.timeFormat) as 12 | 24 | undefined) : undefined,
                },
            })
        }

        watch(selectedChlId, play)

        onMounted(async () => {
            formData.value.remarkDisabled = false
            formData.value.supportTimeFormat = true
            formData.value.supportDateFormat = true
            await getTimeEnabledData()
            await getDataList()
        })

        onBeforeUnmount(() => {
            if (ready.value) {
                if (mode.value === 'ocx') {
                    plugin?.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin?.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    osdDrawer?.destroy()
                    osdDrawer = undefined
                }
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            nameDisabled,
            btnOKDisabled,
            pageIndex,
            pageSize,
            pageTotal,
            chlList,
            selectedChlId,
            tempName,
            dateFormatTip,
            dateFormatOptions,
            timeFormatTip,
            handleRowClick,
            handleChlSel,
            handleNameBlur,
            handleChangeSwitch,
            changeSwitchAll,
            changeDateFormatAll,
            changeTimeFormatAll,
            handleRemarkNoteInput,
            handleRemarkNoteBlur,
            handleInputChange,
            handleKeydownEnter,
            save,
            onReady,
            onTime,
            switchOptions,
            getDataList,
        }
    },
})
