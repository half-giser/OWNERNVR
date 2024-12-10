/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-27 11:55:36
 * @Description: 通道 - 图像参数配置
 */
import { ChannelImageDto, ChannelLensCtrlDto, type ChannelScheduleInfoDto } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'
import { cloneDeep } from 'lodash-es'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelImageDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelImageDto[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const scheduleLine = ref<ScheduleLineInstance>()
        const tipMsg = ref('')
        const tipImgIndex = ref(0)
        const tipVisiable = ref(false)
        const expandedRowKeys = ref<string[]>([])
        const defaultIRCutMode = ref('auto')
        const defaultRadioVal = false
        const defaultFocusMode = 'auto'
        const chlNameMaxLen = 40 // 通道名最大长度
        const floatErrorTo = ref('#divTip')
        const floatErrorMessage = ref('')
        const floatErrorType = ref('ok')

        const timeMode = ref(24)
        let beforeEditData: ChannelImageDto

        let tmpShutterUpLimit: string | undefined
        let tmpShutterLowLimit: string | undefined
        let tmpDayTime = ''
        let tmpNightTime = ''
        let curAzChlId = ''

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
            0: Translate('IDCS_AUTO'),
            1: Translate('IDCS_MANUAL'),
        }

        const exposureModeKeyMap: Record<string, string> = {
            auto: '0',
            manual: '1',
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

        const pageData = ref({
            whitelightModeOptions: [
                {
                    value: 'off',
                    label: Translate('IDCS_OFF'),
                },
                {
                    value: 'manual',
                    label: Translate('IDCS_MANUAL'),
                },
                {
                    value: 'auto',
                    label: Translate('IDCS_AUTO'),
                },
            ],
            focusModeOptions: [
                {
                    value: 'manual',
                    label: Translate('IDCS_MANUAL_FOCUS'),
                },
                {
                    value: 'auto',
                    label: Translate('IDCS_AUTO_FOCUS'),
                },
            ],
            smartIrLevelOptions: [
                {
                    value: '2',
                    label: Translate('IDCS_DN_SEN_HIGH'),
                },
                {
                    value: '1',
                    label: Translate('IDCS_DN_SEN_MID'),
                },
                {
                    value: '0',
                    label: Translate('IDCS_DN_SEN_LOW'),
                },
            ],
            switchOptions: getBoolSwitchOptions(),
            icCutModeOptions: [
                {
                    value: 'auto',
                    label: DayNightModeMap.auto,
                },
                {
                    value: 'day',
                    label: DayNightModeMap.day,
                },
                {
                    value: 'night',
                    label: DayNightModeMap.night,
                },
                {
                    value: 'time',
                    label: DayNightModeMap.time,
                },
            ],
            irCutConvSenOptions: [
                {
                    value: 'high',
                    label: SensortyMap.high,
                },
                {
                    value: 'mid',
                    label: SensortyMap.mid,
                },
                {
                    value: 'low',
                    label: SensortyMap.low,
                },
            ],
            imgRotateOptions: arrayToOptions([0, 90, 180, 270]),
        })

        const chlOptions = computed(() => {
            return tableData.value.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                }
            })
        })

        const showFloatError = (to: string, message: string, type = 'error') => {
            floatErrorMessage.value = message
            floatErrorTo.value = to
            floatErrorType.value = type
        }

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
            tableRef.value!.setCurrentRow(rowData)
            if (!rowData.disabled && !rowData.isSupportThermal) {
                getSupportAz(chlId)
                if (expandedRowKeys.value.length) expandedRowKeys.value = [chlId]
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
            openMessageBox({
                type: 'question',
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

        const handleKeydownEnter = (event: Event) => {
            ;(event.target as HTMLElement).blur()
        }

        const handleExpandChange = (row: ChannelImageDto, expandedRows: ChannelImageDto[]) => {
            if (!row.disabled) {
                selectedChlId.value = row.id
                tmpShutterUpLimit = row.shutterUpLimit
                tmpShutterLowLimit = row.shutterLowLimit
                tmpDayTime = row.scheduleInfo.dayTime
                tmpNightTime = row.scheduleInfo.nightTime
                // if (azList[tableData.value.indexOf(row)]) curLensCtrl.value = azList[tableData.value.indexOf(row)]
                tableRef.value!.setCurrentRow(row)
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
                expandedRowKeys.value = expandedRows.map((item) => item.id).filter((item) => item !== row.id)
            }
        }

        const handleInputChange = (val: number | undefined, chlId: string, type: 'bright' | 'contrast' | 'saturation' | 'hue') => {
            const rowData = getRowById(chlId)
            rowData[type] = val
            setData(rowData)
            if (chlId === selectedChlId.value) {
                formData.value = cloneDeep(rowData)
            }
        }

        const handleRowClick = (rowData: ChannelImageDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = cloneDeep(rowData)
                beforeEditData = cloneDeep(rowData)
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
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
            if (rowData.chlType !== 'analog' || rowData.imageMaxValue === undefined) return
            rowData.imageValue! += val
            setAZData()
        }

        const handleExposureModeChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.gainMode !== undefined) rowData.gainMode = rowData.exposureMode === 'manual' ? '1' : '0'
            setAZData()
        }

        const handleShutterUpLimitChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterLowLimit !== undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterUpLimit = tmpShutterUpLimit
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'),
                })
                return
            }
            tmpShutterUpLimit = rowData.shutterUpLimit
            setAZData()
        }

        const handleShutterLowLimitChange = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterUpLimit !== undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterLowLimit = tmpShutterLowLimit
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'),
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
            let data = rawXml`
                <content>
                    <chl id='${rowData.id}'>
                    <rebootPrompt>${noRebootPrompt ? 'false' : 'true'}</rebootPrompt>`
            if (rowData.sharpenValue !== undefined)
                data += rawXml`
                    <sharpen>
                        <switch>${Boolean(rowData.sharpenSwitch)}</switch>
                        <value>${rowData.sharpenValue}</value>
                    </sharpen>`
            if (rowData.denoiseValue !== undefined)
                data += rawXml`
                    <denoise>
                        <switch>${Boolean(rowData.denoiseSwitch)}</switch>
                        <value>${rowData.denoiseValue}</value>
                    </denoise>`
            if (rowData.WDRSwitch !== undefined)
                data += rawXml`
                    <WDR>
                        <switch>${rowData.WDRSwitch}</switch>
                        <value>${rowData.WDRValue || 0}</value>
                    </WDR>`
            if (rowData.imageValue !== undefined) data += `<imageShift>${rowData.imageValue}</imageShift>`
            if (rowData.whiteBalanceMode !== undefined)
                data += rawXml`
                    <whiteBalance>
                        <mode>${rowData.whiteBalanceMode}</mode>
                        <red>${rowData.redValue || 0}</red>
                        <blue>${rowData.blueValue || 0}</blue>
                    </whiteBalance>`
            if (rowData.mirrorSwitch !== undefined) data += `<mirrorSwitch>${rowData.mirrorSwitch}</mirrorSwitch>`
            if (rowData.flipSwitch !== undefined) data += `<flipSwitch>${rowData.flipSwitch}</flipSwitch>`
            if (rowData.BLCMode !== undefined)
                data += rawXml`
                    <backlightCompensation>
                        <mode>${rowData.BLCMode}</mode>
                        <HWDRLevel>${rowData.HWDRLevel || ''}</HWDRLevel>
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
                data += rawXml`
                    <smartIr>
                        <mode>${rowData.smartIrMode}</mode>
                        <lightLevel_1>${rowData.lightLevelValue || 0}</lightLevel_1>
                    </smartIr>`
            if (rowData.smartIrSwitch !== undefined)
                data += rawXml`
                    <smartIR>
                        <switch type='boolean' default='false'>${rowData.smartIrSwitch}</switch>
                        <level>${rowData.smartIrLevel || ''}</level>
                    </smartIR>`
            if (rowData.defogSwitch !== undefined)
                data += rawXml`
                    <fogReduction>
                        <switch>${rowData.defogSwitch}</switch>
                        <value>${rowData.defogValue || 0}</value>
                    </fogReduction>`
            if (rowData.antiflicker !== undefined) data += `<antiflicker>${rowData.antiflicker}</antiflicker>`
            if (rowData.exposureMode !== undefined)
                data += rawXml`
                    <autoExposureMode>
                        <mode>${rowData.exposureMode}</mode>
                        <value>${rowData.exposureModeValue || 0}</value>
                    </autoExposureMode>
                    <gain>
                        <mode>${rowData.gainMode || ''}</mode>
                        <value>${rowData.gainValue || 0}</value>
                        <AGC>${rowData.gainAGC || 0}</AGC>
                    </gain>`
            if (rowData.delayTimeValue !== undefined) data += `<IRCutDelayTime>${rowData.delayTimeValue}</IRCutDelayTime>`
            if (rowData.InfraredMode !== undefined) data += `<InfraredMode>${rowData.InfraredMode}</InfraredMode>`
            if (rowData.shutterMode !== undefined)
                data += rawXml`
                    <shutter>
                        <mode>${rowData.shutterMode}</mode>
                        <value>${rowData.shutterValue || ''}</value>
                        ${rowData.shutterLowLimit === undefined ? '' : '<lowLimit>' + rowData.shutterLowLimit + '</lowLimit>'}
                        ${rowData.shutterUpLimit === undefined ? '' : '<upLimit>' + rowData.shutterUpLimit + '</upLimit>'}
                    </shutter>`
            if (rowData.whitelightMode !== undefined)
                data += rawXml`
                    <Whitelight>
                        <WhitelightMode type='WhitelightMode' default='off'>${rowData.whitelightMode}</WhitelightMode>
                        <WhitelightStrength type="uint32" min="1" max="100" default="50">${rowData.whitelightStrength || 0}</WhitelightStrength>
                        <WhitelightOnTime type="string" default="00:00">${rowData.whitelightOnTime || ''}</WhitelightOnTime>
                        <WhitelightOffTime type="string" default="23:59">${rowData.whitelightOffTime || ''}</WhitelightOffTime>
                    </Whitelight>`
            if (setSchedule)
                data += rawXml`
                    <scheduleInfo>
                        <program>${rowData.scheduleInfo.scheduleType === 'time' ? 'time' : rowData.scheduleInfo.program}</program>
                        <dayTime>${rowData.scheduleInfo.dayTime}</dayTime>
                        <nightTime>${rowData.scheduleInfo.nightTime}</nightTime>
                    </scheduleInfo>`
            data += '</chl></content>'
            editChlVideoParam(data).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    showFloatError('#divTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                } else {
                    const rebootParam = $('rebootParam').text()
                    if (rebootParam) {
                        judgeReboot(rebootParam, () => {
                            setAZData(setSchedule, true)
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let msg = Translate('IDCS_SAVE_DATA_FAIL')
                        if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL)
                            msg = Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                        showFloatError('#divTip', msg)
                    }
                }
            })
        }

        const getTimeCfg = () => {
            queryTimeCfg().then((res) => {
                timeMode.value = queryXml(res)('content/formatInfo/time').text().num()
            })
        }

        const getDataList = () => {
            openLoading()
            getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportImageSetting: true,
                requireField: ['supportIRCutMode'],
            }).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    getHallwayChlIds((chlIds: string[]) => {
                        const rowData = $('content/item').map((ele) => {
                            const $item = queryXml(ele.element)
                            const chlId = ele.attr('id'),
                                isSupportHallway = chlIds.includes(chlId)
                            const newData = new ChannelImageDto()
                            newData.id = chlId
                            newData.name = $item('name').text()
                            newData.chlType = $item('chlType').text()
                            newData.status = 'loading'
                            newData.isSupportHallway = isSupportHallway
                            newData.isSupportIRCutMode = $item('supportIRCutMode').text().bool()
                            newData.isSupportThermal = $item('AccessType').text() === '1'
                            return newData
                        })
                        tableData.value = rowData
                        pageTotal.value = $('content').attr('total').num()
                        expandedRowKeys.value = []
                        azList = []
                        tmpScheduleInfoList = []

                        if (!rowData.length) return
                        selectedChlId.value = rowData[0].id
                        tableRef.value!.setCurrentRow(rowData[0])
                        formData.value = cloneDeep(rowData[0])
                        beforeEditData = cloneDeep(rowData[0])

                        //请求显示设置数据
                        rowData.forEach((ele) => {
                            if (ele.chlType !== 'recorder') {
                                getData(ele.id, true, false)
                            } else {
                                ele.status = ''
                                if (ele.id === selectedChlId.value) {
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
            }).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    const chlIds = $('content/item').map((ele) => {
                        return ele.attr('id')
                    })
                    callback(chlIds)
                }
            })
        }

        let tmpScheduleInfoList: ChannelScheduleInfoDto[] = []
        const getData = (chlId: string, needSchedule: boolean, cfgFile: string | boolean | undefined, callback?: Function) => {
            const data = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                    ${needSchedule ? '<scheduleInfo></scheduleInfo>' : ''}
                    ${cfgFile ? '<cfgFile>' + cfgFile + '</cfgFile>' : ''}
                </condition>`
            queryChlVideoParam(data).then((res) => {
                const $ = queryXml(res)
                const rowData = getRowById(chlId)
                if ($('status').text() === 'success') {
                    const $chl = queryXml($('content/chl')[0].element)

                    let isSpeco = false
                    rowData.bright = $chl('bright').length ? $chl('bright').text().num() : undefined
                    rowData.contrast = $chl('contrast').length ? $chl('contrast').text().num() : undefined
                    // NT2-3481 设备接入海康IPC，协议不返回hue节点，“色调”配置项置灰
                    rowData.hue = $chl('hue').length ? $chl('hue').text().num() : -1
                    rowData.saturation = $chl('saturation').length ? $chl('saturation').text().num() : undefined
                    rowData.status = ''
                    rowData.disabled = false

                    if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) {
                        isSpeco = true
                    }
                    rowData.isSpeco = rowData.disabled = isSpeco
                    if ($chl('palette').length) {
                        rowData.paletteCode = $chl('palette/color').text()
                        rowData.defaultPaletteCode = $chl('palette/color').attr('default')
                        rowData.paletteList = $('types/paletteType/enum').map((ele) => {
                            return {
                                value: ele.text(),
                                label: paletteTypeMap[ele.text()],
                            }
                        })
                    }

                    if ($chl('bright').text()) {
                        rowData.brightMinValue = $chl('bright').attr('min').num()
                        rowData.brightMaxValue = $chl('bright').attr('max').num()
                        rowData.brightDefaultValue = $chl('bright').attr('default').num()
                    }

                    if ($chl('contrast').text()) {
                        rowData.contrastMinValue = $chl('contrast').attr('min').num()
                        rowData.contrastMaxValue = $chl('contrast').attr('max').num()
                        rowData.contrastDefaultValue = $chl('contrast').attr('default').num()
                    }

                    if ($chl('hue').text()) {
                        rowData.hueMinValue = $chl('hue').attr('min').num()
                        rowData.hueMaxValue = $chl('hue').attr('max').num()
                        rowData.hueDefaultValue = $chl('hue').attr('default').num()
                    }

                    if ($chl('saturation').text()) {
                        rowData.saturationMinValue = $chl('saturation').attr('min').num()
                        rowData.saturationMaxValue = $chl('saturation').attr('max').num()
                        rowData.saturationDefaultValue = $chl('saturation').attr('default').num()
                    }

                    $('content/chl').forEach(() => {
                        rowData.cfgFile = $chl('cfgFile').text()
                        rowData.cfgFileDefault = $chl('cfgFile').attr('default')
                        if ($chl('denoise/value').text()) {
                            rowData.denoiseValue = $chl('denoise/value').text().num()
                            rowData.denoiseDefaultValue = $chl('denoise/value').attr('default').num()
                            rowData.denoiseMinValue = $chl('denoise/value').attr('min').num()
                            rowData.denoiseMaxValue = $chl('denoise/value').attr('max').num()
                        }
                        rowData.denoiseSwitch = $chl('denoise/switch').text().bool()
                        // NT2-3947 此节点为false, 则为4.2.1版本ipc，隐藏增益模式
                        rowData.ShowGainMode = $chl('ShowGainMode').text().bool()

                        if ($chl('WDR/value').text()) {
                            rowData.WDRDefaultValue = $chl('WDR/value').attr('default').num()
                            rowData.WDRMinValue = $chl('WDR/value').attr('min').num()
                            rowData.WDRMaxValue = $chl('WDR/value').attr('max').num()
                            rowData.WDRValue = $chl('WDR/value').text().num()
                        }
                        if ($chl('WDR/switch').text()) rowData.WDRSwitch = $chl('WDR/switch').text().bool()

                        if ($chl('whiteBalance/red').text()) {
                            rowData.redDefaultValue = $chl('whiteBalance/red').attr('default').num()
                            rowData.redMinValue = $chl('whiteBalance/red').attr('min').num()
                            rowData.redMaxValue = $chl('whiteBalance/red').attr('max').num()
                            rowData.redValue = $chl('whiteBalance/red').text().num()
                        }
                        rowData.HFR = $chl('HFR').text().length ? $chl('HFR').text().bool() : undefined
                        rowData.whiteBalanceMode = $chl('whiteBalance/mode').length ? $chl('whiteBalance/mode').text() : undefined

                        if ($chl('whiteBalance/blue').text()) {
                            rowData.blueDefaultValue = $chl('whiteBalance/blue').attr('default').num()
                            rowData.blueMinValue = $chl('whiteBalance/blue').attr('min').num()
                            rowData.blueMaxValue = $chl('whiteBalance/blue').attr('max').num()
                            rowData.blueValue = $chl('whiteBalance/blue').text().num()
                        }

                        rowData.IRCutMode = $chl('IRCutMode').text() || undefined
                        rowData.IRCutModeDef = $chl('IRCutMode').attr('default') || undefined // : undefined
                        rowData.IRCutConvSen = $chl('IRCutConvSen').text() || 'mid'
                        rowData.IRCutConvSen2 = $chl('IRCutConvSen').text() || undefined
                        rowData.IRCutConvSenDef = $chl('IRCutConvSen').attr('default') || undefined
                        rowData.IRCutDayTime = $chl('IRCutDayTime').text() || undefined
                        rowData.IRCutNightTime = $chl('IRCutNightTime').text() || undefined

                        if ($chl('sharpen/value').text()) {
                            rowData.sharpenDefaultValue = $chl('sharpen/value').attr('default').num()
                            rowData.sharpenMinValue = $chl('sharpen/value').attr('min').num()
                            rowData.sharpenMaxValue = $chl('sharpen/value').attr('max').num()
                            rowData.sharpenValue = $chl('sharpen/value').text().num()
                        }
                        rowData.sharpenSwitch = $chl('sharpen/switch').text().bool()
                        rowData.sharpenSwitchEnable = $chl('sharpen/switch').attr('switchEnabled') && !$chl('sharpen/switch').attr('switchEnabled').bool() ? false : true

                        rowData.mirrorSwitch = $chl('mirrorSwitch').length ? $chl('mirrorSwitch').text().bool() : undefined
                        rowData.flipSwitch = $chl('flipSwitch').length ? $chl('flipSwitch').text().bool() : undefined
                        rowData.imageRotate = $chl('imageRotate').text()
                        rowData.imageRotateDef = $chl('imageRotate').attr('default')

                        if ($chl('imageShift').text()) {
                            rowData.imageDefaultValue = $chl('imageShift').attr('default').num()
                            rowData.imageMinValue = $chl('imageShift').attr('min').num()
                            rowData.imageMaxValue = $chl('imageShift').attr('max').num()
                            rowData.imageValue = $chl('imageShift').text().num()
                        }

                        rowData.BLCMode = $chl('backlightCompensation/mode').length ? $chl('backlightCompensation/mode').text() : undefined
                        rowData.BLCModeDefault = $chl('backlightCompensation/mode').attr('default')
                        rowData.HWDRLevel = $chl('backlightCompensation/HWDRLevel').length ? $chl('backlightCompensation/HWDRLevel').text() : undefined
                        rowData.HWDRLevelDefault = $chl('backlightCompensation/HWDRLevel').attr('default')

                        if ($chl('smartIr/mode').text()) {
                            rowData.smartIrMode = $chl('smartIr/mode').text()
                            rowData.smartIrModeDefault = $chl('smartIr/mode').attr('default')
                            rowData.lightLevelDefaultValue = $chl('smartIr/lightLevel_1').attr('default').num()
                            rowData.lightLevelMinValue = $chl('smartIr/lightLevel_1').attr('min').num()
                            rowData.lightLevelMaxValue = $chl('smartIr/lightLevel_1').attr('max').num()
                            rowData.lightLevelValue = $chl('smartIr/lightLevel_1').text().num()
                        }

                        if ($chl('smartIR').text()) {
                            rowData.smartIrSwitch = $chl('smartIR/switch').text().length ? $chl('smartIR/switch').text().bool() : undefined
                            rowData.smartIrSwitchDefault = $chl('smartIR/switch').attr('default').bool()
                            rowData.smartIrLevel = $chl('smartIR/level').text()
                            rowData.smartIrLevelDefault = $chl('smartIR/level').attr('default')
                        }

                        // 透雾
                        if ($chl('fogReduction/value').text()) {
                            rowData.defogValue = $chl('fogReduction/value').text().num()
                            rowData.defogDefaultValue = $chl('fogReduction/value').attr('default').num()
                            rowData.defogMinValue = $chl('fogReduction/value').attr('min').num()
                            rowData.defogMaxValue = $chl('fogReduction/value').attr('max').num()
                            rowData.defogSwitch = $chl('fogReduction/switch').length ? $chl('fogReduction/switch').text().bool() : undefined
                        }

                        // 抗闪
                        if ($chl('antiflicker').text()) {
                            rowData.antiflicker = $chl('antiflicker').text()
                            rowData.antiflickerDefault = $chl('antiflicker').attr('default')
                        }

                        // 曝光模式
                        if ($chl('autoExposureMode/mode').text()) {
                            rowData.exposureMode = $chl('autoExposureMode/mode').text()
                            rowData.exposureModeDefault = $chl('autoExposureMode/mode').attr('default')
                            rowData.exposureModeValue = $chl('autoExposureMode/value').text().num()
                            rowData.exposureModeDefaultValue = $chl('autoExposureMode/value').attr('default').num()
                            rowData.exposureModeMinValue = $chl('autoExposureMode/value').attr('min').num()
                            rowData.exposureModeMaxValue = $chl('autoExposureMode/value').attr('max').num()
                        }

                        // 延迟时间
                        if ($chl('IRCutDelayTime').text()) {
                            rowData.delayTimeValue = $chl('IRCutDelayTime').text().num()
                            rowData.delayTimeDefaultValue = $chl('IRCutDelayTime').attr('default').num()
                            rowData.delayTimeMinValue = $chl('IRCutDelayTime').attr('min').num()
                            rowData.delayTimeMaxValue = $chl('IRCutDelayTime').attr('max').num()
                        }

                        // 红外模式
                        if ($chl('InfraredMode').text()) {
                            rowData.InfraredMode = $chl('InfraredMode').text()
                            rowData.InfraredModeDefault = $chl('InfraredMode').attr('default')
                        }

                        // 增益限制
                        if ($chl('gain/mode').text()) {
                            rowData.gainMode = $chl('gain/mode').text()
                            rowData.gainModeDefault = $chl('gain/mode').attr('default')
                            rowData.gainValue = $chl('gain/value').text().num()
                            rowData.gainAGC = $chl('gain/AGC').text().num()
                            rowData.gainAGCDefaultValue = $chl('gain/AGC').attr('default').num()
                            rowData.gainDefaultValue = $chl('gain/value').attr('default').num()
                            rowData.gainMinValue = $chl('gain/value').attr('min').num()
                            rowData.gainMaxValue = $chl('gain/value').attr('max').num()
                        }
                        // 获取IPC设备版本号判断是否支持增益模式配置
                        rowData.IPCVersion = $chl('DetailedSoftwareVersion').text() || ''
                        // 快门
                        if ($chl('shutter').text()) {
                            rowData.shutterMode = $chl('shutter/mode').text()
                            rowData.shutterModeDefault = $chl('shutter/mode').attr('default')
                            rowData.shutterValue = $chl('shutter/value').text()
                            rowData.shutterValueDefault = $chl('shutter/value').attr('default')
                            rowData.shutterLowLimit = $chl('shutter/lowLimit').length ? $chl('shutter/lowLimit').text() : undefined
                            rowData.shutterLowLimitDefault = $chl('shutter/lowLimit').attr('default')
                            rowData.shutterUpLimit = $chl('shutter/upLimit').text()
                            rowData.shutterUpLimitDefault = $chl('shutter/upLimit').attr('default')
                        }

                        if (needSchedule) {
                            // todo 逻辑已修改
                            if ($chl('scheduleInfo').text()) {
                                rowData.supportSchedule = true
                                rowData.scheduleInfo.program = $chl('scheduleInfo/program').text()
                                rowData.scheduleInfo.dayTime = $chl('scheduleInfo/dayTime').text()
                                rowData.scheduleInfo.nightTime = $chl('scheduleInfo/nightTime').text()
                                rowData.scheduleInfo.scheduleInfoEnum = $chl('scheduleInfo/types/progType/enum').map((ele) => {
                                    return ele.text()
                                })

                                if (rowData.scheduleInfo.program === 'time') rowData.scheduleInfo.scheduleType = 'time'

                                tmpScheduleInfoList[tableData.value.indexOf(rowData)] = cloneDeep(rowData.scheduleInfo)
                            } else {
                                rowData.supportSchedule = false
                            }
                        } else {
                            rowData.supportSchedule = rowData.supportSchedule || false
                        }

                        // 白光灯
                        if ($chl('Whitelight').text()) {
                            rowData.whitelightMode = $chl('Whitelight/WhitelightMode').text()
                            rowData.whitelightModeDefault = $chl('Whitelight/WhitelightMode').attr('default')
                            rowData.whitelightStrength = $chl('Whitelight/WhitelightStrength').text().num()
                            rowData.whitelightStrengthMin = $chl('Whitelight/WhitelightStrength').attr('min').num()
                            rowData.whitelightStrengthMax = $chl('Whitelight/WhitelightStrength').attr('max').num()
                            rowData.whitelightStrengthDefault = $chl('Whitelight/WhitelightStrength').attr('default').num()
                            rowData.whitelightOnTime = $chl('Whitelight/WhitelightOnTime').text()
                            rowData.whitelightOnTimeDefault = $chl('Whitelight/WhitelightOnTime').attr('default')
                            rowData.whitelightOffTime = $chl('Whitelight/WhitelightOffTime').text()
                            rowData.whitelightOffTimeDefault = $chl('Whitelight/WhitelightOffTime').attr('default')
                        }
                    })

                    rowData.configFileTypeEnum = $('types/configFileType/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: configFileTypeMap[ele.text()],
                        }
                    })
                    rowData.shutterModeEnum = $('types/shutterMode/enum').map((ele) => {
                        return {
                            value: exposureModeKeyMap[ele.text()],
                            label: exposureModeMap[ele.text()],
                        }
                    })
                    rowData.shutterValueEnum = $('types/shutterValue/enum').map((ele, index) => {
                        return {
                            value: index + '',
                            label: ele.text(),
                        }
                    })
                    rowData.whiteBalanceModeEnum = $('types/whiteBalance/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: whiteBalanceMode[ele.text()],
                        }
                    })
                    rowData.BLCModeArray = $('types/BLCMode/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: BLCMode[ele.text()],
                        }
                    })
                    rowData.HWDRLevelArray = $('types/HWDRLevel/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: HWDRLevel[ele.text()],
                        }
                    })
                    rowData.IRCutModeArray = $('types/IRCutMode/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: DayNightModeMap[ele.text()],
                        }
                    })
                    rowData.IRCutConvSenArray = $('types/IRCutConvSen/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: SensortyMap[ele.text()],
                        }
                    })
                    rowData.SmartIrArray = $('types/SmartIRMode/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: SmartIRMap[ele.text()],
                        }
                    })
                    rowData.antiflickerModeArray = $('types/antiflickerMode/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: antiFlickerMap[ele.text()],
                        }
                    })
                    rowData.InfraredModeArray = $('types/InfraredMode/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: infraredModeMap[ele.text()],
                        }
                    })
                    rowData.exposureModeArray = $('types/autoExposureMode/enum').map((ele) => {
                        return {
                            value: exposureModeKeyMap[ele.text()],
                            label: exposureModeMap[ele.text()],
                        }
                    })
                    rowData.exposureValueArray = $('types/autoExposureValue/enum').map((ele) => {
                        const text = ele.text()
                        return {
                            value: Math.floor(Number(rowData.exposureModeMaxValue) / (text === '1' ? 1 : parseInt(text.split('/')[1]))),
                            label: text,
                        }
                    })
                    rowData.gainModeEnum = $('types/gainMode/enum').map((ele) => {
                        return {
                            value: exposureModeKeyMap[ele.text()],
                            label: exposureModeMap[ele.text()],
                        }
                    })

                    if (chlId === selectedChlId.value) {
                        formData.value = cloneDeep(rowData)
                    }
                    if (callback) callback()
                } else {
                    rowData.status = ''
                    if (chlId === selectedChlId.value) {
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
        const setData = (rowData: ChannelImageDto, noRebootPrompt = false) => {
            const data = rawXml`
                <content>
                    ${
                        rowData.paletteCode
                            ? rawXml`
                                    <chl id='${rowData.id}'>
                                        <rebootPrompt>${Boolean(!noRebootPrompt)}</rebootPrompt>
                                        <palette>
                                            <color type='paletteType'>${rowData.paletteCode}</color>
                                        </palette>
                                    </chl>
                                `
                            : rawXml`
                                    <chl id='${rowData.id}'>
                                        <rebootPrompt>${Boolean(!noRebootPrompt)}</rebootPrompt>
                                        <cfgFile>${rowData.cfgFile || ''}</cfgFile>
                                        <bright>${rowData.bright ? rowData.bright : ''}</bright>
                                        <contrast>${rowData.contrast ? rowData.contrast : ''}</contrast>
                                        <hue>${rowData.hue ? rowData.hue : ''}</hue>
                                        <saturation>${rowData.saturation ? rowData.saturation : ''}</saturation>
                                    </chl>
                                `
                    }
                </content>
            `
            openLoading()
            editChlVideoParam(data).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    showFloatError('#divTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                } else {
                    const rebootParam = $('rebootParam').text()
                    if (rebootParam) {
                        judgeReboot(rebootParam, () => {
                            setData(rowData, true)
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let msg = Translate('IDCS_SAVE_DATA_FAIL')
                        if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                            // 通道离线（节点不存在）
                            msg += Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                        }
                        showFloatError('#divTip', msg)
                    }
                }
            })
        }

        // 重启提示
        const judgeReboot = (rebootParam: string, callback: Function) => {
            if (document.getElementsByClassName('el-message-box').length > 0) return
            openMessageBox({
                type: 'question',
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

        const getRowById = (chlId: string) => {
            return tableData.value.find((ele) => ele.id === chlId) as ChannelImageDto
        }

        //镜头操作
        let azList: ChannelLensCtrlDto[] = []
        const curLensCtrl = ref(new ChannelLensCtrlDto())
        const getSupportAz = (chlId: string) => {
            const index = tableData.value.indexOf(getRowById(chlId))
            if (azList[index]) {
                curLensCtrl.value = azList[index]
                return
            }
            const data = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            queryCameraLensCtrlParam(data).then((res) => {
                const $ = queryXml(res)
                const newData = new ChannelLensCtrlDto()
                newData.id = chlId
                if ($('status').text() === 'fail' || $('content').text() === '') {
                    newData.supportAz = false
                } else {
                    newData.supportAz = true
                }

                if (newData.supportAz) {
                    const focusType = $('types/focusType').text()
                    const reg1 = /(manual){1}/g
                    const reg2 = /(auto){1}/g
                    if (reg1.test(focusType))
                        newData.focusTypeList.push({
                            value: 'manual',
                            label: Translate('IDCS_MANUAL_FOCUS'),
                        })
                    if (reg2.test(focusType))
                        newData.focusTypeList.push({
                            value: 'auto',
                            label: Translate('IDCS_AUTO_FOCUS'),
                        })
                    $('content/chl/timeIntervalNote')
                        .text()
                        .split(',')
                        .forEach((ele) => {
                            newData.timeIntervalList.push({
                                value: ele,
                                label: ele === '0' ? Translate('IDCS_ALWAYS_KEEP') : getTranslateForSecond(Number(ele)),
                            })
                        })
                    newData.timeInterval = $('content/chl/timeInterval').text()
                    if (focusType !== 'auto') {
                        newData.focusType = 'manual'
                    } else {
                        newData.focusType = 'auto'
                        if (!newData.timeInterval || newData.timeInterval === '0') {
                            newData.IrchangeFocus = false
                            newData.IrchangeFocusDisabled = true
                        }
                    }
                    newData.IrchangeFocus = $('content/chl/IrchangeFocus').text().bool()
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
            if (azCmdQueue.length === 1 && !azCmdQueueLock) executeCmd(chlId)
        }

        const executeCmd = (chlId: string) => {
            if (azCmdQueue.length === 0 || azCmdQueueLock) return
            azCmdQueueLock = true
            const cmd = azCmdQueue[0]
            if (chlId) {
                const data = rawXml`
                    <content>
                        <chlId>${chlId}</chlId>
                        <actionType>${cmd}</actionType>
                    </content>
                `
                try {
                    cameraLensCtrlCall(data)
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
            const data = rawXml`
                <content>
                    <chl id='${curLensCtrl.value.id}'>
                        <focusType type="focusType">${curLensCtrl.value.focusType}</focusType>
                        <IrchangeFocus>${curLensCtrl.value.IrchangeFocus}</IrchangeFocus>
                        <timeInterval>${curLensCtrl.value.focusType === 'manual' ? '0' : curLensCtrl.value.timeInterval}</timeInterval>
                    </chl>
                </content>`
            editCameraLensCtrlParam(data)
                .then((res) => {
                    const $ = queryXml(res)
                    if ($('status').text() === 'success' || $('errorCode').text() === '0') {
                        showFloatError('#divLensTip', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                    } else {
                        showFloatError('#divLensTip', Translate('IDCS_SAVE_DATA_FAIL'))
                    }
                })
                .catch(() => {
                    showFloatError('#divLensTip', Translate('IDCS_SAVE_DATA_FAIL'))
                })
        }

        // 排程
        const filteredScheduleInfoEnum = (scheduleInfoEnum: string[], excludeTimeEnum: boolean) => {
            if (excludeTimeEnum) {
                return scheduleInfoEnum
                    .filter((ele) => ele !== 'time')
                    .map((value) => {
                        return {
                            value,
                            label: scheduleMap[value],
                        }
                    })
            } else {
                return [
                    {
                        label: Translate('IDCS_FULL_TIME'),
                        value: 'full',
                    },
                ].concat(
                    scheduleInfoEnum
                        .filter((ele) => ele === 'time')
                        .map((value) => {
                            return {
                                value,
                                label: scheduleMap[value],
                            }
                        }),
                )
            }
        }

        const handleProgramChange = (rowData: ChannelImageDto) => {
            if (rowData.scheduleInfo.program === 'auto') return
            rowData.cfgFile = rowData.scheduleInfo.program
            getData(rowData.id, false, rowData.cfgFile, () => {})
        }

        const handleChangeTime = (timeType: 'day' | 'night') => {
            const rowData = getRowById(selectedChlId.value)
            if (timeMode.value !== 12) {
                if (!compareTime(rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime)) {
                    if (timeType === 'day') {
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
            scheduleLine.value!.resetValue([[rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime]])
        }

        /**
         * @description 计算秒时间戳
         * @param {String} formatString HH:mm
         */
        const getSeconds = (formatString: string) => {
            const split = formatString.split(':')
            return Number(split[0]) * 3600 + Number(split[1]) * 60
        }

        const compareTime = (time1: string, time2: string, isWhitelight = false) => {
            const date1 = getSeconds(time1)
            const date2 = getSeconds(time2)
            const isValid = isWhitelight ? date1 !== date2 : date1 < date2
            const msg = isWhitelight ? Translate('IDCS_STARTTIME_NOTEQUAL_ENDTIME') : Translate('IDCS_END_TIME_GREATER_THAN_START')
            if (!isValid) {
                openMessageBox({
                    type: 'info',
                    message: msg,
                })
            }
            return isValid
        }

        const setSecheduleLineData = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.scheduleInfo.dayTime && rowData.scheduleInfo.nightTime) {
                scheduleLine.value!.resetValue([[rowData.scheduleInfo.dayTime, rowData.scheduleInfo.nightTime]])
            }
        }

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => {
                    play()
                })
                stopWatchFirstPlay()
            }
        })

        const play = () => {
            if (!selectedChlId.value) return
            const rowData = getRowById(selectedChlId.value)

            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(rowData.id, rowData.name)
            }
        }

        watch(selectedChlId, () => play())

        watch(
            expandedRowKeys,
            (newVal) => {
                curAzChlId = newVal.length ? newVal[0] : ''
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
            getTimeCfg()
            getDataList()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            formData,
            pageData,
            tableRef,
            tableData,
            chlOptions,
            pageIndex,
            pageSize,
            pageTotal,
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
            floatErrorTo,
            floatErrorMessage,
            floatErrorType,
        }
    },
})
