/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:09:06
 * @Description: 日期与时间
 */
import dayjs from 'dayjs'
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        let interval: NodeJS.Timeout | number = 0

        const formData = ref(new SystemDateTimeForm())

        const formRef = useFormRef()

        const formRules = ref<FormRules>({
            ntpInterval: [
                {
                    validator(_, _value, callback) {
                        if (pageData.value.isNtpIntervalOutOfRange) {
                            callback(new Error(Translate('IDCS_NTP_INTERVAL') + Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(formData.value.ntpIntervalMin, formData.value.ntpIntervalMax)))
                            pageData.value.isNtpIntervalOutOfRange = false
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        // 同步方式与显示文本映射
        const SYNC_TYPE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_MANUAL'),
            NTP: Translate('IDCS_TIME_SERVER_SYNC'),
            Gmouse: Translate('IDCS_TIME_GPS_SYNC'),
        }

        // 日期格式与显示文本映射
        const DATE_FORMAT_MAPPING = getTranslateMapping(DEFAULT_DATE_FORMAT_MAPPING)
        const TIME_FORMAT_MAPPING = getTranslateMapping(DEFAULT_TIME_FORMAT_MAPPING)

        const pageData = ref({
            // 同步类型选项
            syncTypeOptions: [] as SelectOption<string, string>[],
            // 日期格式选项
            dateFormatOptions: [] as SelectOption<string, string>[],
            // 时间格式选项
            timeFormatOptions: [] as SelectOption<string, string>[],
            // 时间服务器选项
            timeServerOptions: [] as SelectOption<string, string>[],
            gpsBaudRateOptions: arrayToOptions(['1200', '2400', '4800', '9600', '19200', '38400', '57600', '115200']),
            // 时区选项
            timeZoneOption: DEFAULT_TIME_ZONE.map((item) => {
                return {
                    ...item,
                    label: Translate('IDCS_TIME_ZONE_' + item.langKey),
                }
            }).sort((a, b) => a.sortKey - b.sortKey),
            // 从请求获取的系统时间，用于时钟的计算
            systemTime: '',
            // 请求结束的时间，用于时钟的计算
            startTime: 0,
            isNtpIntervalOutOfRange: false,
        })

        // 系统时间改变标识 (同步本地时间或手动更改)
        let isSystemTimeChanged = false
        // 系统时间手动改变标识（仅手动更改）
        let isTimePickerChanged = false
        const currentTimezone = ''
        const currentDST = false

        // 系统时间最小值
        const SERVER_START_TIME = dayjs('2010-01-01', { jalali: false, format: DEFAULT_YMD_FORMAT })
        // 系统时间最大值
        const SERVER_END_TIME = dayjs('2037-12-31', { jalali: false, format: DEFAULT_YMD_FORMAT })

        // 显示时间格式
        const formatSystemTime = computed(() => {
            return DEFAULT_MOMENT_MAPPING[formData.value.dateFormat] + ' ' + DEFAULT_MOMENT_MAPPING[formData.value.timeFormat]
        })

        /**
         * @description 是否同步选项改变回调
         */
        const handleIsSyncChange = () => {
            // if (formData.value.isSync) {
            isSystemTimeChanged = true
            formData.value.systemTime = dayjs().calendar('gregory').format(DEFAULT_DATE_FORMAT)
            pageData.value.systemTime = dayjs().calendar('gregory').format(DEFAULT_DATE_FORMAT)
            pageData.value.startTime = performance.now()
            // }
            isTimePickerChanged = false
            clock()
        }

        /**
         * @description 同步方式改变时回调
         */
        const handleSyncTypeChange = () => {
            isTimePickerChanged = false
        }

        /**
         * @description 定时更新时间
         */
        const renderTime = () => {
            const now = performance.now()
            formData.value.systemTime = dayjs(pageData.value.systemTime, { jalali: false, format: DEFAULT_DATE_FORMAT })
                .add(now - pageData.value.startTime, 'millisecond')
                .calendar('gregory')
                .format(DEFAULT_DATE_FORMAT)
        }

        /**
         * @description 定时更新时间
         */
        const clock = () => {
            renderTime()
            clearInterval(interval)
            interval = setInterval(renderTime, 1000)
        }

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            openLoading()

            const $ = await dateTime.getTimeConfig()

            pageData.value.syncTypeOptions = $('types/synchronizeType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: SYNC_TYPE_MAPPING[item.text()],
                }
            })

            formData.value.dateFormat = $('content/formatInfo/date').text()
            pageData.value.dateFormatOptions = $('types/dateFormat/enum').map((item) => {
                return {
                    value: item.text(),
                    label: DATE_FORMAT_MAPPING[item.text()],
                }
            })

            formData.value.timeFormat = $('content/formatInfo/time').text()
            pageData.value.timeFormatOptions = $('types/timeFormat/enum').map((item) => {
                return {
                    value: item.text(),
                    label: TIME_FORMAT_MAPPING[item.text()],
                }
            })

            formData.value.syncType = $('content/synchronizeInfo/type').text()

            formData.value.timeServer = $('content/synchronizeInfo/ntpServer').text().trim()
            pageData.value.timeServerOptions = $('types/ntpServerType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: item.text(),
                }
            })
            formData.value.timeServerMaxByteLen = $('content/synchronizeInfo/ntpServer').attr('maxByteLen').num() || nameByteMaxLen

            formData.value.timeZone = $('content/timezoneInfo/timeZone').text()
            formData.value.enableDST = $('content/timezoneInfo/daylightSwitch').text().bool()

            formData.value.gpsBaudRate = $('content/synchronizeInfo/gpsBaudRate').text()
            formData.value.gpsBaudRateMin = $('content/synchronizeInfo/gpsBaudRate').attr('min').num()
            formData.value.gpsBaudRateMax = $('content/synchronizeInfo/gpsBaudRate').attr('max').num()

            formData.value.ntpInterval = $('content/synchronizeInfo/ntpInterval').text().num()
            formData.value.ntpIntervalMin = $('content/synchronizeInfo/ntpInterval').attr('min').num()
            formData.value.ntpIntervalMax = $('content/synchronizeInfo/ntpInterval').attr('max').num()

            let currentDate = dateTime.getSystemTime()
            if (currentDate.isBefore(SERVER_START_TIME)) {
                currentDate = SERVER_START_TIME
            } else if (currentDate.isAfter(SERVER_END_TIME)) {
                currentDate = SERVER_END_TIME
            }

            nextTick(() => {
                formData.value.systemTime = currentDate.calendar('gregory').format(DEFAULT_DATE_FORMAT)
                pageData.value.startTime = performance.now()
                pageData.value.systemTime = formData.value.systemTime
                clock()
            })

            closeLoading()
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <types>
                    <synchronizeType>
                        ${wrapEnums(pageData.value.syncTypeOptions)}
                    </synchronizeType>
                    <dateFormat>
                        ${wrapEnums(pageData.value.dateFormatOptions)}
                    </dateFormat>
                    <timeFormat>
                        ${wrapEnums(pageData.value.timeFormatOptions)}
                    </timeFormat>
                </types>
                <content>
                    <timezoneInfo>
                        <timeZone>${wrapCDATA(formData.value.timeZone)}</timeZone>
                        <daylightSwitch>${formData.value.enableDST}</daylightSwitch>
                    </timezoneInfo>
                    <synchronizeInfo>
                        <type type="synchronizeType">${formData.value.syncType}</type>
                        <ntpServer>${wrapCDATA(formData.value.timeServer)}</ntpServer>
                        <gpsBaudRate>${wrapCDATA(formData.value.gpsBaudRate + '')}</gpsBaudRate>
                        <ntpInterval>${wrapCDATA(formData.value.ntpInterval + '')}</ntpInterval>
                        ${isSystemTimeChanged ? `<currentTime>${wrapCDATA(formatGregoryDate(formData.value.systemTime, formatSystemTime.value, DEFAULT_DATE_FORMAT))}</currentTime>` : ''}
                    </synchronizeInfo>
                    <formatInfo>
                        <date type="dateFormat">${formData.value.dateFormat}</date>
                        <time type="timeFormat">${formData.value.timeFormat}</time>
                    </formatInfo>
                </content>
            `
            const result = await editTimeCfg(sendXml)

            closeLoading()

            isSystemTimeChanged = false
            isTimePickerChanged = false
            getData()
            commSaveResponseHandler(result)
        }

        // 禁用夏令时勾选
        const isDSTDisabled = computed(() => {
            const findItem = DEFAULT_TIME_ZONE.find((item) => formData.value.timeZone === item.timeZone)
            if (findItem) return !findItem.enableDst
            return true
        })

        const handleNtpIntervalOutOfRange = () => {
            pageData.value.isNtpIntervalOutOfRange = true
            formRef.value?.validateField('ntpInterval')
        }

        /**
         * @description 日历组件选择时间
         */
        const handleSystemTimeChange = () => {
            isSystemTimeChanged = true
            isTimePickerChanged = true
        }

        /**
         * @description 更改系统时间时，停止定时器
         * @param {boolean} bool
         */
        const pendingSystemTimeChange = (bool: boolean) => {
            if (bool) {
                clearInterval(interval)
            } else {
                // 如果系统时间没有手动改变，重新开启定时器
                nextTick(() => {
                    if (!isTimePickerChanged) {
                        clock()
                    }
                })
            }
        }

        const handleBeforeSystemTimeChange = () => {
            return openMessageBox({
                type: 'question',
                message: Translate('IDCS_CHANGE_TIME_WARNING'),
            })
        }

        const checkTimeServer = (str: string) => {
            return /^\w(-?\w+)*(\.\w(-?\w+)*)*$/.test(str)
        }

        const checkGPSBaudRate = (str: string) => {
            return Number(str) >= formData.value.gpsBaudRateMin && Number(str) <= formData.value.gpsBaudRateMax
        }

        watch(isDSTDisabled, (val) => {
            if (val) {
                formData.value.enableDST = false
            } else {
                if (formData.value.timeZone === currentTimezone) {
                    formData.value.enableDST = currentDST
                } else {
                    formData.value.enableDST = true
                }
            }
        })

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            clearInterval(interval)
        })

        return {
            formData,
            formRef,
            formRules,
            pageData,
            formatSystemTime,
            isDSTDisabled,
            setData,
            handleIsSyncChange,
            pendingSystemTimeChange,
            handleSystemTimeChange,
            handleSyncTypeChange,
            handleNtpIntervalOutOfRange,
            handleBeforeSystemTimeChange,
            checkTimeServer,
            checkGPSBaudRate,
        }
    },
})
