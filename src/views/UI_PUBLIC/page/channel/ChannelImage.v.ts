/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-27 11:55:36
 * @Description: 通道 - 图像参数配置
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const layoutStore = useLayoutStore()

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
        const floatErrorMessage = ref('')
        const floatLensMessage = ref('')
        const floatErrorType = ref('ok')

        let beforeEditData: ChannelImageDto
        let tmpShutterUpLimit: string | undefined
        let tmpShutterLowLimit: string | undefined
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

        const DigitalZoomMap: Record<string, string> = {
            X1: 'X1',
            X2: 'X2',
            X4: 'X4',
            X8: 'X8',
            X16: 'X16',
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

        // const SecondImageModeMap: Record<string, string> = {
        //     // 双光融合
        //     true: Translate('IDCS_OPEN'),
        //     false: Translate('IDCS_CLOSE'),
        // }

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

        const illuminationModeMap: Record<string, string> = {
            whiteLight: Translate('IDCS_ILLUMINATION_WHITE_LIGHT'),
            irLight: Translate('IDCS_ILLUMINATION_INFRARED_LIGHT'),
            smart: Translate('IDCS_ILLUMINATION_SMART_LIGHT'),
        }

        const ImageOverExposureModeMap: Record<string, string> = {
            off: Translate('IDCS_OFF'),
            low: Translate('IDCS_DN_SEN_LOW'),
            mid: Translate('IDCS_DN_SEN_MID'),
            high: Translate('IDCS_DN_SEN_HIGH'),
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

        const focusModeMap: Record<string, string> = {
            manual: Translate('IDCS_MANUAL_FOCUS'),
            auto: Translate('IDCS_AUTO_FOCUS'),
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
            focusModeOptions: objectToOptions(focusModeMap, 'string'),
            smartIrLevelOptions: [
                {
                    value: '2',
                    label: SensortyMap.high,
                },
                {
                    value: '1',
                    label: SensortyMap.mid,
                },
                {
                    value: '0',
                    label: SensortyMap.low,
                },
            ],
            imageFusionSwitchOptions: [
                {
                    value: true,
                    label: Translate('IDCS_OPEN'),
                },
                {
                    value: false,
                    label: Translate('IDCS_CLOSE'),
                },
            ],
            switchOptions: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
            icCutModeOptions: objectToOptions(DayNightModeMap, 'string'),
            irCutConvSenOptions: objectToOptions(SensortyMap, 'string'),
            imgRotateOptions: arrayToOptions([0, 90, 180, 270]),
            onlineChlList: [] as string[],
            hallwayChlList: [] as string[],
        })

        const chlOptions = computed(() => {
            return tableData.value.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                    disabled: item.disabled,
                }
            })
        })

        const showFloatError = (to: 'setting' | 'lens', message: string, type = 'error') => {
            if (to === 'setting') {
                floatErrorMessage.value = message
            } else {
                floatLensMessage.value = message
            }

            floatErrorType.value = type
        }

        const changePageSize = (val: number) => {
            pageSize.value = val
            getDataList()
        }

        const changePage = (val: number) => {
            pageIndex.value = val
            getDataList()
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)
            formData.value = cloneDeep(rowData)
            beforeEditData = cloneDeep(rowData)
            tableRef.value!.setCurrentRow(rowData)
            if (!rowData.disabled && !!rowData.paletteList.length && rowData.AccessType === '1' && !rowData.isSupportImageFusion) {
                getSupportAz(chlId)
                if (expandedRowKeys.value.length) expandedRowKeys.value = [chlId]
            }
        }

        const changePaletteCode = () => {
            const rowData = getRowById(selectedChlId.value)
            rowData.paletteCode = formData.value.paletteCode
            setData(rowData)
        }

        const showMore = () => {
            if (!expandedRowKeys.value.includes(selectedChlId.value)) {
                expandedRowKeys.value = [selectedChlId.value]
                getSupportAz(selectedChlId.value)
            }
        }

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
        }

        const resetData = () => {
            const rowData = getRowById(selectedChlId.value)
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_MP_RESTORE_VALUE').formatForLang(rowData.name.length > chlNameMaxLen ? rowData.name.substring(0, chlNameMaxLen) + '...' : rowData.name),
            })
                .then(() => {
                    if (rowData.paletteList.length) {
                        rowData.paletteCode = rowData.defaultPaletteCode
                        // 单目热成像，图像镜像、图像翻转需要恢复为默认值“关”
                        if (rowData.AccessType === '0') {
                            // 单目热成像，图像镜像、图像翻转需要恢复为默认值“关”
                            if (rowData.mirrorSwitch) {
                                rowData.mirrorSwitch = false
                            }

                            if (rowData.flipSwitch) {
                                rowData.flipSwitch = false
                            }
                        }

                        // 支持双光融合，则需要恢复以下参数为默认值
                        if (rowData.isSupportImageFusion) {
                            rowData.imageFusion.switch = false
                            rowData.imageFusion.distance = rowData.imageFusion.distanceUnit === 'Meter' ? rowData.imageFusion.distanceDefault : rowData.imageFusion.distanceFdefault
                            rowData.imageFusion.poolid = rowData.imageFusion.poolidDefault
                            rowData.imageFusion.fusespeed = rowData.imageFusion.fusespeedDefault
                            saveFusionConfig(rowData)
                        }
                    } else {
                        rowData.bright = rowData.brightDefault
                        rowData.contrast = rowData.contrastDefault
                        rowData.saturation = rowData.saturationDefault
                        rowData.hue = rowData.hueDefault

                        if (rowData.sharpenSwitch !== undefined) {
                            rowData.sharpen = rowData.sharpenDefault
                            rowData.sharpenSwitch = false
                        }

                        if (rowData.denoiseSwitch !== undefined) {
                            rowData.denoise = rowData.denoiseDefault
                            rowData.denoiseSwitch = false
                        }

                        if (rowData.HFR !== undefined) {
                            rowData.HFR = false
                        }

                        if (rowData.whiteBalanceMode !== undefined) {
                            rowData.whiteBalanceMode = 'auto'
                        }

                        if (rowData.BLCMode !== undefined) {
                            rowData.BLCMode = rowData.BLCModeDefault
                        }

                        if (rowData.HWDRLevel !== undefined) {
                            rowData.HWDRLevel = rowData.HWDRLevelDefault
                        }

                        if (rowData.blue !== undefined) {
                            rowData.blue = rowData.blueDefault
                        }

                        if (rowData.imageShift !== undefined) {
                            rowData.imageShift = rowData.imageShiftDefault
                        }

                        if (rowData.red !== undefined) {
                            rowData.red = rowData.redDefault
                        }

                        if (rowData.WDR !== undefined) {
                            rowData.WDR = rowData.WDRDefault
                            rowData.WDRSwitch = false
                        }

                        if (rowData.mirrorSwitch !== undefined) {
                            rowData.mirrorSwitch = false
                        }

                        if (rowData.flipSwitch !== undefined) {
                            rowData.flipSwitch = false
                        }

                        if (rowData.imageRotate !== undefined) {
                            rowData.imageRotate = rowData.imageRotateDefault
                        }

                        if (rowData.IRCutMode !== undefined) {
                            rowData.IRCutMode = rowData.IRCutModeDefault
                            rowData.IRCutConvSen = rowData.IRCutConvSenDefault
                        }

                        if (rowData.smartIrMode !== undefined) {
                            rowData.smartIrMode = rowData.smartIrModeDefault
                            rowData.lightLevel = rowData.lightLevelDefault
                        }

                        if (rowData.smartIrSwitch !== undefined) {
                            rowData.smartIrSwitch = rowData.smartIrSwitchDefault
                            rowData.smartIrLevel = rowData.smartIrLevelDefault
                        }

                        if (rowData.defogSwitch !== undefined) {
                            rowData.defog = rowData.defogDefault
                            rowData.defogSwitch = false
                        }

                        if (rowData.antiflicker !== undefined) {
                            rowData.antiflicker = rowData.antiflickerDefault
                        }

                        if (rowData.exposureMode !== undefined) {
                            rowData.exposureMode = rowData.exposureModeDefault
                            rowData.exposure = rowData.exposureDefault
                        }

                        if (rowData.delayTime !== undefined) {
                            rowData.delayTime = rowData.delayTimeDefault
                        }

                        if (rowData.InfraredMode !== undefined) {
                            rowData.InfraredMode = rowData.InfraredModeDefault
                        }

                        if (rowData.gain !== undefined) {
                            if (!rowData.noGainMode) {
                                rowData.gainMode = rowData.gainModeDefault
                            }
                            rowData.gain = rowData.gainDefault
                            rowData.gainAGC = rowData.gainAGCDefault
                        }

                        if (rowData.shutterMode !== undefined) {
                            rowData.shutterMode = rowData.shutterModeDefault
                            rowData.shutter = rowData.shutterDefault
                            rowData.shutterUpLimit = rowData.shutterUpLimitDefault
                            rowData.shutterLowLimit = rowData.shutterLowLimitDefault
                        }

                        // NTA1-4379 恢复默认值，数字变倍图像参数重置为1倍
                        if (rowData.dZoom !== undefined) {
                            rowData.dZoom = rowData.dZoomDefault
                        }

                        if (rowData.irLightBright !== undefined) {
                            // 恢复默认参数，照明模式为智能补光，红外模式为自动，均满足显示红外光亮度的条件
                            rowData.irLightBright = rowData.irLightBrightDefault
                        }

                        setAZData()
                    }
                    formData.value = cloneDeep(rowData)
                    // beforeEditData = cloneDeep(rowData)
                    setData(rowData)
                })
                .catch(() => {})
        }

        const handleExpandChange = (row: ChannelImageDto, expandedRows: ChannelImageDto[]) => {
            if (!row.disabled) {
                selectedChlId.value = row.id
                tmpShutterUpLimit = row.shutterUpLimit
                tmpShutterLowLimit = row.shutterLowLimit
                tableRef.value!.setCurrentRow(row)
                formData.value = cloneDeep(row)
                beforeEditData = cloneDeep(row)
                getSupportAz(row.id)
            }

            if (!row.disabled || (row.paletteList.length && row.AccessType === '1' && !row.isSupportImageFusion)) {
                if (expandedRowKeys.value.includes(row.id)) {
                    expandedRowKeys.value = []
                } else {
                    expandedRowKeys.value = [row.id]
                }
            } else {
                expandedRowKeys.value = expandedRows.map((item) => item.id).filter((item) => item !== row.id)
            }
        }

        const changeHSL = (val: number | undefined, chlId: string, type: 'bright' | 'contrast' | 'saturation' | 'hue') => {
            const rowData = getRowById(chlId)
            rowData[type] = val
            setData(rowData)
            if (chlId === selectedChlId.value) {
                formData.value = cloneDeep(rowData)
            }
        }

        const handleRowClick = (rowData: ChannelImageDto) => {
            selectedChlId.value = rowData.id
            formData.value = cloneDeep(rowData)
            beforeEditData = cloneDeep(rowData)
        }

        const changeCfgFile = async () => {
            const rowData = getRowById(selectedChlId.value)
            await getData(selectedChlId.value, false, rowData.cfgFile)
            const index = tableData.value.indexOf(rowData)
            if (index !== -1) {
                rowData.scheduleInfo.program = tmpScheduleInfoList[index].program
            }
        }

        const changeExposureMode = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.gainMode !== undefined) rowData.gainMode = rowData.exposureMode === 'manual' ? '1' : '0'
            setAZData()
        }

        const changeShutterUpLimit = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterLowLimit !== undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterUpLimit = tmpShutterUpLimit
                openMessageBox(Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'))
                return
            }
            tmpShutterUpLimit = rowData.shutterUpLimit
            setAZData()
        }

        const changeShutterLowLimit = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.shutterUpLimit !== undefined && Number(rowData.shutterUpLimit) > Number(rowData.shutterLowLimit)) {
                rowData.shutterLowLimit = tmpShutterLowLimit
                openMessageBox(Translate('IDCS_LOWER_LIMIT_OVER_UPPER_LIMIT_TIP'))
                return
            }
            tmpShutterLowLimit = rowData.shutterLowLimit
            setAZData()
        }

        const changeIRCutMode = () => {
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
        const setAZData = async (setSchedule?: boolean, noRebootPrompt?: boolean, needRefresh?: boolean) => {
            if (!curAzChlId) return
            const rowData = getRowById(curAzChlId)
            let data = ''

            if (rowData.sharpen !== undefined) {
                data += rawXml`
                    <sharpen>
                        <switch>${Boolean(rowData.sharpenSwitch)}</switch>
                        <value>${rowData.sharpen}</value>
                    </sharpen>`
            }

            if (rowData.denoise !== undefined) {
                data += rawXml`
                    <denoise>
                        <switch>${Boolean(rowData.denoiseSwitch)}</switch>
                        <value>${rowData.denoise}</value>
                    </denoise>`
            }

            if (rowData.WDR !== undefined) {
                data += rawXml`
                    <WDR>
                        <switch>${Boolean(rowData.WDRSwitch)}</switch>
                        <value>${rowData.WDR}</value>
                    </WDR>`
            }

            if (rowData.imageShift !== undefined) {
                data += `<imageShift>${rowData.imageShift}</imageShift>`
            }

            if (rowData.whiteBalanceMode !== undefined) {
                data += rawXml`
                    <whiteBalance>
                        <mode>${rowData.whiteBalanceMode}</mode>
                        <red>${rowData.red || 0}</red>
                        <blue>${rowData.blue || 0}</blue>
                    </whiteBalance>`
            }

            if (rowData.mirrorSwitch !== undefined) {
                data += `<mirrorSwitch>${rowData.mirrorSwitch}</mirrorSwitch>`
            }

            if (rowData.flipSwitch !== undefined) {
                data += `<flipSwitch>${rowData.flipSwitch}</flipSwitch>`
            }

            if (rowData.BLCMode !== undefined) {
                data += rawXml`
                    <backlightCompensation>
                        <mode>${rowData.BLCMode}</mode>
                        <HWDRLevel>${rowData.HWDRLevel || ''}</HWDRLevel>
                    </backlightCompensation>`
            }

            if (rowData.cfgFile !== undefined) {
                data += `<cfgFile>${rowData.cfgFile}</cfgFile>`
            }

            if (rowData.HFR !== undefined) {
                data += `<HFR>${rowData.HFR}</HFR>`
            }

            if (rowData.imageRotate !== undefined) {
                data += `<imageRotate>${rowData.imageRotate}</imageRotate>`
            }

            if (rowData.IRCutMode) {
                data += `<IRCutMode>${rowData.IRCutMode}</IRCutMode>`

                if (rowData.IRCutDayTime !== undefined) {
                    data += `<IRCutDayTime>${rowData.IRCutDayTime}</IRCutDayTime>`
                }

                if (rowData.IRCutNightTime !== undefined) {
                    data += `<IRCutNightTime>${rowData.IRCutNightTime}</IRCutNightTime>`
                }

                if (rowData.IRCutConvSen !== undefined) {
                    data += `<IRCutConvSen>${rowData.IRCutConvSen}</IRCutConvSen>`
                }
            }

            if (rowData.smartIrMode !== undefined) {
                data += rawXml`
                    <smartIr>
                        <mode>${rowData.smartIrMode}</mode>
                        <lightLevel_1>${rowData.lightLevel || 0}</lightLevel_1>
                    </smartIr>`
            }

            if (rowData.smartIrSwitch !== undefined) {
                data += rawXml`
                    <smartIR>
                        <switch type='boolean' default='${Boolean(rowData.smartIrSwitchDefault)}'>${rowData.smartIrSwitch}</switch>
                        <level>${rowData.smartIrLevel || ''}</level>
                    </smartIR>`
            }

            if (rowData.defog !== undefined) {
                data += rawXml`
                    <fogReduction>
                        <switch>${Boolean(rowData.defogSwitch)}</switch>
                        <value>${rowData.defog}</value>
                    </fogReduction>`
            }

            if (rowData.antiflicker !== undefined) {
                data += `<antiflicker>${rowData.antiflicker}</antiflicker>`
            }

            if (rowData.irLightBright !== undefined) {
                data += `<irLightBright type="uint8">${rowData.irLightBright}</irLightBright>`
            }

            if (rowData.gainMode !== undefined) {
                data += rawXml`
                    <gain>
                        <mode>${rowData.gainMode || ''}</mode>
                        <value>${rowData.gain || 0}</value>
                        <AGC>${rowData.gainAGC || 0}</AGC>
                    </gain>
                `
            } else if (rowData.noGainMode) {
                data += rawXml`
                    <gain>
                        <value>${rowData.gain || 0}</value>
                        <AGC>${rowData.gainAGC || 0}</AGC>
                    </gain>
                `
            }

            if (rowData.delayTime !== undefined) {
                data += `<IRCutDelayTime>${rowData.delayTime}</IRCutDelayTime>`
            }

            if (rowData.InfraredMode !== undefined) {
                data += `<InfraredMode>${rowData.InfraredMode}</InfraredMode>`
            }

            if (rowData.shutterMode !== undefined) {
                data += rawXml`
                    <shutter>
                        <mode>${rowData.shutterMode}</mode>
                        <value>${rowData.shutter || ''}</value>
                        ${rowData.shutterLowLimit === undefined ? '' : '<lowLimit>' + rowData.shutterLowLimit + '</lowLimit>'}
                        ${rowData.shutterUpLimit === undefined ? '' : '<upLimit>' + rowData.shutterUpLimit + '</upLimit>'}
                    </shutter>`
            }

            if (rowData.whitelightMode !== undefined) {
                data += rawXml`
                    <Whitelight>
                        <WhitelightMode type='WhitelightMode' default='${rowData.whitelightModeDefault || false}'>${rowData.whitelightMode}</WhitelightMode>
                        <WhitelightStrength type="uint32" min="1" max="100" default="${rowData.whitelightStrengthDefault || 50}">${rowData.whitelightStrength || 0}</WhitelightStrength>
                        <WhitelightOnTime type="string" default="${rowData.whitelightOnTimeDefault || '00:00'}">${rowData.whitelightOnTime || ''}</WhitelightOnTime>
                        <WhitelightOffTime type="string" default="${rowData.whitelightOffTimeDefault || '23:59'}">${rowData.whitelightOffTime || ''}</WhitelightOffTime>
                    </Whitelight>`
            }

            if (rowData.dZoom !== undefined) {
                data += `<dZoomValue type="DigitalZoom">${rowData.dZoom}</dZoomValue>`
            }

            if (rowData.antiShakeDsp !== undefined) {
                data += rawXml`
                    <antiShakeDsp>
                        <switch>${rowData.antiShakeDsp}</switch>
                    </antiShakeDsp>`
            }

            if (rowData.illumination !== undefined) {
                data += rawXml`
                    <illumination>
                        <illuminationMode>${rowData.illumination}</illuminationMode>
                    </illumination>
                `
            }

            if (rowData.ImageOverExposure !== undefined) {
                data += rawXml`
                    <ImageOverExposure>
                        <ImageOverExposureMode>${rowData.ImageOverExposure}</ImageOverExposureMode>
                    </ImageOverExposure>`
            }

            if (setSchedule) {
                data += rawXml`
                    <scheduleInfo>
                        <program>${rowData.scheduleInfo.scheduleType === 'time' ? 'time' : rowData.scheduleInfo.program}</program>
                        <dayTime>${rowData.scheduleInfo.time[0]}</dayTime>
                        <nightTime>${rowData.scheduleInfo.time[1]}</nightTime>
                    </scheduleInfo>`
            }

            data = rawXml`
                <content>
                    <chl id='${rowData.id}'>
                        <rebootPrompt>${!noRebootPrompt}</rebootPrompt>
                        ${data}
                    </chl>
                </content>
            `

            const res = await editChlVideoParam(data)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                showFloatError('setting', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                if (needRefresh) {
                    getData(rowData.id, false, rowData.cfgFile)
                }
            } else {
                const rebootParam = $('rebootParam').text()
                if (rebootParam) {
                    checkReboot(rebootParam, () => {
                        setAZData(setSchedule, true)
                    })
                } else {
                    const errorCode = $('errorCode').text().num()
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                        msg = Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                    }
                    showFloatError('setting', msg)
                }
            }
        }

        const getDataList = async () => {
            openLoading()

            const res = await getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportImageSetting: true,
                requireField: ['supportIRCutMode', 'supportImageFusion'],
            })
            const $ = queryXml(res)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const chlId = ele.attr('id')
                    const isSupportHallway = pageData.value.hallwayChlList.includes(chlId)
                    const newData = new ChannelImageDto()
                    newData.id = chlId
                    newData.name = $item('name').text()
                    newData.chlType = $item('chlType').text()
                    newData.status = 'loading'
                    newData.isSupportHallway = isSupportHallway
                    newData.isSupportIRCutMode = $item('supportIRCutMode').text().bool()
                    newData.AccessType = $item('AccessType').text()
                    return newData
                })
                pageTotal.value = $('content').attr('total').num()
                expandedRowKeys.value = []
                azList = []
                tmpScheduleInfoList = []

                if (!tableData.value.length) return

                let onlineChlId = ''

                //请求显示设置数据
                tableData.value.forEach(async (item) => {
                    if (!onlineChlId && pageData.value.onlineChlList.includes(item.id)) {
                        onlineChlId = item.id
                    }

                    if (item.chlType !== 'recorder') {
                        getData(item.id, true)
                    } else {
                        item.status = ''
                    }

                    if (item.id === selectedChlId.value) {
                        formData.value = cloneDeep(item)
                        tableRef.value!.setCurrentRow(item)
                        selectedChlId.value = item.id
                    }
                })
            } else {
                selectedChlId.value = ''
            }
        }

        const getHallwayChlIds = async () => {
            const res = await getChlList({
                pageIndex: pageIndex.value || 1,
                pageSize: pageSize.value,
                isSupportImageRotate: true,
            })
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.hallwayChlList = $('content/item').map((ele) => {
                    return ele.attr('id')
                })
            }
        }

        let tmpScheduleInfoList: ChannelScheduleInfoDto[] = []
        const getData = async (chlId: string, needSchedule: boolean, cfgFile?: string) => {
            const data = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                    ${needSchedule ? '<scheduleInfo></scheduleInfo>' : ''}
                    ${cfgFile ? `<cfgFile>${cfgFile}</cfgFile>` : ''}
                </condition>`
            const res = await queryChlVideoParam(data)
            const $ = queryXml(res)
            const rowData = getRowById(chlId)
            if (!rowData) {
                return
            }

            if ($('status').text() === 'success') {
                const $chl = queryXml($('content/chl')[0].element)

                rowData.status = ''
                rowData.disabled = !pageData.value.onlineChlList.includes(rowData.id)

                if ($chl('imageFusion').length) {
                    // 热成像通道是否支持双光融合
                    rowData.isSupportImageFusion = true

                    rowData.imageFusion = {
                        switch: $chl('imageFusion/switch').text().bool(),
                        distance: $chl('imageFusion/distance').text().num(),
                        distanceUnit: $chl('imageFusion/distance').attr('unit'),
                        distanceMin: $chl('imageFusion/distance').attr('min').num(),
                        distanceMax: $chl('imageFusion/distance').attr('max').num(),
                        distanceFmin: $chl('imageFusion/distance').attr('fmin').num(),
                        distanceFmax: $chl('imageFusion/distance').attr('fmax').num(),
                        distanceDefault: $chl('imageFusion/distance').attr('default').num(),
                        distanceFdefault: $chl('imageFusion/distance').attr('fdefault').num(),
                        poolid: $chl('imageFusion/poolid').text().num(),
                        poolidDefault: $chl('imageFusion/poolid').attr('default').num(),
                        poolidMin: $chl('imageFusion/poolid').attr('min').num(),
                        poolidMax: $chl('imageFusion/poolid').attr('max').num(),
                        fusespeed: $chl('imageFusion/fusespeed').text().num(),
                        fusespeedDefault: $chl('imageFusion/fusespeed').attr('default').num(),
                        fusespeedMin: $chl('imageFusion/fusespeed').attr('min').num(),
                        fusespeedMax: $chl('imageFusion/fusespeed').attr('max').num(),
                    }
                }

                rowData.brightDefault = $chl('bright').attr('default').undef()?.num()
                rowData.bright = $chl('bright').text().undef()?.num()
                rowData.brightMin = $chl('bright').attr('min').num()
                rowData.brightMax = $chl('bright').attr('max').num() || 100
                if (rowData.bright === undefined) {
                    rowData.bright = rowData.brightDefault
                }

                rowData.contrast = $chl('contrast').text().undef()?.num()
                rowData.contrastMin = $chl('contrast').attr('min').num()
                rowData.contrastMax = $chl('contrast').attr('max').num() || 100
                rowData.contrastDefault = $chl('contrast').attr('default').undef()?.num()
                if (rowData.contrast === undefined) {
                    rowData.contrast = rowData.contrastDefault
                }

                // NT2-3481 设备接入海康IPC，协议不返回hue节点，“色调”配置项置灰
                rowData.hue = $chl('hue').text().undef()?.num()
                rowData.hueMin = $chl('hue').attr('min').num()
                rowData.hueMax = $chl('hue').attr('max').num() || 100
                rowData.hueDefault = $chl('hue').attr('default').undef()?.num()
                if (rowData.hue === undefined) {
                    rowData.hue = rowData.hueDefault
                }

                rowData.saturation = $chl('saturation').text().undef()?.num()
                rowData.saturationMin = $chl('saturation').attr('min').num()
                rowData.saturationMax = $chl('saturation').attr('max').num() || 100
                rowData.saturationDefault = $chl('saturation').attr('default').undef()?.num()
                if (rowData.saturation === undefined) {
                    rowData.saturation = rowData.saturationDefault
                }

                if (!$('content/chl').length || chlId !== $('content/chl').attr('id')) {
                    rowData.isSpeco = true
                }
                rowData.disabled = rowData.isSpeco

                rowData.paletteCode = $chl('palette/color').text().undef()
                rowData.defaultPaletteCode = $chl('palette/color').attr('default').undef()

                rowData.cfgFile = $chl('cfgFile').text().undef()
                rowData.cfgFileDefault = $chl('cfgFile').attr('default').undef()

                rowData.denoise = $chl('denoise/value').text().undef()?.num()
                rowData.denoiseMin = $chl('denoise/value').attr('min').num()
                rowData.denoiseMax = $chl('denoise/value').attr('max').num() || 100
                rowData.denoiseDefault = $chl('denoise/value').attr('default').undef()?.num()
                if (rowData.denoise === undefined) {
                    rowData.denoise = rowData.denoiseDefault
                }

                rowData.denoiseSwitch = $chl('denoise/switch').text().undef()?.bool()
                rowData.denoiseSwitchDefault = $chl('denoise/switch').attr('default').undef()?.bool()
                if (rowData.denoiseSwitch === undefined) {
                    rowData.denoiseSwitch = rowData.denoiseSwitchDefault
                }

                // NT2-3947 此节点为false, 则为4.2.1版本ipc，隐藏增益模式
                // rowData.ShowGainMode = $chl('ShowGainMode').text().bool()

                rowData.WDR = $chl('WDR/value').text().undef()?.num()
                rowData.WDRDefault = $chl('WDR/value').attr('default').undef()?.num()
                rowData.WDRMin = $chl('WDR/value').attr('min').num()
                rowData.WDRMax = $chl('WDR/value').attr('max').num() || 100
                if (rowData.WDR === undefined) {
                    rowData.WDR = rowData.WDRDefault
                }

                rowData.WDRSwitch = $chl('WDR/switch').text().undef()?.bool()
                rowData.WDRSwitchDefault = $chl('WDR/switch').attr('default').undef()?.bool()
                if (rowData.WDRSwitch === undefined) {
                    rowData.WDRSwitch = rowData.WDRSwitchDefault
                }

                rowData.dZoom = $chl('dZoomValue').text().undef()
                rowData.dZoomDefault = $chl('dZoomValue').attr('default').undef()

                rowData.HFR = $chl('HFR').text().undef()?.bool()

                rowData.whiteBalanceMode = $chl('whiteBalance/mode').text().undef()
                rowData.whiteBalanceModeDefault = $chl('whiteBalance/mode').attr('default').undef()
                if (rowData.whiteBalanceMode === undefined) {
                    rowData.whiteBalanceMode = rowData.whiteBalanceModeDefault
                }

                rowData.red = $chl('whiteBalance/red').text().undef()?.num()
                rowData.redDefault = $chl('whiteBalance/red').attr('default').undef()?.num()
                rowData.redMin = $chl('whiteBalance/red').attr('min').num()
                rowData.redMax = $chl('whiteBalance/red').attr('max').num() || 100
                if (rowData.red === undefined) {
                    rowData.red = rowData.redDefault
                }

                rowData.blue = $chl('whiteBalance/blue').text().undef()?.num()
                rowData.blueDefault = $chl('whiteBalance/blue').attr('default').undef()?.num()
                rowData.blueMin = $chl('whiteBalance/blue').attr('min').num()
                rowData.blueMax = $chl('whiteBalance/blue').attr('max').num() || 100
                if (rowData.blue === undefined) {
                    rowData.blue = rowData.blueDefault
                }

                rowData.IRCutMode = $chl('IRCutMode').text().undef()
                rowData.IRCutModeDefault = $chl('IRCutMode').attr('default').undef()
                if (rowData.IRCutMode === undefined) {
                    rowData.IRCutMode = rowData.IRCutModeDefault
                }
                rowData.IRCutConvSen = $chl('IRCutConvSen').text().undef() ?? 'mid'
                rowData.IRCutConvSen2 = $chl('IRCutConvSen').text().undef()
                rowData.IRCutConvSenDefault = $chl('IRCutConvSen').attr('default').undef()
                if (rowData.IRCutConvSen === undefined) {
                    rowData.IRCutConvSen = rowData.IRCutConvSenDefault
                }

                rowData.IRCutDayTime = $chl('IRCutDayTime').text().undef()
                rowData.IRCutNightTime = $chl('IRCutNightTime').text().undef()

                rowData.sharpen = $chl('sharpen/value').text().undef()?.num()
                rowData.sharpenDefault = $chl('sharpen/value').attr('default').undef()?.num()
                rowData.sharpenMin = $chl('sharpen/value').attr('min').num()
                rowData.sharpenMax = $chl('sharpen/value').attr('max').num() || 100
                if (rowData.sharpen === undefined) {
                    rowData.sharpen = rowData.sharpenDefault
                }

                rowData.sharpenSwitchDefault = $chl('sharpen/switch').attr('default').undef()?.bool()
                rowData.sharpenSwitch = $chl('sharpen/switch').text().undef()?.bool()
                rowData.sharpenSwitchEnable = $chl('sharpen/switch').attr('switchEnabled').undef()?.bool()
                if (rowData.sharpenSwitch === undefined) {
                    rowData.sharpenSwitch = rowData.sharpenSwitchDefault
                }

                rowData.mirrorSwitch = $chl('mirrorSwitch').text().undef()?.bool()
                rowData.mirrorSwitchDefault = $chl('mirrorSwitch').attr('default').undef()?.bool()
                if (rowData.mirrorSwitch === undefined) {
                    rowData.mirrorSwitch = rowData.mirrorSwitchDefault
                }

                rowData.flipSwitch = $chl('flipSwitch').text().undef()?.bool()
                rowData.flipSwitchDefault = $chl('flipSwitch').attr('default').undef()?.bool()
                if (rowData.flipSwitch === undefined) {
                    rowData.flipSwitch = rowData.flipSwitchDefault
                }

                rowData.imageRotate = $chl('imageRotate').text().undef()
                rowData.imageRotateDefault = $chl('imageRotate').attr('default').undef()

                rowData.imageShift = $chl('imageShift').text().num()
                rowData.imageShiftDefault = $chl('imageShift').attr('default').undef()?.num()
                rowData.imageShiftMin = $chl('imageShift').attr('min').num()
                rowData.imageShiftMax = $chl('imageShift').attr('max').num() || 100

                rowData.BLCMode = $chl('backlightCompensation/mode').text().undef()
                rowData.BLCModeDefault = $chl('backlightCompensation/mode').attr('default').undef()
                if (rowData.BLCMode === undefined) {
                    rowData.BLCMode = rowData.BLCModeDefault
                }

                rowData.HWDRLevel = $chl('backlightCompensation/HWDRLevel').text().undef()
                rowData.HWDRLevelDefault = $chl('backlightCompensation/HWDRLevel').attr('default').undef()
                if (rowData.HWDRLevel === undefined) {
                    rowData.HWDRLevel = rowData.HWDRLevelDefault
                }

                rowData.smartIrMode = $chl('smartIr/mode').text().undef()
                rowData.smartIrModeDefault = $chl('smartIr/mode').attr('default').undef()
                if (rowData.smartIrMode === undefined) {
                    rowData.smartIrMode = rowData.smartIrModeDefault
                }

                rowData.lightLevel = $chl('smartIr/lightLevel_1').text().undef()?.num()
                rowData.lightLevelDefault = $chl('smartIr/lightLevel_1').attr('default').undef()?.num()
                rowData.lightLevelMin = $chl('smartIr/lightLevel_1').attr('min').num()
                rowData.lightLevelMax = $chl('smartIr/lightLevel_1').attr('max').num() || 100
                if (rowData.lightLevel === undefined) {
                    rowData.lightLevel = rowData.lightLevelDefault
                }

                rowData.smartIrSwitch = $chl('smartIR/switch').text().undef()?.bool()
                rowData.smartIrSwitchDefault = $chl('smartIR/switch').attr('default').undef()?.bool()
                if (rowData.smartIrSwitch === undefined) {
                    rowData.smartIrSwitch = rowData.smartIrSwitchDefault
                }

                rowData.smartIrLevel = $chl('smartIR/level').text().undef()
                rowData.smartIrLevelDefault = $chl('smartIR/level').attr('default').undef()
                if (rowData.smartIrLevel === undefined) {
                    rowData.smartIrLevel = rowData.smartIrLevelDefault
                }

                // 透雾
                rowData.defog = $chl('fogReduction/value').text().undef()?.num()
                rowData.defogDefault = $chl('fogReduction/value').attr('default').undef()?.num()
                rowData.defogMin = $chl('fogReduction/value').attr('min').num()
                rowData.defogMax = $chl('fogReduction/value').attr('max').num() || 100
                if (rowData.defog === undefined) {
                    rowData.defog = rowData.defogDefault
                }

                rowData.defogSwitchDefault = $chl('fogReduction/switch').attr('default').undef()?.bool()
                rowData.defogSwitch = $chl('fogReduction/switch').text().undef()?.bool()
                if (rowData.defogSwitch === undefined) {
                    rowData.defogSwitch = rowData.defogSwitchDefault
                }

                // 抗闪
                rowData.antiflicker = $chl('antiflicker').text().undef()
                rowData.antiflickerDefault = $chl('antiflicker').attr('default').undef()
                if (rowData.antiflicker === undefined) {
                    rowData.antiflicker = rowData.antiflickerDefault
                }

                // 曝光模式
                rowData.exposureMode = $chl('autoExposureMode/mode').text().undef()
                rowData.exposureModeDefault = $chl('autoExposureMode/mode').attr('default').undef()

                rowData.exposure = $chl('autoExposureMode/value').text().undef()?.num()
                rowData.exposureDefault = $chl('autoExposureMode/value').attr('default').undef()?.num()
                rowData.exposureMin = $chl('autoExposureMode/value').attr('min').num()
                rowData.exposureMax = $chl('autoExposureMode/value').attr('max').num() || 100
                if (rowData.exposure === undefined) {
                    rowData.exposure = rowData.exposureDefault
                }

                // 延迟时间
                rowData.delayTime = $chl('IRCutDelayTime').text().undef()?.num()
                rowData.delayTimeDefault = $chl('IRCutDelayTime').attr('default').undef()?.num()
                rowData.delayTimeMin = $chl('IRCutDelayTime').attr('min').num()
                rowData.delayTimeMax = $chl('IRCutDelayTime').attr('max').num() || 100
                if (rowData.delayTime === undefined) {
                    rowData.delayTime = rowData.delayTimeDefault
                }

                // 红外模式
                rowData.InfraredMode = $chl('InfraredMode').text().undef()
                rowData.InfraredModeDefault = $chl('InfraredMode').attr('default').undef()
                if (rowData.InfraredMode === undefined) {
                    rowData.InfraredMode = rowData.InfraredModeDefault
                }

                // 红外灯的亮度
                rowData.irLightBright = $chl('irLightBright').text().undef()?.num()
                rowData.irLightBrightDefault = $chl('irLightBright').attr('default').undef()?.num()
                rowData.irLightBrightMin = $chl('irLightBright').attr('min').num()
                rowData.irLightBrightMax = $chl('irLightBright').attr('max').num() || 100
                if (rowData.irLightBright === undefined) {
                    rowData.irLightBright = rowData.irLightBrightDefault
                }

                // 增益限制
                // 5.3 IPC增益
                if ($chl('autoExposureMode/gain').length) {
                    rowData.noGainMode = true

                    rowData.gainAGC = $chl('autoExposureMode/gain/AGC').text().undef()?.num()
                    rowData.gainAGCDefault = $chl('autoExposureMode/gain/AGC').attr('default').undef()?.num()
                    rowData.gainAGCMin = $chl('autoExposureMode/gain/AGC').attr('min').num()
                    rowData.gainAGCMax = $chl('autoExposureMode/gain/AGC').attr('max').num()
                    if (rowData.gainAGC === undefined) {
                        rowData.gainAGC = rowData.gainAGCDefault
                    }

                    rowData.gain = $chl('autoExposureMode/gain/value').text().undef()?.num()
                    rowData.gainDefault = $chl('autoExposureMode/gain/value').attr('default').undef()?.num()
                    rowData.gainMin = $chl('autoExposureMode/gain/value').attr('min').num()
                    rowData.gainMax = $chl('autoExposureMode/gain/value').attr('max').num() || 100
                    if (rowData.gain === undefined) {
                        rowData.gain = rowData.gainDefault
                    }
                } else {
                    rowData.noGainMode = false

                    rowData.gainMode = $chl('gain/mode').text().undef()
                    rowData.gainModeDefault = $chl('gain/mode').attr('default').undef()
                    if (rowData.gainMode === undefined) {
                        rowData.gainMode = rowData.gainModeDefault
                    }

                    rowData.gainAGC = $chl('gain/AGC').text().undef()?.num()
                    rowData.gainAGCDefault = $chl('gain/AGC').attr('default').undef()?.num()
                    rowData.gainAGCMin = $chl('gain/AGC').attr('min').num()
                    rowData.gainAGCMax = $chl('gain/AGC').attr('max').num()
                    if (rowData.gainAGC === undefined) {
                        rowData.gainAGC = rowData.gainAGCDefault
                    }

                    rowData.gain = $chl('gain/value').text().undef()?.num()
                    rowData.gainDefault = $chl('gain/value').attr('default').undef()?.num()
                    rowData.gainMin = $chl('gain/value').attr('min').num()
                    rowData.gainMax = $chl('gain/value').attr('max').num() || 100
                    if (rowData.gain === undefined) {
                        rowData.gain = rowData.gainDefault
                    }
                }

                // 获取IPC设备版本号判断是否支持增益模式配置
                rowData.IPCVersion = $chl('DetailedSoftwareVersion').text()

                // 快门
                rowData.shutterMode = $chl('shutter/mode').text().undef()
                rowData.shutterModeDefault = $chl('shutter/mode').attr('default').undef()
                if (rowData.shutterMode === undefined) {
                    rowData.shutterMode = rowData.shutterModeDefault
                }

                rowData.shutter = $chl('shutter/value').text().undef()
                rowData.shutterDefault = $chl('shutter/value').attr('default').undef()
                if (rowData.shutter === undefined) {
                    rowData.shutter = rowData.shutterDefault
                }

                rowData.shutterLowLimit = $chl('shutter/lowLimit').text().undef()
                rowData.shutterLowLimitDefault = $chl('shutter/lowLimit').attr('default').undef()
                if (rowData.shutterLowLimit === undefined) {
                    rowData.shutterLowLimit = rowData.shutterLowLimitDefault
                }

                rowData.shutterUpLimit = $chl('shutter/upLimit').text().undef()
                rowData.shutterUpLimitDefault = $chl('shutter/upLimit').attr('default').undef()
                if (rowData.shutterUpLimit === undefined) {
                    rowData.shutterUpLimit = rowData.shutterUpLimitDefault
                }

                // 白光灯
                rowData.whitelightMode = $chl('Whitelight/WhitelightMode').text().undef()
                rowData.whitelightModeDefault = $chl('Whitelight/WhitelightMode').attr('default').undef()
                if (rowData.shutterUpLimit === undefined) {
                    rowData.shutterUpLimit = rowData.shutterUpLimitDefault
                }

                rowData.whitelightStrength = $chl('Whitelight/WhitelightStrength').text().undef()?.num()
                rowData.whitelightStrengthMin = $chl('Whitelight/WhitelightStrength').attr('min').num()
                rowData.whitelightStrengthMax = $chl('Whitelight/WhitelightStrength').attr('max').num() || 100
                rowData.whitelightStrengthDefault = $chl('Whitelight/WhitelightStrength').attr('default').undef()?.num()
                if (rowData.whitelightStrength === undefined) {
                    rowData.whitelightStrength = rowData.whitelightStrengthDefault
                }

                rowData.whitelightOnTime = $chl('Whitelight/WhitelightOnTime').text().undef()
                rowData.whitelightOnTimeDefault = $chl('Whitelight/WhitelightOnTime').attr('default').undef()
                if (rowData.whitelightOnTime === undefined) {
                    rowData.whitelightOnTime = rowData.whitelightOnTimeDefault || '00:00'
                }

                rowData.whitelightOffTime = $chl('Whitelight/WhitelightOffTime').text().undef()
                rowData.whitelightOffTimeDefault = $chl('Whitelight/WhitelightOffTime').attr('default').undef()
                if (rowData.whitelightOffTime === undefined) {
                    rowData.whitelightOffTime = rowData.whitelightOffTimeDefault || '23:59'
                }

                if (needSchedule) {
                    if ($chl('scheduleInfo').text()) {
                        rowData.supportSchedule = true
                        rowData.scheduleInfo.program = $chl('scheduleInfo/program').text()
                        rowData.scheduleInfo.time = [$chl('scheduleInfo/dayTime').text(), $chl('scheduleInfo/nightTime').text()]
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

                // 电子防抖
                rowData.antiShakeDsp = $chl('antiShakeDsp/switch').text().undef()?.bool()

                // 补光模式
                rowData.illumination = $chl('illumination/illuminationMode').text().undef()

                // 防补光模式
                rowData.ImageOverExposure = $chl('ImageOverExposure/ImageOverExposureMode').text().undef()

                // NTA1-998 存入每个热成像通道的色标枚举，选中通道时再初始化下拉框
                rowData.paletteList = $('types/paletteType/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: paletteTypeMap[ele.text()],
                    }
                })

                rowData.cfgFileList = $('types/configFileType/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: configFileTypeMap[ele.text()],
                    }
                })
                rowData.shutterModeList = $('types/shutterMode/enum').map((ele) => {
                    return {
                        value: exposureModeKeyMap[ele.text()],
                        label: exposureModeMap[ele.text()],
                    }
                })
                rowData.shutterList = $('types/shutterValue/enum').map((ele, index) => {
                    return {
                        value: index + '',
                        label: ele.text(),
                    }
                })
                rowData.whiteBalanceModeList = $('types/whiteBalance/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: whiteBalanceMode[ele.text()],
                    }
                })
                rowData.DigitalZoomList = $('types/DigitalZoom/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: DigitalZoomMap[ele.text()],
                    }
                })
                rowData.BLCModeList = $('types/BLCMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: BLCMode[ele.text()],
                    }
                })
                rowData.HWDRLevelList = $('types/HWDRLevel/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: HWDRLevel[ele.text()],
                    }
                })
                rowData.IRCutModeList = $('types/IRCutMode/enum')
                    .map((ele) => {
                        return {
                            value: ele.text(),
                            label: DayNightModeMap[ele.text()] || '',
                        }
                    })
                    .filter((ele) => ele.label)
                rowData.IRCutConvSenList = $('types/IRCutConvSen/enum')
                    .map((ele) => {
                        return {
                            value: ele.text(),
                            label: SensortyMap[ele.text()] || '',
                        }
                    })
                    .filter((ele) => ele.label)
                rowData.SmartIrList = $('types/SmartIRMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: SmartIRMap[ele.text()],
                    }
                })
                rowData.antiflickerModeList = $('types/antiflickerMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: antiFlickerMap[ele.text()],
                    }
                })
                rowData.InfraredModeList = $('types/InfraredMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: infraredModeMap[ele.text()],
                    }
                })
                rowData.exposureModeList = $('types/autoExposureMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: exposureModeMap[ele.text()],
                    }
                })
                rowData.exposureList = $('types/autoExposureValue/enum').map((ele) => {
                    const text = ele.text()
                    return {
                        value: Math.floor(Number(rowData.exposureMax) / (text === '1' ? 1 : parseInt(text.split('/')[1]))),
                        label: text,
                    }
                })
                rowData.gainModeList = $('types/gainMode/enum').map((ele) => {
                    return {
                        value: exposureModeKeyMap[ele.text()],
                        label: exposureModeMap[ele.text()],
                    }
                })
                rowData.illuminationModeList = $('types/illuminationMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: illuminationModeMap[ele.text()],
                    }
                })
                rowData.ImageOverExposureModeList = $('types/ImageOverExposureMode/enum').map((ele) => {
                    return {
                        value: ele.text(),
                        label: ImageOverExposureModeMap[ele.text()],
                    }
                })

                if (chlId === selectedChlId.value) {
                    formData.value = cloneDeep(rowData)
                }
            } else {
                rowData.status = ''
                if (chlId === selectedChlId.value) {
                    formData.value = cloneDeep(rowData)
                }
            }
        }

        /**
         * 编辑通道视频参数
         * @param rowData
         * @param noRebootPrompt 是否需要重启提示判断（默认需要）
         */
        const setData = async (rowData: ChannelImageDto, noRebootPrompt = false) => {
            const data = rawXml`
                <content>
                    ${
                        rowData.paletteCode
                            ? rawXml`
                                <chl id='${rowData.id}'>
                                    <rebootPrompt>${!noRebootPrompt}</rebootPrompt>
                                    <palette>
                                        <color type='paletteType'>${rowData.paletteCode}</color>
                                    </palette>
                                </chl>
                            `
                            : rawXml`
                                <chl id='${rowData.id}'>
                                    <rebootPrompt>${!noRebootPrompt}</rebootPrompt>
                                    <cfgFile>${rowData.cfgFile ?? ''}</cfgFile>
                                    <bright>${rowData.bright ?? ''}</bright>
                                    <contrast>${rowData.contrast ?? ''}</contrast>
                                    <hue>${rowData.hue ?? ''}</hue>
                                    <saturation>${rowData.saturation ?? ''}</saturation>
                                </chl>
                            `
                    }
                </content>
            `
            openLoading()
            const res = await editChlVideoParam(data)
            const $ = queryXml(res)
            closeLoading()

            if ($('status').text() === 'success') {
                showFloatError('setting', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
            } else {
                const rebootParam = $('rebootParam').text()
                if (rebootParam) {
                    checkReboot(rebootParam, () => {
                        setData(rowData, true)
                    })
                } else {
                    const errorCode = $('errorCode').text().num()
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                        // 通道离线（节点不存在）
                        msg += Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(rowData.name)
                    }
                    showFloatError('setting', msg)
                }
            }
        }

        // 重启提示
        const checkReboot = (rebootParam: string, callback: () => void) => {
            if (layoutStore.messageBoxCount) {
                return
            }
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

        const getSupportAz = async (chlId: string) => {
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
            const res = await queryCameraLensCtrlParam(data)
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
                if (reg1.test(focusType)) {
                    newData.focusTypeList.push({
                        value: 'manual',
                        label: focusModeMap.manual,
                    })
                }

                if (reg2.test(focusType)) {
                    newData.focusTypeList.push({
                        value: 'auto',
                        label: focusModeMap.auto,
                    })
                }

                newData.timeIntervalList = $('content/chl/timeIntervalNote')
                    .text()
                    .array()
                    .map((ele) => {
                        return {
                            value: ele,
                            label: ele === '0' ? Translate('IDCS_ALWAYS_KEEP') : getTranslateForSecond(Number(ele)),
                        }
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
        }

        const cmdQueue = useCmdQueue()

        const addCmd = (cmd: string, chlId: string) => {
            if (!curLensCtrl.value.supportAz) return
            if (!chlId) return
            cmdQueue.add(async () => {
                const data = rawXml`
                    <content>
                        <chlId>${chlId}</chlId>
                        <actionType>${cmd}</actionType>
                    </content>
                `
                await cameraLensCtrlCall(data)
            })
        }

        const saveLensCtrlData = async () => {
            const data = rawXml`
                <content>
                    <chl id='${curLensCtrl.value.id}'>
                        <focusType type="focusType">${curLensCtrl.value.focusType}</focusType>
                        <IrchangeFocus>${curLensCtrl.value.IrchangeFocus}</IrchangeFocus>
                        <timeInterval>${curLensCtrl.value.focusType === 'manual' ? '0' : curLensCtrl.value.timeInterval}</timeInterval>
                    </chl>
                </content>`
            try {
                const res = await editCameraLensCtrlParam(data)
                const $ = queryXml(res)
                if ($('status').text() === 'success' || $('errorCode').text() === '0') {
                    showFloatError('lens', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
                } else {
                    showFloatError('lens', Translate('IDCS_SAVE_DATA_FAIL'))
                }
            } catch {
                showFloatError('lens', Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        const saveFusionConfig = async (row: ChannelImageDto) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chl id='${row.id}'>
                        <imageFusion>
                            <switch>${row.imageFusion.switch}</switch>
                            <distance>${row.imageFusion.distance}</distance>
                            <poolid>${row.imageFusion.poolid}</poolid>
                            <fusespeed>${row.imageFusion.fusespeed}</fusespeed>
                        </imageFusion>
                    </chl>
                </content>`
            const result = await editChlVideoParam(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                showFloatError('setting', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
            } else {
                const rebootParam = $('rebootParam').text()
                if (rebootParam) {
                    checkReboot(rebootParam, () => {
                        setData(row, true)
                    })
                } else {
                    const errorCode = $('errorCode').text().num()
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                        msg = Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(row.name)
                    }
                    showFloatError('setting', msg)
                }
            }
        }

        const saveFusionOffset = async (row: ChannelImageDto, direction: string) => {
            const sendXml = rawXml`
                <types>
                    <fusionOffsetType>
                        <enum>up</enum>
                        <enum>down</enum>
                        <enum>left</enum>
                        <enum>right</enum>
                    </fusionOffsetType>
                </types>
                <condition>
                    <chlId>${row.id}</chlId>
                </condition>
                <requireField>
                    <param>
                        <speed>${row.imageFusion.fusespeed}</speed>
                        <fusionoffset type="fusionOffsetType">${direction}</fusionoffset>
                    </param>
                </requireField>
            `
            const result = await editFusionOffset(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                showFloatError('setting', Translate('IDCS_SAVE_DATA_SUCCESS'), 'ok')
            } else {
                const rebootParam = $('rebootParam').text()
                if (rebootParam) {
                    checkReboot(rebootParam, () => {
                        setData(row, true)
                    })
                } else {
                    const errorCode = $('errorCode').text().num()
                    let msg = Translate('IDCS_SAVE_DATA_FAIL')
                    if (errorCode === ErrorCode.USER_ERROR_NODE_NET_OFFLINE || errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                        msg = Translate('IDCS_IP_CHANNEL_OFFLINE').formatForLang(row.name)
                    }
                    showFloatError('setting', msg)
                }
            }
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

        const changeProgram = (rowData: ChannelImageDto) => {
            if (rowData.scheduleInfo.program === 'auto') return
            rowData.cfgFile = rowData.scheduleInfo.program
            getData(rowData.id, false, rowData.cfgFile)
        }

        const changeTimeType = () => {
            const rowData = getRowById(selectedChlId.value)
            if (rowData.scheduleInfo.time[0] && rowData.scheduleInfo.time[1]) {
                scheduleLine.value!.resetValue([[rowData.scheduleInfo.time[0], rowData.scheduleInfo.time[1]]])
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

        watch(selectedChlId, () => {
            play()
        })

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
                    changeTimeType()
                }
            },
            {
                immediate: true,
            },
        )

        onMounted(async () => {
            await getOnlineChlList()
            await getHallwayChlIds()
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
            scheduleLine,
            changePageSize,
            changePage,
            changeHSL,
            handleRowClick,
            handleChlSel,
            changePaletteCode,
            showMore,
            resetData,
            handleExpandChange,
            addCmd,
            saveLensCtrlData,
            filteredScheduleInfoEnum,
            changeProgram,
            changeTimeType,
            changeCfgFile,
            changeExposureMode,
            changeShutterUpLimit,
            changeShutterLowLimit,
            changeIRCutMode,
            setAZData,
            onReady,
            floatErrorType,
            floatErrorMessage,
            floatLensMessage,
            saveFusionOffset,
            saveFusionConfig,
        }
    },
})
