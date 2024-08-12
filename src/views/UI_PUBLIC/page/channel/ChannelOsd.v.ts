/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-24 10:38:27
 * @Description:
 */

import BaseVideoPlayer from '@/views/UI_PUBLIC/components/player/BaseVideoPlayer.vue'
import { type XmlResult } from '@/utils/xmlParse'
import { ChannelInfoDto, ChannelOsd } from '@/types/apiType/channel'
import { trim, cloneDeep } from 'lodash'
import { ArrowDown } from '@element-plus/icons-vue'
import CanvasOSD, { type CanvasOSDOptionNameConfig, type CanvasOSDOptionTimeConfig } from '@/utils/canvas/canvasOsd'
import { type TVTPlayerWinDataListItem } from '@/utils/wasmPlayer/tvtPlayer'
import { type OcxXmlSetOSDInfo, type OcxXmlSetOsdListDatum } from '@/utils/ocx/ocxCmd'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import { dateFormatOptions, dateFormatTip, tableRowStatusToolTip, timeFormatTip } from '@/utils/const/other'

export default defineComponent({
    components: {
        BaseVideoPlayer,
        ArrowDown,
        BaseImgSprite,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const pluginStore = usePluginStore()
        const userSessionStore = useUserSessionStore()
        const Plugin = inject('Plugin') as PluginType
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelOsd())
        const tableRef = ref()
        const tableData = ref([] as ChannelOsd[])
        const nameDisabled = ref(true)
        const btnOKDisabled = ref(true)
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const chlList = ref<ChannelOsd[]>([]) // 作为下拉列表选项来源，只需保证name为最新值即可
        const { supportSHDB } = useCababilityStore() // 是否支持上海地标
        const tempName = ref('')

        let nameMapping: Record<string, string> = {}
        let osdDrawer: CanvasOSD | undefined = undefined
        const editRows = new Set<ChannelOsd>()
        let returnRqCount = 0

        const handleSizeChange = (val: number) => {
            pageSize.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleCurrentChange = (val: number) => {
            pageIndex.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)
            formData.value = cloneDeep(rowData)
            tableRef.value.setCurrentRow(rowData)
            nameDisabled.value = rowData.disabled
            if (!rowData.supportDateFormat) nameDisabled.value = true
        }

        const handleNameBlur = (chlId: string, chlName: string) => {
            const rowData = getRowById(chlId)
            const name = trim(chlName)
            if (!checkChlName(name)) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                    showCancelButton: false,
                })
                rowData!.name = tempName.value
                formData.value = cloneDeep(rowData)
                chlList.value = cloneDeep(tableData.value)
            } else {
                // 当有重名IPC弹框时，新增保持和编辑按钮，让用户选择保持编辑或者返回重新编辑
                if (checkIsNameExit(name, rowData.id)) {
                    openMessageTipBox({
                        type: 'question',
                        title: Translate('IDCS_INFO_TIP'),
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
            // setOcxData(rowData)
            // btnOKDisabled.value = false
            // editRows.add(rowData)
        }

        const handleRowClick = (rowData: ChannelOsd) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = cloneDeep(rowData)
                nameDisabled.value = rowData.disabled
                if (!rowData.supportDateFormat) nameDisabled.value = true
            }
            tableRef.value.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleKeydownEnter = (event: any) => {
            event.target.blur()
        }

        const handleChangeSwitch = (flag: boolean, chlId: string, type: 'displayName' | 'displayTime' | 'remarkSwitch') => {
            const rowData = getRowById(chlId)
            rowData[type] = flag
            formData.value = cloneDeep(rowData)
            btnOKDisabled.value = false
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
                if (ele.disabled || ele.status == 'loading') return // todo 老代码禁用行也会最下面逻辑，设备端没有看到info提示，暂时加上禁用行判断
                if (ele.dateEnum.includes(val)) {
                    ele.dateFormat = val
                    editRows.add(ele)
                } else {
                    ElMessage({
                        type: 'info',
                        message: Translate('IDCS_NOT_SUPPORT_MODIFY_DATEFORMAT'),
                        grouping: true,
                    }) // todo 待替换组件
                }
            })
            const rowData = getRowById(selectedChlId.value)
            formData.value = cloneDeep(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const changeTimeFormatAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.disabled || ele.status == 'loading') return // todo 老代码没此判断
                ele.timeFormat = val
                editRows.add(ele)
            })
            const rowData = getRowById(selectedChlId.value)
            formData.value = cloneDeep(rowData)
            btnOKDisabled.value = false
            setOcxData(rowData)
        }

        const handleRemarkNoteInput = (rowData: ChannelOsd) => {
            const reg = /[^A-Za-z0-9]/g
            if (reg.test(rowData.remarkNote)) rowData.remarkNote = rowData.remarkNote.replace(reg, '')
        }

        const handleRemarkNoteBlur = (val: string, chlId: string) => {
            const rowData = getRowById(chlId)
            rowData.remarkNote = val
            formData.value.remarkNote = val
        }

        const handleInputChange = (chlId: string) => {
            const rowData = getRowById(chlId)
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
            return tableData.value.find((element) => element.id == chlId) as ChannelOsd
        }

        const LiveNotify2Js = ($: (path: string) => XmlResult) => {
            //OSD位置改变
            if ($("statenotify[@type='OSDInfo']").length > 0) {
                const preRowData = getRowById(selectedChlId.value)
                if (osType == 'mac') {
                    // todo
                } else {
                    preRowData.timeX = Number($('statenotify/timeStamp/X').text())
                    preRowData.timeY = Number($('statenotify/timeStamp/Y').text())
                    preRowData.nameX = Number($('statenotify/deviceName/X').text())
                    preRowData.nameY = Number($('statenotify/deviceName/Y').text())
                }
                btnOKDisabled.value = false
            }
        }

        const getTimeEnabledData = (callback?: Function) => {
            openLoading(LoadingTarget.FullScreen)
            queryDevList(getXmlWrapData('')).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    const rowData: ChannelInfoDto[] = []
                    res('content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelInfoDto()
                        newData.id = ele.attr('id')
                        newData.manufacturer = eleXml('manufacturer').text()
                        rowData.push(newData)
                    })
                    rowData.forEach((ele: ChannelInfoDto) => {
                        const channelOsd = getRowById(ele.id)
                        if (channelOsd) channelOsd.manufacturer = ele.manufacturer
                    })
                }
                if (callback) callback()
            })
        }

        const getChlWaterMark = (chlId: string, callback?: Function) => {
            const data = `
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>`
            queryChlWaterMark(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                let flag = false
                if (res('status').text() == 'success') {
                    flag = true
                    const channelOsd = getRowById(chlId)
                    channelOsd!.remarkSwitch = res('content/chl/watermark/switch').text().toBoolean()
                    channelOsd!.remarkNote = res('content/chl/watermark/value').text()
                }
                if (callback) callback(flag)
            })
        }

        const getData = (chlId: string) => {
            const data = `
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>`
            queryIPChlORChlOSD(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    let isSpeco = false
                    // 时间枚举值
                    const timeEnum: string[] = []
                    res('types/timeFormat/enum').forEach((ele: any) => {
                        timeEnum.push(ele.text())
                    })
                    // 日期枚举值
                    const dateEnum: string[] = []
                    res('types/dateFormat/enum').forEach((ele: any) => {
                        dateEnum.push(ele.text())
                    })
                    const channelOsd = getRowById(chlId)
                    channelOsd!.dateEnum = dateEnum
                    channelOsd!.timeEnum = timeEnum
                    channelOsd!.supportDateFormat = dateEnum.length > 0
                    channelOsd!.supportTimeFormat = dateEnum.length > 0

                    channelOsd!.displayName = res('content/chl/chlName/switch').text().toBoolean()
                    channelOsd!.displayTime = res('content/chl/time/switch').text().toBoolean()
                    channelOsd!.dateFormat = res('content/chl/time/dateFormat').text()
                    channelOsd!.timeFormat = res('content/chl/time/timeFormat').text()

                    channelOsd!.status = ''
                    if (res('content/chl').length == 0 || chlId !== res('content/chl').attr('id')) isSpeco = true
                    channelOsd!.isSpeco = isSpeco

                    channelOsd!.timeX = res('content/chl/time/X').text()
                    channelOsd!.timeXMinValue = res('content/chl/time/X').attr('min')
                    channelOsd!.timeXMaxValue = res('content/chl/time/X').attr('max')
                    channelOsd!.timeY = res('content/chl/time/Y').text()
                    channelOsd!.timeYMinValue = res('content/chl/time/Y').attr('min')
                    channelOsd!.timeYMaxValue = res('content/chl/time/Y').attr('max')
                    channelOsd!.nameX = res('content/chl/chlName/X').text()
                    channelOsd!.nameXMinValue = res('content/chl/chlName/X').attr('min')
                    channelOsd!.nameXMaxValue = res('content/chl/chlName/X').attr('max')
                    channelOsd!.nameY = res('content/chl/chlName/Y').text()
                    channelOsd!.nameYMinValue = res('content/chl/chlName/Y').attr('min')
                    channelOsd!.nameYMaxValue = res('content/chl/chlName/Y').attr('max')

                    channelOsd!.disabled = isSpeco

                    if (chlId == selectedChlId.value) {
                        nameDisabled.value = channelOsd!.disabled
                        getChlWaterMark(chlId, (flag: boolean) => {
                            channelOsd!.remarkDisabled = !flag
                            if (!flag) channelOsd!.remarkNote = ''
                            formData.value = cloneDeep(channelOsd!)
                            setOcxData(channelOsd)
                        })
                    } else {
                        getChlWaterMark(chlId, (flag: boolean) => {
                            channelOsd!.remarkDisabled = !flag
                            if (!flag) channelOsd!.remarkNote = ''
                        })
                    }
                } else {
                    // 处理请求配置信息失败通道（离线）
                    const channelOsd = getRowById(chlId)
                    channelOsd!.status = ''
                    channelOsd!.remarkNote = ''
                    if (chlId == selectedChlId.value) {
                        formData.value = cloneDeep(channelOsd!)
                        nameDisabled.value = true
                    }
                }
            })
        }

        const getDataList = () => {
            openLoading(LoadingTarget.FullScreen)
            getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportOsd: true,
                requireField: ['ip'],
            }).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    editRows.clear()
                    const rowData: ChannelOsd[] = []
                    nameMapping = {}
                    res('content/item').forEach((ele: any) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelOsd()
                        newData.id = ele.attr('id')
                        newData.name = eleXml('name').text()
                        newData.ip = eleXml('ip').text()
                        newData.chlIndex = eleXml('chlIndex').text()
                        newData.chlType = eleXml('chlType').text()
                        newData.status = 'loading'
                        newData.statusTip = tableRowStatusToolTip['loading']
                        rowData.push(newData)
                        nameMapping[rowData[rowData.length - 1].id] = rowData[rowData.length - 1].name
                    })
                    pageTotal.value = Number(res('content').attr('total'))
                    tableData.value = rowData
                    if (rowData.length) {
                        selectedChlId.value = rowData[0].id
                        tableRef.value.setCurrentRow(rowData[0])
                        formData.value = cloneDeep(rowData[0])
                        chlList.value = cloneDeep(rowData)
                        getTimeEnabledData(() => {
                            rowData.forEach((ele) => {
                                if (ele.chlType != 'recorder') {
                                    getData(ele.id)
                                } else {
                                    // 通过cms添加的通道会走这里
                                    ele.disabled = false
                                    ele.status = ''
                                    ele.displayNameDisabled = true // todo table cell置空
                                    ele.displayTimeDisabled = true
                                    // 置灰水印信息
                                    ele.remarkDisabled = true
                                    ele.remarkNote = ''

                                    if (ele.id == selectedChlId.value) formData.value = cloneDeep(ele)
                                }
                            })
                        })
                    }
                } else {
                    selectedChlId.value = ''
                }
            })
        }

        const checkAllRqReturn = () => {
            returnRqCount++
            if (returnRqCount == editRows.size) {
                closeLoading(LoadingTarget.FullScreen)
                editRows.clear()
            }
        }

        const setData = () => {
            tableData.value.forEach((ele) => (ele.status = ''))
            btnOKDisabled.value = true
            returnRqCount = 0
            if (editRows.size == 0) return
            openLoading(LoadingTarget.FullScreen)
            editRows.forEach((ele) => sendData(ele))
        }

        const sendData = (rowData: ChannelOsd) => {
            if (!rowData.name) {
                rowData.status = 'error'
                rowData.statusTip = Translate('IDCS_PROMPT_NAME_EMPTY')
                checkAllRqReturn()
                return
            }

            const data = `
                <content>
                    <id>${rowData.id}</id>
                    <name><![CDATA[${rowData.name}]]></name>
                </content>`
            try {
                editDev(getXmlWrapData(data))
                    .then((res: any) => {
                        checkAllRqReturn()
                        res = queryXml(res)
                        if (res('status').text() == 'success') {
                            if (rowData.manufacturer == 'TVT') {
                                const watermarkXml = `
                                <content>
                                    <chl id='${rowData.id}'>
                                        <watermark>
                                            <value>${rowData.remarkNote}</value>
                                            <switch>${rowData.remarkSwitch}</switch>
                                        </watermark>
                                    </chl>
                                </content>`
                                editChlWaterMark(getXmlWrapData(watermarkXml))
                            }
                            nameMapping[rowData.id] = rowData.name
                            rowData.status = 'success'
                            rowData.statusTip = tableRowStatusToolTip['saveSuccess']
                            if (rowData.chlType == 'recorder') return

                            let editIPChlORChlOSDXml = '<types>'
                            if (rowData.supportDateFormat) {
                                editIPChlORChlOSDXml += '<dateFormat>'
                                rowData.dateEnum.forEach((ele) => {
                                    editIPChlORChlOSDXml += `<enum>${ele}</enum>`
                                })
                                editIPChlORChlOSDXml += '</dateFormat>'
                            }
                            if (rowData.supportTimeFormat) {
                                editIPChlORChlOSDXml += '<timeFormat>'
                                rowData.timeEnum.forEach((ele) => {
                                    editIPChlORChlOSDXml += `<enum>${ele}</enum>`
                                })
                                editIPChlORChlOSDXml += '</timeFormat>'
                            }
                            editIPChlORChlOSDXml += `
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
                            </content>`
                            try {
                                editIPChlORChlOSD(getXmlWrapData(editIPChlORChlOSDXml))
                                    .then((res: any) => {
                                        res = queryXml(res)
                                        if (res('status').text() == 'success') {
                                            if (rowData.name == nameMapping[rowData.id]) {
                                                checkAllRqReturn()
                                                rowData.status = 'success'
                                                rowData.statusTip = tableRowStatusToolTip['saveSuccess']
                                            }
                                        } else {
                                            checkAllRqReturn()
                                            let errorInfo = tableRowStatusToolTip['saveFailed']
                                            if (Number(res('errorCode').text()) == errorCodeMap.resourceNotExist) {
                                                errorInfo = Translate('resourceNotExist').formatForLang(Translate('IDCS_CHANNEL'))
                                            }
                                            rowData.status = 'error'
                                            rowData.statusTip = errorInfo
                                        }
                                    })
                                    .catch(() => checkAllRqReturn())
                            } catch (error) {
                                checkAllRqReturn()
                                alert(error)
                            }
                        } else {
                            let errorInfo = tableRowStatusToolTip['saveFailed']
                            if (Number(res('errorCode').text()) == errorCodeMap.nameExist) {
                                errorInfo = Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')
                            }
                            rowData.status = 'error'
                            rowData.statusTip = errorInfo
                        }
                    })
                    .catch(() => checkAllRqReturn)
            } catch (error) {
                checkAllRqReturn()
                alert(error)
            }
        }

        const setDateTime = () => {
            let timeFormat = ''
            let dateFormat = ''
            tableData.value.forEach((ele) => {
                if (ele.timeFormat) timeFormat = ele.timeFormat
                if (ele.dateFormat) dateFormat = ele.dateFormat
            })
            const data = `
                <content>
                    <formatInfo>
                        <date type='dateFormat'>${dateFormat}</date>
                        <time type='timeFormat'>${timeFormat}</time>
                    </formatInfo>
                </content>`
            editTimeCfg(getXmlWrapData(data))
        }

        const save = () => {
            setData()
            setDateTime()
        }

        const onReady = () => {
            if (!Plugin.IsSupportH5() && !Plugin.IsPluginAvailable()) {
                pluginStore.showPluginNoResponse = true
                Plugin.ShowPluginNoResponse()
            }
            if (!Plugin.IsSupportH5()) Plugin.VideoPluginNotifyEmitter.addListener(LiveNotify2Js)

            if (playerRef.value?.mode === 'h5') {
                osdDrawer = new CanvasOSD({
                    el: playerRef.value?.player.getDrawbordCanvas(0) as HTMLCanvasElement,
                    onchange: handleOSDChange,
                })
            } else {
                let sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'OSDConfig' : 'ReadOnly', 'Live')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                if (osType == 'mac') {
                    sendXML = OCX_XML_SetProperty({
                        calendarType: userSessionStore.calendarType,
                    })
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
            play()
        }

        const onTime = (winIndex: number, data: TVTPlayerWinDataListItem, timeStamp: number) => {
            if (!supportSHDB) osdDrawer && osdDrawer.setTime(timeStamp)
        }

        const handleOSDChange = (nameCfg: CanvasOSDOptionNameConfig, timeCfg: CanvasOSDOptionTimeConfig) => {
            const preRowData = getRowById(selectedChlId.value)
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
            if (!playerRef.value || !playerRef.value.ready) return
            const channelOsd = getRowById(selectedChlId.value)
            if (playerRef.value.mode === 'h5') {
                playerRef.value.player.play({
                    chlID: channelOsd.id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                } else {
                    playerRef.value.plugin.RetryStartChlView(channelOsd.id, channelOsd.name)
                }
            }
            setOcxData(channelOsd)
        }

        const setOcxData = (rowData: ChannelOsd) => {
            if (supportSHDB) return
            if (playerRef.value?.mode === 'h5') {
                setCanvasDrawerData(rowData)
            } else {
                if (osType == 'mac') {
                    const osdList: OcxXmlSetOsdListDatum[] = [
                        {
                            winIndex: 0,
                            dateFormat: rowData.dateFormat,
                            timeFormat: rowData.timeFormat,
                            x: rowData.timeX,
                            y: rowData.timeY,
                            xMin: rowData.timeXMinValue,
                            xMax: rowData.timeXMaxValue,
                            yMin: rowData.timeYMinValue,
                            yMax: rowData.timeXMaxValue,
                            status: rowData.displayTime ? 'ON' : 'OFF',
                        },
                        {
                            winIndex: 0,
                            osd: rowData.name,
                            x: rowData.nameX,
                            y: rowData.nameY,
                            xMin: rowData.nameXMinValue,
                            xMax: rowData.nameXMaxValue,
                            yMin: rowData.nameYMinValue,
                            yMax: rowData.nameYMaxValue,
                            status: rowData.displayTime ? 'ON' : 'OFF',
                        },
                    ]
                    const sendXML = OCX_XML_SetOSD('ON', osdList)
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                    playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                }
            }
        }

        const setCanvasDrawerData = (rowData: ChannelOsd) => {
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

        onMounted(() => {
            Plugin.SetPluginNotice('#layout2Content')
            formData.value.remarkDisabled = false
            formData.value.supportTimeFormat = true
            formData.value.supportDateFormat = true
            getDataList()
        })

        onBeforeUnmount(() => {
            if (playerRef.value?.mode === 'ocx') {
                Plugin.VideoPluginNotifyEmitter.removeListener(LiveNotify2Js)
                const sendXML = OCX_XML_StopPreview('ALL')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            DefaultPagerSizeOptions,
            DefaultPagerLayout,
            chlList,
            selectedChlId,
            tempName,
            dateFormatTip,
            dateFormatOptions,
            timeFormatTip,
            handleSizeChange,
            handleCurrentChange,
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
        }
    },
})
