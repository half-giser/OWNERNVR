/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-27 11:55:36
 * @Description:
 */
import { ChannelImage, ChannelLensCtrl, type ChannelScheduleInfo } from '@/types/apiType/channel'
import { cloneDeep } from 'lodash'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const pluginStore = usePluginStore()
        const Plugin = inject('Plugin') as PluginType
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelImage())
        const tableRef = ref()
        const tableData = ref<ChannelImage[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const scheduleLine = ref()
        const tipMsg = ref('')
        const tipImgIndex = ref(0)
        const tipVisiable = ref(false)
        const expandedRowKeys = ref<string[]>([])
        const defaultIRCutMode = ref('auto')
        const defaultRadioVal = false
        const defaultFocusMode = 'auto'
        const chlNameMaxLen = 40 // 通道名最大长度

        const timeMode = ref(24)
        let beforeEditData: ChannelImage

        let tmpShutterUpLimit: string | undefined
        let tmpShutterLowLimit: string | undefined
        let tmpDayTime = ''
        let tmpNightTime = ''
        let curAzChlId = ''

        const baseFloatErrorRef = ref()

        const tabKeys = {
            imageAdjust: 'imageAdjust',
            scheduleCtrl: 'scheduleCtrl',
            sceneCtrl: 'sceneCtrl',
        }
        const tabs = [
            {
                key: tabKeys.imageAdjust,
                text: Translate('IDCS_IMAGE_ADJUST'),
            },
            {
                key: tabKeys.scheduleCtrl,
                text: Translate('IDCS_SCHEDULE_CONTROL'),
            },
            {
                key: tabKeys.sceneCtrl,
                text: Translate('IDCS_SCENE_CONTROL'),
            },
        ]

        const statusToolTip: Record<string, string> = {
            loading: Translate('IDCS_DEVC_REQUESTING_DATA'),
            saveSuccess: Translate('IDCS_SAVE_DATA_SUCCESS'),
            saveFailed: Translate('IDCS_SAVE_DATA_FAIL'),
        }

        const configFileTypeMap: Record<string, string> = {
            normal: Translate('IDCS_DEFAULT_ORDINARY'),
            day: Translate('IDCS_DN_DAY'),
            night: Translate('IDCS_DN_NIGHT'),
        }

        const whiteBalanceMode: Record<string, string> = {
            auto: Translate('IDCS_WB_AUTO'),
            manual: Translate('IDCS_WB_MANUAL'),
            outdoor: Translate('IDCS_WB_OUTSIDE'),
            indoor: Translate('IDCS_WB_INSIDE'),
            atw: Translate('IDCS_WB_ATW'),
            lamp: Translate('IDCS_WB_LAMP'),
        }

        const BLCMode: Record<string, string> = {
            OFF: Translate('IDCS_OFF'),
            HWDR: 'HWDR',
            HLC: 'HLC',
            BLC: 'BLC',
        }

        const HWDRLevel: Record<string, string> = {
            high: Translate('IDCS_HWDR_HIGH'),
            medium: Translate('IDCS_HWDR_MEDIUM'),
            low: Translate('IDCS_HWDR_LOW'),
        }

        const DayNightModeMap: Record<string, string> = {
            auto: Translate('IDCS_DN_AUTO'),
            day: Translate('IDCS_DN_DAY'),
            night: Translate('IDCS_DN_NIGHT'),
            time: Translate('IDCS_DN_SCHEDULE'),
        }

        const SensortyMap: Record<string, string> = {
            high: Translate('IDCS_DN_SEN_HIGH'),
            mid: Translate('IDCS_DN_SEN_MID'),
            low: Translate('IDCS_DN_SEN_LOW'),
        }

        const SmartIRMap: Record<string, string> = {
            off: Translate('IDCS_OFF'),
            manual: Translate('IDCS_WB_MANUAL'),
            auto: Translate('IDCS_WB_AUTO'),
        }

        const antiFlickerMap: Record<string, string> = {
            OFF: Translate('IDCS_OFF'),
            '50HZ': '50HZ',
            '60HZ': '60HZ',
        }

        const exposureModeMap: Record<string, string> = {
            auto: Translate('IDCS_AUTO'),
            manual: Translate('IDCS_MANUAL'),
        }

        const infraredModeMap: Record<string, string> = {
            on: Translate('IDCS_ON'),
            off: Translate('IDCS_OFF'),
            auto: Translate('IDCS_AUTO'),
        }

        const paletteTypeMap: Record<string, string> = {
            whitehot: Translate('IDCS_COLOR_WHITE_HOT'),
            blackhot: Translate('IDCS_COLOR_BLACK_HOT'),
            rainbow: Translate('IDCS_COLOR_RAINBOW'),
            ironoxidered: Translate('IDCS_COLOR_IRONOXIDERED'),
            lava: Translate('IDCS_COLOR_LAVA'),
            sky: Translate('IDCS_COLOR_SKY'),
        }

        const scheduleMap: Record<string, string> = {
            normal: Translate('IDCS_DEFAULT_ORDINARY'),
            auto: Translate('IDCS_AUTO'),
            day: Translate('IDCS_DN_DAY'),
            night: Translate('IDCS_DN_NIGHT'),
            time: Translate('IDCS_DN_SCHEDULE'),
        }

        const rebootTipMap: Record<string, string> = {
            sharpen: Translate('IDCS_SHARPNESS'),
            denoise: Translate('IDCS_DENOISE'),
            backlightCompensation: Translate('IDCS_BACKLIGHT_COMPENSATION'),
            whiteBalance: Translate('IDCS_WB'),
            antiFlicker: Translate('IDCS_ANTI_FLICKER'),
            autoExposureMode: Translate('IDCS_EXPOSURE_MODE'),
            gain: Translate('IDCS_GAIN_MODE'),
            imageRotate: Translate('IDCS_CORRIDOR_MODE'),
            mirrorSwitch: Translate('IDCS_MIRROR'),
            flipSwitch: Translate('IDCS_FLIP'),
            HFR: Translate('IDCS_HFR'),
            IRCutMode: Translate('IDCS_DN_MODE'),
            smartIr: Translate('IDCS_SMART_IR'),
            shutter: Translate('IDCS_SHUTTER_MODE'),
            InfraredMode: Translate('IDCS_INFRARE_MODE'),
            whiteLight: Translate('IDCS_WHITE_LIGHT'),
        }

        const isSupportH5 = computed(() => {
            return Plugin.IsSupportH5()
        })

        const handleSizeChange = (val: number) => {
            pageSize.value = val
            getDataList()
        }

        const handleCurrentChange = (val: number) => {
            pageIndex.value = val
            getDataList()
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)
            // if (azList[tableData.value.indexOf(rowData)]) curLensCtrl.value = azList[tableData.value.indexOf(rowData)]
            formData.value = cloneDeep(rowData)
            beforeEditData = cloneDeep(rowData)
            tableRef.value.setCurrentRow(rowData)
            if (!rowData.disabled && !rowData.isSupportThermal) {
                getSupportAz(chlId)
                if (expandedRowKeys.value.length != 0) expandedRowKeys.value = [chlId]
            }
        }

        const handlePaletteCode = () => {
            const rowData = getRowById(selectedChlId.value)
            rowData.paletteCode = formData.value.paletteCode
            setData(rowData)
        }

        const handleAdvanced = () => {
            if (!expandedRowKeys.value.includes(selectedChlId.value)) {
                expandedRowKeys.value = [selectedChlId.value]
                getSupportAz(selectedChlId.value)
            }
        }

        const handleRestoreVal = () => {
            const rowData = getRowById(selectedChlId.value)
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_MP_RESTORE_VALUE').formatForLang(rowData.name.length > chlNameMaxLen ? rowData.name.substring(0, chlNameMaxLen) + '...' : rowData.name),
            })
                .then(() => {
                    if (rowData.isSupportThermal) {
                        rowData.paletteCode = rowData.defaultPaletteCode
                    } else {
                        rowData.bright = rowData.brightDefaultValue
                        rowData.contrast = rowData.contrastDefaultValue
                        rowData.saturation = rowData.saturationDefaultValue
                        rowData.hue = rowData.hueDefaultValue

                        if (rowData.sharpenSwitch !== undefined) {
                            rowData.sharpenValue = rowData.sharpenDefaultValue
                            rowData.sharpenSwitch = false
                        }
                        if (rowData.denoiseSwitch !== undefined) {
                            rowData.denoiseValue = rowData.denoiseDefaultValue
                            rowData.denoiseSwitch = false
                        }
                        if (rowData.HFR !== undefined) {
                            rowData.HFR = false
                        }
                        if (rowData.whiteBalanceMode !== undefined) rowData.whiteBalanceMode = 'auto'
                        if (rowData.BLCModeDefault !== undefined) rowData.BLCMode = rowData.BLCModeDefault
                        if (rowData.HWDRLevelDefault !== undefined) rowData.HWDRLevel = rowData.HWDRLevelDefault
                        if (rowData.blueDefaultValue !== undefined) rowData.blueValue = rowData.blueDefaultValue
                        if (rowData.imageDefaultValue !== undefined) rowData.imageValue = rowData.imageDefaultValue
                        if (rowData.redDefaultValue !== undefined) rowData.redValue = rowData.redDefaultValue
                        if (rowData.WDRSwitch !== undefined) {
                            rowData.WDRValue = rowData.WDRDefaultValue
                            rowData.WDRSwitch = false
                        }
                        if (rowData.mirrorSwitch !== undefined) rowData.mirrorSwitch = false
                        if (rowData.flipSwitch !== undefined) rowData.flipSwitch = false
                        if (rowData.imageRotate !== undefined) rowData.imageRotate = rowData.imageRotateDef
                        if (rowData.IRCutMode !== undefined) {
                            rowData.IRCutMode = rowData.IRCutModeDef
                            rowData.IRCutConvSen = rowData.IRCutConvSenDef
                        }
                        // todo
                        if (rowData.smartIrModeDefault !== undefined) {
                            rowData.smartIrMode = rowData.smartIrModeDefault
                            rowData.lightLevelValue = rowData.lightLevelDefaultValue
                        }
                        if (rowData.smartIrSwitchDefault !== undefined) {
                            rowData.smartIrSwitch = rowData.smartIrSwitchDefault
                            rowData.smartIrLevel = rowData.smartIrLevelDefault
                        }
                        if (rowData.defogSwitch !== undefined) {
                            rowData.defogValue = rowData.defogDefaultValue
                            rowData.defogSwitch = false
                        }
                        if (rowData.antiflicker !== undefined) {
                            rowData.antiflicker = rowData.antiflickerDefault
                        }
                        if (rowData.exposureMode !== undefined) {
                            rowData.exposureMode = rowData.exposureModeDefault
                            rowData.exposureModeValue = rowData.exposureModeDefaultValue
                        }
                        if (rowData.delayTimeValue !== undefined) rowData.delayTimeValue = rowData.delayTimeDefaultValue
                        if (rowData.InfraredMode !== undefined) rowData.InfraredMode = rowData.InfraredModeDefault
                        if (rowData.gainValue !== undefined) {
                            rowData.gainMode = rowData.gainModeDefault
                            rowData.gainValue = rowData.gainDefaultValue
                            rowData.gainAGC = rowData.gainAGCDefaultValue
                        }
                        if (rowData.shutterMode !== undefined) {
                            rowData.shutterMode = rowData.shutterModeDefault
                            rowData.shutterValue = rowData.shutterValueDefault
                            rowData.shutterUpLimit = rowData.shutterUpLimitDefault
                            rowData.shutterLowLimit = rowData.shutterLowLimitDefault
                        }
                        setAZData()
                    }
                    formData.value = cloneDeep(rowData)
                    // beforeEditData = cloneDeep(rowData)
                    setData(rowData)
                })
                .catch(() => {})
        }

        const handleKeydownEnter = (event: any) => {
            event.target.blur()
        }

        const handleExpandChange = (row: ChannelImage, expandedRows: ChannelImage[]) => {
            if (!row.disabled) {
                selectedChlId.value = row.id
                tmpShutterUpLimit = row.shutterUpLimit
                tmpShutterLowLimit = row.shutterLowLimit
                tmpDayTime = row.scheduleInfo.dayTime
                tmpNightTime = row.scheduleInfo.nightTime
                // if (azList[tableData.value.indexOf(row)]) curLensCtrl.value = azList[tableData.value.indexOf(row)]
                tableRef.value.setCurrentRow(row)
                formData.value = cloneDeep(row)
                beforeEditData = cloneDeep(row)
                getSupportAz(row.id)
            }
            if (!row.disabled && !row.isSupportThermal) {
                if (expandedRowKeys.value.includes(row.id)) {
                    expandedRowKeys.value = []
                } else {
                    expandedRowKeys.value = [row.id]
                }
            } else {
                expandedRowKeys.value = expandedRows.map((item) => item.id).filter((item) => item != row.id)
            }
        }

        const handleInputChange = (val: number | undefined, chlId: string, type: 'bright' | 'contrast' | 'saturation' | 'hue') => {
            const rowData = getRowById(chlId)
            rowData[type] = val
            setData(rowData)
            if (chlId == selectedChlId.value) {
                formData.value = cloneDeep(rowData)
            }
        }

        const handleRowClick = (rowData: ChannelImage) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = cloneDeep(rowData)
                beforeEditData = cloneDeep(rowData)
            }
            tableRef.value.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleCfgFileChange = () => {
            const rowData = getRowById(selectedChlId.value)
            getData(selectedChlId.value, false, rowData.cfgFile, () => {
                // todo
                rowData.scheduleInfo.program = tmpScheduleInfoList[tableData.value.indexOf(rowData)].program
            })
        }

        const handleImageValueChange = (val: number) => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.chlType !== 'analog' || rowData.imageMaxValue == undefined) return
            rowData.imageValue! += val
            setAZData()
        }

        const handleExposureModeChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.gainMode !== undefined) rowData.gainMode = rowData.exposureMode == 'manual' ? '1' : '0'
            setAZData()
        }

        const handleShutterUpLimitChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterLowLimit != undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterUpLimit = tmpShutterUpLimit
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'),
                    showCancelButton: false,
                })
                return
            }
            tmpShutterUpLimit = rowData.shutterUpLimit
            setAZData()
        }

        const handleShutterLowLimitChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterUpLimit != undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterLowLimit = tmpShutterLowLimit
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'),
                    showCancelButton: false,
                })
                return
            }
            tmpShutterLowLimit = rowData.shutterLowLimit
            setAZData()
        }

        const handleIRCutModeChange = () => {
            const rowData = getRowById(selectedChlId.value)
            rowData.IRCutMode = defaultIRCutMode.value
            defaultIRCutMode.value = 'auto'
            setAZData()
        }

        /**
         *
         * @param setSchedule
         * @param noRebootPrompt 是否需要重启提示判断（默认需要)
         */
        const setAZData = (setSchedule?: boolean, noRebootPrompt?: boolean) => {
            if (!curAzChlId) return
            const rowData = getRowById(curAzChlId)
            let data = `
                <content>
                    <chl id='${rowData.id}'>
                    <rebootPrompt>${noRebootPrompt ? 'false' : 'true'}</rebootPrompt>`
            if (rowData.sharpenValue !== undefined)
                data += `
                    <sharpen>
                        <switch>${rowData.sharpenSwitch}</switch>
                        <value>${rowData.sharpenValue}</value>
                    </sharpen>`
            if (rowData.denoiseValue !== undefined)
                data += `
                    <denoise>
                        <switch>${rowData.denoiseSwitch}</switch>
                        <value>${rowData.denoiseValue}</value>
                    </denoise>`
            if (rowData.WDRSwitch !== undefined)
                data += `
                    <WDR>
                        <switch>${rowData.WDRSwitch}</switch>
                        <value>${rowData.WDRValue}</value>
                    </WDR>`
            if (rowData.imageValue !== undefined) data += `<imageShift>${rowData.imageValue}</imageShift>`
            if (rowData.whiteBalanceMode !== undefined)
                data += `
                    <whiteBalance>
                        <mode>${rowData.whiteBalanceMode}</mode>
                        <red>${rowData.redValue}</red>
                        <blue>${rowData.blueValue}</blue>
                    </whiteBalance>`
            if (rowData.mirrorSwitch !== undefined) data += `<mirrorSwitch>${rowData.mirrorSwitch}</mirrorSwitch>`
            if (rowData.flipSwitch !== undefined) data += `<flipSwitch>${rowData.flipSwitch}</flipSwitch>`
            if (rowData.BLCMode !== undefined)
                data += `
                    <backlightCompensation>
                        <mode>${rowData.BLCMode}</mode>
                        <HWDRLevel>${rowData.HWDRLevel}</HWDRLevel>
                    </backlightCompensation>`
            if (rowData.cfgFile !== undefined) data += `<cfgFile>${rowData.cfgFile}</cfgFile>`
            if (rowData.HFR !== undefined) data += `<HFR>${rowData.HFR}</HFR>`
            if (rowData.imageRotate !== undefined) data += `<imageRotate>${rowData.imageRotate}</imageRotate>`
            if (rowData.IRCutMode !== undefined && rowData.IRCutMode) {
                data += `<IRCutMode>${rowData.IRCutMode}</IRCutMode>`
                if (rowData.IRCutDayTime !== undefined) data += `<IRCutDayTime>${rowData.IRCutDayTime}</IRCutDayTime>`
                if (rowData.IRCutNightTime !== undefined) data += `<IRCutNightTime>${rowData.IRCutNightTime}</IRCutNightTime>`
                if (rowData.IRCutConvSen !== undefined) data += `<IRCutConvSen>${rowData.IRCutConvSen}</IRCutConvSen>`
            }
            if (rowData.smartIrMode !== undefined)
                data += `
                    <smartIr>
                        <mode>${rowData.smartIrMode}</mode>
                        <lightLevel_1>${rowData.lightLevelValue}</lightLevel_1>
                    </smartIr>`
            if (rowData.smartIrSwitch !== undefined)
                data += `
                    <smartIR>
                        <switch type='boolean' default='false'>${rowData.smartIrSwitch}</switch>
                        <level>${rowData.smartIrLevel}</level>
                    </smartIR>`
            if (rowData.defogSwitch !== undefined)
                data += `
                    <fogReduction>
                        <switch>${rowData.defogSwitch}</switch>
                        <value>${rowData.defogValue}</value>
                    </fogReduction>`
            if (rowData.antiflicker !== undefined) data += `<antiflicker>${rowData.antiflicker}</antiflicker>`
            if (rowData.exposureMode !== undefined)
                data += `
                    <autoExposureMode>
                        <mode>${rowData.exposureMode}</mode>
                        <value>${rowData.exposureModeValue}</value>
                    </autoExposureMode>
                    <gain>
                        <mode>${rowData.gainMode}</mode>
                        <value>${rowData.gainValue}</value>
                        <AGC>${rowData.gainAGC}</AGC>
                    </gain>`
            if (rowData.delayTimeValue !== undefined) data += `<IRCutDelayTime>${rowData.delayTimeValue}</IRCutDelayTime>`
            if (rowData.InfraredMode !== undefined) data += `<InfraredMode>${rowData.InfraredMode}</InfraredMode>`
            if (rowData.shutterMode !== undefined)
                data += `
                    <shutter>
                        <mode>${rowData.shutterMode}</mode>
                        <value>${rowData.shutterValue}</value>
                        ${rowData.shutterLowLimit === undefined ? '' : '<lowLimit>' + rowData.shutterLowLimit + '</lowLimit>'}
                        ${rowData.shutterUpLimit === undefined ? '' : '<upLimit>' + rowData.shutterUpLimit + '</upLimit>'}
                    </shutter>`
            if (rowData.whitelightMode !== undefined)
                data += `
                    <Whitelight>
                        <WhitelightMode type='WhitelightMode' default='off'>${rowData.whitelightMode}</WhitelightMode>
                        <WhitelightStrength type="uint32" min="1" max="100" default="50">${rowData.whitelightStrength}</WhitelightStrength>
                        <WhitelightOnTime type="string" default="00:00">${rowData.whitelightOnTime}</WhitelightOnTime>
                        <WhitelightOffTime type="string" default="23:59">${rowData.whitelightOffTime}</WhitelightOffTime>
                    </Whitelight>`
            if (setSchedule)
                data += `
                    <scheduleInfo>
                        <program>${rowData.scheduleInfo.scheduleType == 'time' ? 'time' : rowData.scheduleInfo.program}</program>
                        <dayTime>${rowData.scheduleInfo.dayTime}</dayTime>
                        <nightTime>${rowData.scheduleInfo.nightTime}</nightTime>
                    </scheduleInfo>`
            data += '</chl></content>'
            editChlVideoParam(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    baseFloatErrorRef.value.show('#divTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                } else {
                    const rebootParam = res('rebootParam').text()
                    if (rebootParam) {
                        judgeReboot(rebootParam, () => {
                            setAZData(setSchedule, true)
                        })
                    } else {
                        const errorCode = res('errorCode').text()
                        let msg = Translate('IDCS_SAVE_DATA_FAIL')
                        if (errorCode == '536870935' || errorCode == '536870962') msg = Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                        baseFloatErrorRef.value.show('#divTip', msg)
                    }
                }
            })
        }

        const getTimeCfg = () => {
            queryTimeCfg().then((res: any) => {
                timeMode.value = Number(queryXml(res)('content/formatInfo/time').text())
            })
        }

        const getDataList = () => {
            openLoading(LoadingTarget.FullScreen)
            getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportImageSetting: true,
                requireField: ['supportIRCutMode'],
            }).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    getHallwayChlIds((chlIds: string[]) => {
                        const rowData: ChannelImage[] = []
                        res('content/item').forEach((ele: any) => {
                            const eleXml = queryXml(ele.element)
                            const chlId = ele.attr('id'),
                                isSupportHallway = chlIds.includes(chlId)
                            const newData = new ChannelImage()
                            newData.id = chlId
                            newData.name = eleXml('name').text()
                            newData.chlType = eleXml('chlType').text()
                            newData.status = 'loading'
                            newData.statusTip = statusToolTip['loading']
                            newData.isSupportHallway = isSupportHallway
                            newData.isSupportIRCutMode = eleXml('supportIRCutMode').text().toBoolean()
                            newData.isSupportThermal = eleXml('AccessType').text() === '1'
                            rowData.push(newData)
                        })
                        tableData.value = rowData
                        pageTotal.value = Number(res('content').attr('total'))
                        expandedRowKeys.value = []
                        azList = []
                        tmpScheduleInfoList = []

                        if (rowData.length == 0) return
                        selectedChlId.value = rowData[0].id
                        tableRef.value.setCurrentRow(rowData[0])
                        formData.value = cloneDeep(rowData[0])
                        beforeEditData = cloneDeep(rowData[0])

                        //请求显示设置数据
                        rowData.forEach((ele) => {
                            if (ele.chlType != 'recorder') {
                                getData(ele.id, true, false)
                            } else {
                                ele.status = ''
                                if (ele.id == selectedChlId.value) {
                                    formData.value = cloneDeep(ele)
                                }
                            }
                        })
                    })
                } else {
                    selectedChlId.value = ''
                }
            })
        }

        const getHallwayChlIds = (callback: Function) => {
            getChlList({
                pageIndex: pageIndex.value || 1, // todo 老代码没传
                pageSize: pageSize.value,
                isSupportImageRotate: true,
            }).then((res: any) => {
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    const chlIds: string[] = []
                    res('content/item').forEach((ele: any) => {
                        chlIds.push(ele.attr('id'))
                    })
                    callback(chlIds)
                }
            })
        }

        let tmpScheduleInfoList: ChannelScheduleInfo[] = []
        const getData = (chlId: string, needSchedule: boolean, cfgFile: string | boolean | undefined, callback?: Function) => {
            const data = `
                <condition>
                    <chlId>${chlId}</chlId>
                    ${needSchedule ? '<scheduleInfo></scheduleInfo>' : ''}
                    ${cfgFile ? '<cfgFile>' + cfgFile + '</cfgFile>' : ''}
                </condition>`
            queryChlVideoParam(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                const rowData = getRowById(chlId)
                if (res('status').text() == 'success') {
                    let isSpeco = false
                    rowData.bright = res('content/chl/bright').length > 0 ? Number(res('content/chl/bright').text()) : undefined
                    rowData.contrast = res('content/chl/contrast').length > 0 ? Number(res('content/chl/contrast').text()) : undefined
                    rowData.hue = res('content/chl/hue').length > 0 ? Number(res('content/chl/hue').text()) : -1 // todo NT2-3481 设备接入海康IPC，协议不返回hue节点，“色调”配置项置灰
                    rowData.saturation = res('content/chl/saturation').length > 0 ? Number(res('content/chl/saturation').text()) : undefined
                    rowData.status = ''
                    rowData.disabled = false

                    if (res('content/chl').length == 0 || chlId != res('content/chl').attr('id')) {
                        isSpeco = true
                    }
                    rowData.isSpeco = rowData.disabled = isSpeco
                    if (res('content/chl/palette').length > 0) {
                        rowData.paletteCode = res('content/chl/palette/color').text()
                        rowData.defaultPaletteCode = res('content/chl/palette/color').attr('default')
                        res('types/paletteType/enum').forEach((ele: any) => {
                            rowData.paletteList.push({
                                value: ele.text(),
                                text: paletteTypeMap[ele.text()],
                            })
                        })
                    }

                    if (res('content/chl/bright').text()) {
                        rowData.brightMinValue = Number(res('content/chl/bright').attr('min'))
                        rowData.brightMaxValue = Number(res('content/chl/bright').attr('max'))
                        rowData.brightDefaultValue = Number(res('content/chl/bright').attr('default'))
                    }
                    if (res('content/chl/contrast').text()) {
                        rowData.contrastMinValue = Number(res('content/chl/contrast').attr('min'))
                        rowData.contrastMaxValue = Number(res('content/chl/contrast').attr('max'))
                        rowData.contrastDefaultValue = Number(res('content/chl/contrast').attr('default'))
                    }
                    if (res('content/chl/hue').text()) {
                        rowData.hueMinValue = Number(res('content/chl/hue').attr('min'))
                        rowData.hueMaxValue = Number(res('content/chl/hue').attr('max'))
                        rowData.hueDefaultValue = Number(res('content/chl/hue').attr('default'))
                    }
                    if (res('content/chl/saturation').text()) {
                        rowData.saturationMinValue = Number(res('content/chl/saturation').attr('min'))
                        rowData.saturationMaxValue = Number(res('content/chl/saturation').attr('max'))
                        rowData.saturationDefaultValue = Number(res('content/chl/saturation').attr('default'))
                    }

                    res('content/chl').forEach(() => {
                        rowData.cfgFile = res('content/chl/cfgFile').text()
                        rowData.cfgFileDefault = res('content/chl/cfgFile').attr('default')
                        if (res('content/chl/denoise/value').text()) {
                            rowData.denoiseValue = Number(res('content/chl/denoise/value').text())
                            rowData.denoiseDefaultValue = Number(res('content/chl/denoise/value').attr('default'))
                            rowData.denoiseMinValue = Number(res('content/chl/denoise/value').attr('min'))
                            rowData.denoiseMaxValue = Number(res('content/chl/denoise/value').attr('max'))
                        }
                        rowData.denoiseSwitch = res('content/chl/denoise/switch').text().toBoolean()
                        rowData.ShowGainMode = res('content/chl/ShowGainMode').text() // todo NT2-3947 此节点为false, 则为4.2.1版本ipc，隐藏增益模式

                        if (res('content/chl/WDR/value').text()) {
                            rowData.WDRDefaultValue = Number(res('content/chl/WDR/value').attr('default'))
                            rowData.WDRMinValue = Number(res('content/chl/WDR/value').attr('min'))
                            rowData.WDRMaxValue = Number(res('content/chl/WDR/value').attr('max'))
                            rowData.WDRValue = Number(res('content/chl/WDR/value').text())
                        }
                        if (res('content/chl/WDR/switch').text()) rowData.WDRSwitch = res('content/chl/WDR/switch').text().toBoolean()

                        if (res('content/chl/whiteBalance/red').text()) {
                            rowData.redDefaultValue = Number(res('content/chl/whiteBalance/red').attr('default'))
                            rowData.redMinValue = Number(res('content/chl/whiteBalance/red').attr('min'))
                            rowData.redMaxValue = Number(res('content/chl/whiteBalance/red').attr('max'))
                            rowData.redValue = Number(res('content/chl/whiteBalance/red').text())
                        }
                        rowData.HFR = res('content/chl/HFR').text().length > 0 ? res('content/chl/HFR').text().toBoolean() : undefined
                        rowData.whiteBalanceMode = res('content/chl/whiteBalance/mode').length > 0 ? res('content/chl/whiteBalance/mode').text() : undefined

                        if (res('content/chl/whiteBalance/blue').text()) {
                            rowData.blueDefaultValue = Number(res('content/chl/whiteBalance/blue').attr('default'))
                            rowData.blueMinValue = Number(res('content/chl/whiteBalance/blue').attr('min'))
                            rowData.blueMaxValue = Number(res('content/chl/whiteBalance/blue').attr('max'))
                            rowData.blueValue = Number(res('content/chl/whiteBalance/blue').text())
                        }

                        rowData.IRCutMode = res('content/chl/IRCutMode').length > 0 ? res('content/chl/IRCutMode').text() : undefined
                        rowData.IRCutModeDef = res('content/chl/IRCutMode').length > 0 ? res('content/chl/IRCutMode').attr('default') : undefined
                        rowData.IRCutConvSen = res('content/chl/IRCutConvSen').length > 0 ? res('content/chl/IRCutConvSen').text() : 'mid'
                        rowData.IRCutConvSen2 = res('content/chl/IRCutConvSen').length > 0 ? res('content/chl/IRCutConvSen').text() : undefined
                        rowData.IRCutConvSenDef = res('content/chl/IRCutConvSen').attr('default')
                        rowData.IRCutDayTime = res('content/chl/IRCutDayTime').length ? res('content/chl/IRCutDayTime').text() : undefined
                        rowData.IRCutNightTime = res('content/chl/IRCutNightTime').length ? res('content/chl/IRCutNightTime').text() : undefined
                        // todo

                        if (res('content/chl/sharpen/value').text()) {
                            rowData.sharpenDefaultValue = Number(res('content/chl/sharpen/value').attr('default'))
                            rowData.sharpenMinValue = Number(res('content/chl/sharpen/value').attr('min'))
                            rowData.sharpenMaxValue = Number(res('content/chl/sharpen/value').attr('max'))
                            rowData.sharpenValue = Number(res('content/chl/sharpen/value').text())
                        }
                        rowData.sharpenSwitch = res('content/chl/sharpen/switch').text().toBoolean()
                        rowData.sharpenSwitchEnable = res('content/chl/sharpen/switch').attr('switchEnabled') && !res('content/chl/sharpen/switch').attr('switchEnabled').toBoolean() ? false : true

                        rowData.mirrorSwitch = res('content/chl/mirrorSwitch').length > 0 ? res('content/chl/mirrorSwitch').text().toBoolean() : undefined
                        rowData.flipSwitch = res('content/chl/flipSwitch').length > 0 ? res('content/chl/flipSwitch').text().toBoolean() : undefined
                        rowData.imageRotate = res('content/chl/imageRotate').text()
                        rowData.imageRotateDef = res('content/chl/imageRotate').attr('default')

                        if (res('content/chl/imageShift').text()) {
                            rowData.imageDefaultValue = Number(res('content/chl/imageShift').attr('default'))
                            rowData.imageMinValue = Number(res('content/chl/imageShift').attr('min'))
                            rowData.imageMaxValue = Number(res('content/chl/imageShift').attr('max'))
                            rowData.imageValue = Number(res('content/chl/imageShift').text())
                        }

                        rowData.BLCMode = res('content/chl/backlightCompensation/mode').length > 0 ? res('content/chl/backlightCompensation/mode').text() : undefined
                        rowData.BLCModeDefault = res('content/chl/backlightCompensation/mode').attr('default')
                        rowData.HWDRLevel = res('content/chl/backlightCompensation/HWDRLevel').length > 0 ? res('content/chl/backlightCompensation/HWDRLevel').text() : undefined
                        rowData.HWDRLevelDefault = res('content/chl/backlightCompensation/HWDRLevel').attr('default')

                        if (res('content/chl/smartIr/mode').text()) {
                            rowData.smartIrMode = res('content/chl/smartIr/mode').text()
                            rowData.smartIrModeDefault = res('content/chl/smartIr/mode').attr('default')
                            rowData.lightLevelDefaultValue = Number(res('content/chl/smartIr/lightLevel_1').attr('default'))
                            rowData.lightLevelMinValue = Number(res('content/chl/smartIr/lightLevel_1').attr('min'))
                            rowData.lightLevelMaxValue = Number(res('content/chl/smartIr/lightLevel_1').attr('max'))
                            rowData.lightLevelValue = Number(res('content/chl/smartIr/lightLevel_1').text())
                        }
                        if (res('content/chl/smartIR').text()) {
                            rowData.smartIrSwitch = res('content/chl/smartIR/switch').text().length > 0 ? res('content/chl/smartIR/switch').text().toBoolean() : undefined
                            rowData.smartIrSwitchDefault = res('content/chl/smartIR/switch').attr('default')
                            rowData.smartIrLevel = res('content/chl/smartIR/level').text()
                            rowData.smartIrLevelDefault = res('content/chl/smartIR/level').attr('default')
                        }
                        // 透雾
                        if (res('content/chl/fogReduction/value').text()) {
                            rowData.defogValue = Number(res('content/chl/fogReduction/value').text())
                            rowData.defogDefaultValue = Number(res('content/chl/fogReduction/value').attr('default'))
                            rowData.defogMinValue = Number(res('content/chl/fogReduction/value').attr('min'))
                            rowData.defogMaxValue = Number(res('content/chl/fogReduction/value').attr('max'))
                            rowData.defogSwitch = res('content/chl/fogReduction/switch').length > 0 ? res('content/chl/fogReduction/switch').text().toBoolean() : undefined
                        }
                        // 抗闪
                        if (res('content/chl/antiflicker').text()) {
                            rowData.antiflicker = res('content/chl/antiflicker').text()
                            rowData.antiflickerDefault = res('content/chl/antiflicker').attr('default')
                        }
                        // 曝光模式
                        if (res('content/chl/autoExposureMode/mode').text()) {
                            rowData.exposureMode = res('content/chl/autoExposureMode/mode').text()
                            rowData.exposureModeDefault = res('content/chl/autoExposureMode/mode').attr('default')
                            rowData.exposureModeValue = Number(res('content/chl/autoExposureMode/value').text())
                            rowData.exposureModeDefaultValue = Number(res('content/chl/autoExposureMode/value').attr('default'))
                            rowData.exposureModeMinValue = Number(res('content/chl/autoExposureMode/value').attr('min'))
                            rowData.exposureModeMaxValue = Number(res('content/chl/autoExposureMode/value').attr('max'))
                        }
                        // 延迟时间
                        if (res('content/chl/IRCutDelayTime').text()) {
                            rowData.delayTimeValue = Number(res('content/chl/IRCutDelayTime').text())
                            rowData.delayTimeDefaultValue = Number(res('content/chl/IRCutDelayTime').attr('default'))
                            rowData.delayTimeMinValue = Number(res('content/chl/IRCutDelayTime').attr('min'))
                            rowData.delayTimeMaxValue = Number(res('content/chl/IRCutDelayTime').attr('max'))
                        }
                        // 红外模式
                        if (res('content/chl/InfraredMode').text()) {
                            rowData.InfraredMode = res('content/chl/InfraredMode').text()
                            rowData.InfraredModeDefault = res('content/chl/InfraredMode').attr('default')
                        }
                        // 增益限制
                        if (res('content/chl/gain/mode').text()) {
                            rowData.gainMode = res('content/chl/gain/mode').text()
                            rowData.gainModeDefault = res('content/chl/gain/mode').attr('default')
                            rowData.gainValue = Number(res('content/chl/gain/value').text())
                            rowData.gainAGC = Number(res('content/chl/gain/AGC').text())
                            rowData.gainAGCDefaultValue = Number(res('content/chl/gain/AGC').attr('default'))
                            rowData.gainDefaultValue = Number(res('content/chl/gain/value').attr('default'))
                            rowData.gainMinValue = Number(res('content/chl/gain/value').attr('min'))
                            rowData.gainMaxValue = Number(res('content/chl/gain/value').attr('max'))
                        }
                        // 获取IPC设备版本号判断是否支持增益模式配置
                        rowData.IPCVersion = res('content/chl/DetailedSoftwareVersion').text() || ''
                        // 快门
                        if (res('content/chl/shutter').text()) {
                            rowData.shutterMode = res('content/chl/shutter/mode').text()
                            rowData.shutterModeDefault = res('content/chl/shutter/mode').attr('default')
                            rowData.shutterValue = res('content/chl/shutter/value').text()
                            rowData.shutterValueDefault = res('content/chl/shutter/value').attr('default')
                            rowData.shutterLowLimit = res('content/chl/shutter/lowLimit').length > 0 ? res('content/chl/shutter/lowLimit').text() : undefined
                            rowData.shutterLowLimitDefault = res('content/chl/shutter/lowLimit').attr('default')
                            rowData.shutterUpLimit = res('content/chl/shutter/upLimit').text()
                            rowData.shutterUpLimitDefault = res('content/chl/shutter/upLimit').attr('default')
                        }
                        if (needSchedule) {
                            // todo 逻辑已修改
                            if (res('content/chl/scheduleInfo').text()) {
                                rowData.supportSchedule = true
                                rowData.scheduleInfo.program = res('content/chl/scheduleInfo/program').text()
                                rowData.scheduleInfo.dayTime = res('content/chl/scheduleInfo/dayTime').text()
                                rowData.scheduleInfo.nightTime = res('content/chl/scheduleInfo/nightTime').text()
                                res('content/chl/scheduleInfo/types/progType/enum').forEach((ele: any) => {
                                    rowData.scheduleInfo.scheduleInfoEnum.push(ele.text())
                                })

                                if (rowData.scheduleInfo.program == 'time') rowData.scheduleInfo.scheduleType = 'time'

                                tmpScheduleInfoList[tableData.value.indexOf(rowData)] = cloneDeep(rowData.scheduleInfo)
                            } else {
                                rowData.supportSchedule = false
                            }
                        } else {
                            rowData.supportSchedule = rowData.supportSchedule || false
                        }
                        // 白光灯
                        if (res('content/chl/Whitelight').text()) {
                            rowData.whitelightMode = res('content/chl/Whitelight/WhitelightMode').text()
                            rowData.whitelightModeDefault = res('content/chl/Whitelight/WhitelightMode').attr('default')
                            rowData.whitelightStrength = Number(res('content/chl/Whitelight/WhitelightStrength').text())
                            rowData.whitelightStrengthMin = Number(res('content/chl/Whitelight/WhitelightStrength').attr('min'))
                            rowData.whitelightStrengthMax = Number(res('content/chl/Whitelight/WhitelightStrength').attr('max'))
                            rowData.whitelightStrengthDefault = Number(res('content/chl/Whitelight/WhitelightStrength').attr('default'))
                            rowData.whitelightOnTime = res('content/chl/Whitelight/WhitelightOnTime').text()
                            rowData.whitelightOnTimeDefault = res('content/chl/Whitelight/WhitelightOnTime').attr('default')
                            rowData.whitelightOffTime = res('content/chl/Whitelight/WhitelightOffTime').text()
                            rowData.whitelightOffTimeDefault = res('content/chl/Whitelight/WhitelightOffTime').attr('default')
                        }
                    })
                    rowData.configFileTypeEnum = []
                    res('types/configFileType/enum').forEach((ele: any) => {
                        rowData.configFileTypeEnum.push(ele.text())
                    })
                    rowData.shutterModeEnum = []
                    res('types/shutterMode/enum').forEach((ele: any) => {
                        rowData.shutterModeEnum.push(ele.text())
                    })
                    rowData.shutterValueEnum = []
                    res('types/shutterValue/enum').forEach((ele: any) => {
                        rowData.shutterValueEnum.push(ele.text())
                    })
                    rowData.whiteBalanceModeEnum = []
                    res('types/whiteBalance/enum').forEach((ele: any) => {
                        rowData.whiteBalanceModeEnum.push(ele.text())
                    })
                    rowData.BLCModeArray = []
                    res('types/BLCMode/enum').forEach((ele: any) => {
                        rowData.BLCModeArray.push(ele.text())
                    })
                    rowData.HWDRLevelArray = []
                    res('types/HWDRLevel/enum').forEach((ele: any) => {
                        rowData.HWDRLevelArray.push(ele.text())
                    })
                    rowData.IRCutModeArray = []
                    res('types/IRCutMode/enum').forEach((ele: any) => {
                        rowData.IRCutModeArray.push(ele.text())
                    })
                    rowData.IRCutConvSenArray = []
                    res('types/IRCutConvSen/enum').forEach((ele: any) => {
                        rowData.IRCutConvSenArray.push(ele.text())
                    })
                    rowData.SmartIrArray = []
                    res('types/SmartIRMode/enum').forEach((ele: any) => {
                        rowData.SmartIrArray.push(ele.text())
                    })
                    rowData.antiflickerModeArray = []
                    res('types/antiflickerMode/enum').forEach((ele: any) => {
                        rowData.antiflickerModeArray.push(ele.text())
                    })
                    rowData.InfraredModeArray = []
                    res('types/InfraredMode/enum').forEach((ele: any) => {
                        rowData.InfraredModeArray.push(ele.text())
                    })
                    rowData.exposureModeArray = []
                    res('types/autoExposureMode/enum').forEach((ele: any) => {
                        rowData.exposureModeArray.push(ele.text())
                    })
                    rowData.exposureValueArray = []
                    res('types/autoExposureValue/enum').forEach((ele: any) => {
                        rowData.exposureValueArray.push(ele.text())
                    })
                    rowData.gainModeEnum = []
                    res('types/gainMode/enum').forEach((ele: any) => {
                        rowData.gainModeEnum.push(ele.text())
                    })
                    if (chlId == selectedChlId.value) {
                        formData.value = cloneDeep(rowData)
                    }
                    if (callback) callback()
                } else {
                    rowData.status = ''
                    if (chlId == selectedChlId.value) {
                        formData.value = cloneDeep(rowData)
                    }
                }
            })
        }

        /**
         * 编辑通道视频参数
         * @param rowData
         * @param noRebootPrompt 是否需要重启提示判断（默认需要）
         */
        const setData = (rowData: ChannelImage, noRebootPrompt = false) => {
            let data = '<content>'
            if (rowData.paletteCode) {
                data += `
                    <chl id='${rowData.id}'>
                        <rebootPrompt>${!noRebootPrompt}</rebootPrompt>
                        <palette>
                            <color type='paletteType'>${rowData.paletteCode}</color>
                        </palette>
                    </chl>`
            } else {
                data += `
                    <chl id='${rowData.id}'>
                        <rebootPrompt>${!noRebootPrompt}</rebootPrompt>
                        <cfgFile>${rowData.cfgFile}</cfgFile>
                        <bright>${rowData.bright}</bright>
                        <contrast>${rowData.contrast}</contrast>
                        <hue>${rowData.hue}</hue>
                        <saturation>${rowData.saturation}</saturation>
                    </chl>`
            }
            data += '</content>'
            openLoading(LoadingTarget.FullScreen)
            editChlVideoParam(getXmlWrapData(data)).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    baseFloatErrorRef.value.show('#divTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                } else {
                    const rebootParam = res('rebootParam').text()
                    if (rebootParam) {
                        judgeReboot(rebootParam, () => {
                            setData(rowData, true)
                        })
                    } else {
                        const errorCode = res('errorCode').text()
                        let msg = Translate('IDCS_SAVE_DATA_FAIL')
                        if (errorCode == '536870935' || errorCode == '536870962') {
                            // 通道离线（节点不存在）
                            msg += Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                        }
                        baseFloatErrorRef.value.show('#divTip', msg)
                    }
                }
            })
        }

        // 重启提示
        const judgeReboot = (rebootParam: string, callback: Function) => {
            if (document.getElementsByClassName('el-message-box').length > 0) return
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_IPC_MODIFY_REBOOT_TIPS').formatForLang(rebootTipMap[rebootParam] || ''),
            })
                .then(() => {
                    callback()
                })
                .catch(() => {
                    resetRebootParam()
                })
        }

        /**
         * 取消重启提示，重置重启参数
         */
        const resetRebootParam = () => {
            const rowData = getRowById(beforeEditData.id)
            tableData.value[tableData.value.indexOf(rowData)] = cloneDeep(beforeEditData)
        }

        // const showFloatTip = (msg: string, imgIndex = 2) => {
        //     tipMsg.value = msg
        //     tipImgIndex.value = imgIndex
        //     tipVisiable.value = true
        //     setTimeout(() => {
        //         tipVisiable.value = false
        //     }, 5000)
        // }

        const getRowById = (chlId: string) => {
            return tableData.value.find((ele) => ele.id == chlId) as ChannelImage
        }

        //镜头操作
        let azList: ChannelLensCtrl[] = []
        const curLensCtrl = ref(new ChannelLensCtrl())
        const getSupportAz = (chlId: string) => {
            const index = tableData.value.indexOf(getRowById(chlId))
            if (azList[index]) {
                curLensCtrl.value = azList[index]
                return
            }
            const data = `
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>`
            queryCameraLensCtrlParam(getXmlWrapData(data)).then((res: any) => {
                res = queryXml(res)
                const newData = new ChannelLensCtrl()
                newData.id = chlId
                if (res('status').text() == 'fail' || res('content').text() == '') {
                    newData.supportAz = false
                } else {
                    newData.supportAz = true
                }
                if (newData.supportAz) {
                    const focusType = res('types/focusType').text()
                    const reg1 = /(manual){1}/g
                    const reg2 = /(auto){1}/g
                    if (reg1.test(focusType))
                        newData.focusTypeList.push({
                            value: 'manual',
                            text: Translate('IDCS_MANUAL_FOCUS'),
                        })
                    if (reg2.test(focusType))
                        newData.focusTypeList.push({
                            value: 'auto',
                            text: Translate('IDCS_AUTO_FOCUS'),
                        })
                    res('content/chl/timeIntervalNote')
                        .text()
                        .split(',')
                        .forEach((ele: string) => {
                            newData.timeIntervalList.push({
                                value: ele,
                                text: ele == '0' ? Translate('IDCS_ALWAYS_KEEP') : ele == '60' ? '1 ' + Translate('MINUTE') : Number(ele) / 60 + ' ' + Translate('MINUTES'),
                            })
                        })
                    newData.timeInterval = res('content/chl/timeInterval').text()
                    if (focusType != 'auto') {
                        newData.focusType = 'manual'
                    } else {
                        newData.focusType = 'auto'
                        if (!newData.timeInterval || newData.timeInterval == '0') {
                            newData.IrchangeFocus = false
                            newData.IrchangeFocusDisabled = true
                        }
                    }
                    newData.IrchangeFocus = res('content/chl/IrchangeFocus').text().toBoolean()
                } else {
                    newData.IrchangeFocusDisabled = true
                }
                azList[tableData.value.indexOf(getRowById(chlId))] = newData
                curLensCtrl.value = newData
                // NT2-2585修正

                // if (newData.focusType == 'auto') {
                //     if (!newData.timeInterval || newData.timeInterval == '0') {
                //         newData.IrchangeFocus = false
                //         newData.IrchangeFocusDisabled = true
                //     } else {
                //         newData.IrchangeFocusDisabled = false
                //     }
                // } else {
                //     newData.IrchangeFocusDisabled = false
                // }
            })
        }

        const azCmdQueue: string[] = []
        let azCmdQueueLock = false
        const addCmd = (cmd: string, chlId: string) => {
            if (!curLensCtrl.value.supportAz) return
            if (azCmdQueue.length > 1000) return
            azCmdQueue.push(cmd)
            if (azCmdQueue.length == 1 && !azCmdQueueLock) executeCmd(chlId)
        }

        const executeCmd = (chlId: string) => {
            if (azCmdQueue.length == 0 || azCmdQueueLock) return
            azCmdQueueLock = true
            const cmd = azCmdQueue[0]
            if (chlId) {
                const data = `
                    <content>
                        <chlId>${chlId}</chlId>
                        <actionType>${cmd}</actionType>
                    </content>`
                try {
                    cameraLensCtrlCall(getXmlWrapData(data))
                        .then(() => {
                            handleLensCtrlCmdCb(chlId)
                        })
                        .catch(() => {
                            handleLensCtrlCmdCb(chlId)
                        })
                } catch (ex) {
                    handleLensCtrlCmdCb(chlId)
                }
            } else {
                handleLensCtrlCmdCb(chlId)
            }
        }

        const handleLensCtrlCmdCb = (chlId: string) => {
            azCmdQueueLock = false
            azCmdQueue.shift()
            executeCmd(chlId)
        }

        const saveLensCtrlData = () => {
            const data = `
                <content>
                    <chl id='${curLensCtrl.value.id}'>
                        <focusType type="focusType">${curLensCtrl.value.focusType}</focusType>
                        <IrchangeFocus>${curLensCtrl.value.IrchangeFocus}</IrchangeFocus>
                        <timeInterval>${curLensCtrl.value.focusType == 'manual' ? 0 : curLensCtrl.value.timeInterval}</timeInterval>
                    </chl>
                </content>`
            editCameraLensCtrlParam(getXmlWrapData(data))
                .then((res: any) => {
                    res = queryXml(res)
                    if (res('status').text() == 'success' || res('errorCode').text() == '0') {
                        baseFloatErrorRef.value.show('#divLensTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                    } else {
                        baseFloatErrorRef.value.show('#divLensTip', Translate('IDCS_SAVE_DATA_FAIL'))
                    }
                })
                .catch(() => {
                    baseFloatErrorRef.value.show('#divLensTip', Translate('IDCS_SAVE_DATA_FAIL'))
                })
        }

        // 排程
        const filteredScheduleInfoEnum = (scheduleInfoEnum: string[], excludeTimeEnum: boolean) => {
            if (excludeTimeEnum) {
                return scheduleInfoEnum.filter((ele) => ele != 'time')
            } else {
                return scheduleInfoEnum.filter((ele) => ele == 'time')
            }
        }
        const handleProgramChange = (rowData: ChannelImage) => {
            if (rowData.scheduleInfo.program == 'auto') return
            rowData.cfgFile = rowData.scheduleInfo.program
            getData(rowData.id, false, rowData.cfgFile, () => {})
        }

        const handleChangeTime = (timeType: 'day' | 'night') => {
            const rowData = getRowById(selectedChlId.value)
            if (timeMode.value != 12) {
                if (!compareTime(rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime)) {
                    if (timeType == 'day') {
                        rowData.scheduleInfo.dayTime = tmpDayTime
                    } else {
                        rowData.scheduleInfo.nightTime = tmpNightTime
                    }
                    return
                }
                tmpDayTime = rowData.scheduleInfo.dayTime
                tmpNightTime = rowData.scheduleInfo.nightTime
                // todo
            }
            scheduleLine.value.resetValue([[rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime]])
        }

        const compareTime = (time1: string, time2: string, isWhitelight = false) => {
            const now = new Date().format('yyyy/MM/dd')
            const date1 = new Date(now + ' ' + time1).getTime()
            const date2 = new Date(now + ' ' + time2).getTime()
            const isValid = isWhitelight ? date1 != date2 : date1 < date2
            const msg = isWhitelight ? Translate('IDCS_STARTTIME_NOTEQUAL_ENDTIME') : Translate('IDCS_END_TIME_GREATER_THAN_START')
            if (!isValid) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: msg,
                    showCancelButton: false,
                })
            }
            return isValid
        }

        const setSecheduleLineData = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.scheduleInfo.dayTime && rowData.scheduleInfo.nightTime) {
                scheduleLine.value.resetValue([[rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime]])
            }
        }

        const onReady = () => {
            if (!Plugin.IsSupportH5() && !Plugin.IsPluginAvailable()) {
                pluginStore.showPluginNoResponse = true
                Plugin.ShowPluginNoResponse()
            }
            if (playerRef.value?.mode === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            play()
        }

        const play = () => {
            if (!selectedChlId.value) return
            if (!playerRef.value || !playerRef.value.ready) return
            const rowData = getRowById(selectedChlId.value)
            if (playerRef.value.mode === 'h5') {
                playerRef.value.player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                } else {
                    playerRef.value.plugin.RetryStartChlView(rowData.id, rowData.name)
                }
            }
        }

        watch(selectedChlId, play)

        watch(
            isSupportH5,
            (newVal) => {
                if (!newVal && !Plugin.IsPluginAvailable) {
                    pluginStore.showPluginNoResponse = true
                    Plugin.ShowPluginNoResponse()
                }
            },
            {
                immediate: true,
            },
        )

        watch(
            expandedRowKeys,
            (newVal) => {
                curAzChlId = newVal.length > 0 ? newVal[0] : ''
            },
            {
                immediate: true,
            },
        )

        watch(
            scheduleLine,
            (newVal) => {
                if (newVal) {
                    setSecheduleLineData()
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(() => {
            Plugin.SetPluginNotice('#layout2Content')
            getTimeCfg()
            getDataList()
        })

        onBeforeUnmount(() => {
            if (playerRef.value?.mode === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            pageIndex,
            pageSize,
            pageTotal,
            DefaultPagerSizeOptions,
            DefaultPagerLayout,
            selectedChlId,
            tipMsg,
            tipImgIndex,
            tipVisiable,
            expandedRowKeys,
            tabKeys,
            tabs,
            curLensCtrl,
            defaultIRCutMode,
            defaultRadioVal,
            defaultFocusMode,
            configFileTypeMap,
            scheduleMap,
            exposureModeMap,
            whiteBalanceMode,
            BLCMode,
            HWDRLevel,
            SmartIRMap,
            DayNightModeMap,
            SensortyMap,
            antiFlickerMap,
            infraredModeMap,
            baseFloatErrorRef,
            timeMode,
            scheduleLine,
            handleSizeChange,
            handleCurrentChange,
            handleInputChange,
            handleRowClick,
            handleChlSel,
            handlePaletteCode,
            handleAdvanced,
            handleRestoreVal,
            handleExpandChange,
            handleKeydownEnter,
            addCmd,
            saveLensCtrlData,
            filteredScheduleInfoEnum,
            handleProgramChange,
            handleChangeTime,
            handleCfgFileChange,
            handleImageValueChange,
            handleExposureModeChange,
            handleShutterUpLimitChange,
            handleShutterLowLimitChange,
            handleIRCutModeChange,
            setAZData,
            onReady,
        }
    },
})
