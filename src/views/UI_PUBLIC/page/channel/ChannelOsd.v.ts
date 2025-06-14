/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-24 10:38:27
 * @Description: 通道 - OSD配置
 */
import { type XMLQuery } from '@/utils/xmlParse'
import { type OcxXmlSetOSDInfo } from '@/utils/ocx/ocxCmd'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            onlineChlList: [] as string[],
        })

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelOsdDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelOsdDto[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const chlList = ref<ChannelOsdDto[]>([]) // 作为下拉列表选项来源，只需保证name为最新值即可
        const { supportSHDB } = useCababilityStore() // 是否支持上海地标
        const tempName = ref('')
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)
        const manufacturer: Record<string, string> = {}

        const dateFormatTip = getTranslateMapping(DEFAULT_DATE_FORMAT_MAPPING)

        const timeFormatTip = getTranslateMapping(DEFAULT_TIME_FORMAT_MAPPING)

        const chlOptions = computed(() => {
            return chlList.value.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                    disabled: item.disabled,
                }
            })
        })

        let cacheData: Record<string, ChannelOsdDto> = {}
        let nameMapping: Record<string, string> = {}
        let drawer = CanvasOSD()

        const editRows = useWatchEditRows<ChannelOsdDto>()

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = cloneDeep(rowData)
            tableRef.value!.setCurrentRow(rowData)
        }

        /**
         * @description 修改名称失去焦点时 判断名称是否规范
         * @param {stirng} chlId
         * @param {string} chlName
         */
        const blurName = (chlId: string, chlName: string) => {
            const rowData = getRowById(chlId)!
            const name = chlName.trim()
            if (!checkChlName(name)) {
                openMessageBox(Translate('IDCS_CAN_NOT_CONTAIN_SPECIAL_CHAR').formatForLang(CHANNEL_LIMIT_CHAR))
                rowData.name = tempName.value
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
                            setOcxData(rowData)
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
                    setOcxData(rowData)
                }
            }
        }

        /**
         * @description 行未被禁用时，点击行，切换该行
         * @param {ChannelOsdDto} rowData
         */
        const handleRowClick = (rowData: ChannelOsdDto) => {
            selectedChlId.value = rowData.id
            formData.value = cloneDeep(rowData)
        }

        const changeSwitch = (flag: boolean, chlId: string, type: 'displayName' | 'displayTime' | 'remarkSwitch') => {
            const rowData = getRowById(chlId)!
            rowData[type] = flag
            formData.value = cloneDeep(rowData)
            setOcxData(rowData)
        }

        const changeSwitchAll = (flag: boolean, type: 'displayName' | 'displayTime' | 'remarkSwitch') => {
            tableData.value.forEach((ele) => {
                if (!ele.disabled) {
                    ele[type] = flag
                }

                if (ele.id === selectedChlId.value) {
                    formData.value = cloneDeep(ele)
                    setOcxData(ele)
                }
            })
        }

        const changeDateFormatAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.status === 'loading') return
                if (ele.dateEnum.includes(val) && !ele.disabled) {
                    ele.dateFormat = val
                } else {
                    openMessageBox(Translate('IDCS_NOT_SUPPORT_MODIFY_DATEFORMAT'))
                }
            })
            const rowData = getRowById(selectedChlId.value)!
            formData.value = cloneDeep(rowData)
            setOcxData(rowData)
        }

        const changeTimeFormatAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.disabled || ele.status === 'loading') return
                ele.timeFormat = val
            })
            const rowData = getRowById(selectedChlId.value)!
            formData.value = cloneDeep(rowData)
            setOcxData(rowData)
        }

        const handleRemarkNoteInput = (value: string) => {
            return value.replace(/[^A-Za-z0-9]/g, '')
        }

        const blurRemarkNote = (val: string, chlId: string) => {
            const rowData = getRowById(chlId)!
            const isChanged = rowData.remarkNote !== val || formData.value.remarkNote !== val
            rowData.remarkNote = val
            formData.value.remarkNote = val
            if (isChanged) {
                setOcxData(rowData)
            }
        }

        // 检测名字是否已经存在
        const checkIsNameExit = (name: string, currId: string): boolean => {
            let isSameName = false
            for (const key in nameMapping) {
                if (key !== currId) {
                    if (name === nameMapping[key]) {
                        isSameName = true
                        break
                    }
                }
            }
            return isSameName
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        const notify = ($: XMLQuery, stateType: string) => {
            //OSD位置改变
            if (stateType === 'OSDInfo') {
                const preRowData = getRowById(selectedChlId.value)!
                preRowData.timeX = $('statenotify/timeStamp/X').text().num()
                preRowData.timeY = $('statenotify/timeStamp/Y').text().num()
                preRowData.nameX = $('statenotify/deviceName/X').text().num()
                preRowData.nameY = $('statenotify/deviceName/Y').text().num()
            }
        }

        const getTimeEnabledData = async () => {
            const res = await queryDevList('')
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                $('content/item').forEach((ele) => {
                    const $item = queryXml(ele.element)
                    manufacturer[ele.attr('id')] = $item('manufacturer').text()
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

            if ($('status').text() === 'success') {
                channelOsd.remarkSwitch = $('content/chl/watermark/switch').text().bool()
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
            cacheData = {}

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

                if ($('status').text() === 'success') {
                    let isSpeco = false
                    // 时间枚举值
                    const timeEnum = $('types/timeFormat/enum').map((ele) => {
                        return ele.text()
                    })
                    // 日期枚举值
                    const dateEnum = $('types/dateFormat/enum').map((ele) => {
                        return ele.text()
                    })
                    channelOsd.dateEnum = dateEnum
                    channelOsd.timeEnum = timeEnum
                    channelOsd.supportDateFormat = dateEnum.length > 0
                    channelOsd.supportTimeFormat = dateEnum.length > 0

                    channelOsd.displayName = $('content/chl/chlName/switch').text().bool()
                    channelOsd.displayTime = $('content/chl/time/switch').text().bool()
                    channelOsd.dateFormat = $('content/chl/time/dateFormat').text()
                    channelOsd.timeFormat = $('content/chl/time/timeFormat').text()

                    channelOsd.status = ''
                    if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) isSpeco = true
                    channelOsd.isSpeco = isSpeco

                    channelOsd.timeX = $('content/chl/time/X').text().num()
                    channelOsd.timeXMinValue = $('content/chl/time/X').attr('min').num()
                    channelOsd.timeXMaxValue = $('content/chl/time/X').attr('max').num()
                    channelOsd.timeY = $('content/chl/time/Y').text().num()
                    channelOsd.timeYMinValue = $('content/chl/time/Y').attr('min').num()
                    channelOsd.timeYMaxValue = $('content/chl/time/Y').attr('max').num()
                    channelOsd.nameX = $('content/chl/chlName/X').text().num()
                    channelOsd.nameXMinValue = $('content/chl/chlName/X').attr('min').num()
                    channelOsd.nameXMaxValue = $('content/chl/chlName/X').attr('max').num()
                    channelOsd.nameY = $('content/chl/chlName/Y').text().num()
                    channelOsd.nameYMinValue = $('content/chl/chlName/Y').attr('min').num()
                    channelOsd.nameYMaxValue = $('content/chl/chlName/Y').attr('max').num()

                    channelOsd.disabled = isSpeco || !pageData.value.onlineChlList.includes(chlId)
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

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const newData = new ChannelOsdDto()
                    newData.id = ele.attr('id')
                    newData.name = $item('name').text()
                    newData.ip = $item('ip').text()
                    newData.chlIndex = $item('chlIndex').text()
                    newData.chlType = $item('chlType').text()
                    newData.status = 'loading'
                    nameMapping[newData.id] = newData.name
                    return newData
                })
                pageTotal.value = $('content').attr('total').num()
            } else {
                tableData.value = []
                selectedChlId.value = ''
            }

            let onlineChlId = ''

            tableData.value.forEach(async (item) => {
                if (!onlineChlId && pageData.value.onlineChlList.includes(item.id)) {
                    onlineChlId = item.id
                }

                if (manufacturer[item.id]) {
                    item.manufacturer = manufacturer[item.id]
                }

                if (item.chlType !== 'recorder') {
                    await getData(item.id)
                    await getChlWaterMark(item.id)
                } else {
                    // 通过cms添加的通道会走这里
                    item.disabled = false
                    item.status = ''
                    item.displayNameDisabled = true // todo table cell置空
                    item.displayTimeDisabled = true
                    // 置灰水印信息
                    item.remarkDisabled = true
                    item.remarkNote = ''
                }

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                editRows.listen(item)

                cacheData[item.id] = cloneDeep(item)

                if (onlineChlId === item.id) {
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                    formData.value = cloneDeep(item)
                    chlList.value = cloneDeep(tableData.value)
                }
            })
        }

        const setData = async () => {
            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))

            for (const rowData of editRows.toArray()) {
                try {
                    if (!rowData.name.trim()) {
                        rowData.status = 'error'
                        rowData.statusTip = Translate('IDCS_PROMPT_NAME_EMPTY')
                        continue
                    }

                    const flagSetDevice = await setDevice(rowData)
                    if (!flagSetDevice) continue

                    if (rowData.manufacturer === 'TVT') {
                        await setChlWaterMark(rowData)
                    }

                    let flagSetOSD = true
                    if (rowData.chlType !== 'recorder') {
                        flagSetOSD = await setIPChlORChlOSD(rowData)
                    }

                    if (flagSetDevice && flagSetOSD) {
                        nameMapping[rowData.id] = rowData.name
                        cacheData[rowData.id] = cloneDeep(rowData)
                        rowData.status = 'success'
                        editRows.remove(rowData)
                    }
                } catch {
                    rowData.status = 'error'
                    continue
                }
            }

            closeLoading()
        }

        const setDevice = async (rowData: ChannelOsdDto) => {
            const cacheRow = cacheData[rowData.id]
            if (rowData.name === cacheRow.name) {
                return true
            }

            const sendXml = rawXml`
                <content>
                    <id>${rowData.id}</id>
                    <name>${wrapCDATA(rowData.name)}</name>
                </content>
            `
            const result = await editDev(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                return true
            } else {
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if ($('errorCode').text().num() === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    errorInfo = Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')
                }
                rowData.status = 'error'
                rowData.statusTip = errorInfo
                return false
            }
        }

        const setChlWaterMark = async (rowData: ChannelOsdDto) => {
            const cacheRow = cacheData[rowData.id]
            if (rowData.remarkNote === cacheRow.remarkNote && rowData.remarkSwitch === cacheRow.remarkSwitch) {
                return true
            }

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
            const cacheRow = cacheData[rowData.id]
            if (
                rowData.displayTime === cacheRow.displayTime &&
                rowData.timeX === cacheRow.timeX &&
                rowData.timeY === cacheRow.timeY &&
                rowData.dateFormat === cacheRow.dateFormat &&
                rowData.timeFormat === cacheRow.timeFormat &&
                rowData.displayName === cacheRow.displayName &&
                rowData.nameX === cacheRow.nameX &&
                rowData.nameY === cacheRow.nameY &&
                rowData.name === cacheRow.name
            ) {
                return true
            }

            const sendXml = rawXml`
                <types>
                    ${rowData.supportDateFormat ? `<dateFormat>${wrapEnums(rowData.dateEnum)}</dateFormat>` : ''}
                    ${rowData.supportTimeFormat ? `<timeFormat>${wrapEnums(rowData.timeEnum)}</timeFormat>` : ''}
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
                return true
            } else {
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                if ($('errorCode').text().num() === ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR) {
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
            dateTime.getTimeConfig()
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

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                drawer.destroy()
                drawer = CanvasOSD({
                    el: player.getDrawbordCanvas(),
                    onchange: handleOSDChange,
                })
            }

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const onTime = (_winIndex: number, _data: TVTPlayerWinDataListItem, timeStamp: number) => {
            if (!supportSHDB) drawer.setTime(timeStamp)
        }

        const handleOSDChange = (nameCfg: CanvasOSDOptionNameConfig, timeCfg: CanvasOSDOptionTimeConfig) => {
            const preRowData = getRowById(selectedChlId.value)!
            preRowData.timeX = timeCfg.X
            preRowData.timeY = timeCfg.Y
            preRowData.nameX = nameCfg.X
            preRowData.nameY = nameCfg.Y
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            const channelOsd = getRowById(selectedChlId.value)!

            if (mode.value === 'h5') {
                player.play({
                    chlID: channelOsd.id,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(channelOsd.id, channelOsd.name)
            }

            setOcxData(channelOsd)
        }

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
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
            }

            if (mode.value === 'ocx') {
                if (rowData.timeX) {
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
                    plugin.ExecuteCmd(sendXML)
                }
            }
        }

        const setCanvasDrawerData = (rowData: ChannelOsdDto) => {
            drawer.setCfg({
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
            await getOnlineChlList()
            await getTimeEnabledData()
            await getDataList()
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin?.ExecuteCmd(sendXML)
            }

            drawer.destroy()
        })

        return {
            playerRef,
            notify,
            formData,
            tableRef,
            tableData,
            editRows,
            pageIndex,
            pageSize,
            pageTotal,
            chlList,
            chlOptions,
            selectedChlId,
            tempName,
            dateFormatTip,
            timeFormatTip,
            handleRowClick,
            handleChlSel,
            blurName,
            changeSwitch,
            changeSwitchAll,
            changeDateFormatAll,
            changeTimeFormatAll,
            handleRemarkNoteInput,
            blurRemarkNote,
            save,
            onReady,
            onTime,
            switchOptions,
            getDataList,
        }
    },
})
