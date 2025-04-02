/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:09:06
 * @Description: 日期与时间
 */
import dayjs from 'dayjs'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        let interval: NodeJS.Timeout | number = 0

        const formData = ref(new SystemDateTimeForm())

        // 同步方式与显示文本映射
        const SYNC_TYPE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_MANUAL'),
            NTP: Translate('IDCS_TIME_SERVER_SYNC'),
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
            // 时区选项
            timeZoneOption: DEFAULT_TIME_ZONE.map((item, index) => {
                return {
                    ...item,
                    label: Translate('IDCS_TIME_ZONE_' + (index + 1)),
                }
            }),
            // 系统时间最小值
            serverTimeStart: dayjs('2021-01-01', { jalali: false, format: DEFAULT_DATE_FORMAT }),
            // 系统时间最大值
            serverTimeEnd: dayjs('2037-01-01', { jalali: false, format: DEFAULT_DATE_FORMAT }),
            // 是否可提交
            submitDisabled: true,
            // 系统时间改变标识
            isSystemTimeChanged: false,
            // 从请求获取的系统时间，用于时钟的计算
            systemTime: '',
            // 请求结束的事件，用于时钟的计算
            startTime: 0,
        })

        let isTimePickerChange = false
        let currentTimezone = ''
        let currentDST = false

        // 显示时间格式
        const formatSystemTime = computed(() => {
            return DEFAULT_MOMENT_MAPPING[formData.value.dateFormat] + ' ' + DEFAULT_MOMENT_MAPPING[formData.value.timeFormat]
        })

        /**
         * @description 是否同步选项改变回调
         */
        const handleIsSyncChange = () => {
            if (formData.value.isSync) {
                pageData.value.isSystemTimeChanged = true
                formData.value.systemTime = dayjs().calendar('gregory').format(formatSystemTime.value)
            } else {
                isTimePickerChange = false
            }
            clock()
        }

        /**
         * @description 同步方式改变时回调
         */
        const handleSyncTypeChange = () => {
            isTimePickerChange = false
        }

        /**
         * @description 定时更新时间
         */
        const renderTime = () => {
            // 与Internet时间同步时，使用返回的系统时间计时
            if (formData.value.syncType === 'manually') {
                const now = performance.now()
                formData.value.systemTime = dayjs(pageData.value.systemTime, { jalali: false, format: formatSystemTime.value })
                    .add(now - pageData.value.startTime, 'millisecond')
                    .calendar('gregory')
                    .format(formatSystemTime.value)
            }
            // 计算机时间同步时，使用计算时间计时
            else {
                formData.value.systemTime = dayjs().calendar('gregory').format(formatSystemTime.value)
            }
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

            const result = await queryTimeCfg()
            const $ = queryXml(result)

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

            formData.value.timeZone = $('content/timezoneInfo/timeZone').text()
            formData.value.enableDST = $('content/timezoneInfo/daylightSwitch').text().bool()
            currentTimezone = formData.value.timeZone
            currentDST = formData.value.enableDST

            let currentDate = dayjs($('content/synchronizeInfo/currentTime').text().trim(), { jalali: false, format: formatSystemTime.value })
            if (currentDate.isBefore(pageData.value.serverTimeStart)) {
                currentDate = pageData.value.serverTimeStart
            } else if (currentDate.isAfter(pageData.value.serverTimeEnd)) {
                currentDate = pageData.value.serverTimeEnd
            }

            nextTick(() => {
                formData.value.systemTime = dayjs(currentDate).calendar('gregory').format(formatSystemTime.value)
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
                        ${pageData.value.syncTypeOptions.map((item) => `<enum>${item}</enum>`).join('')}
                    </synchronizeType>
                    <dateFormat>
                        ${pageData.value.dateFormatOptions.map((item) => `<enum>${item}</enum>`).join('')}
                    </dateFormat>
                    <timeFormat>
                        ${pageData.value.timeFormatOptions.map((item) => `<enum>${item}</enum>`).join('')}
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
                        ${pageData.value.isSystemTimeChanged ? `<currentTime>${wrapCDATA(formData.value.systemTime)}</currentTime>` : ''}
                    </synchronizeInfo>
                    <formatInfo>
                        <date type="dateFormat">${formData.value.dateFormat}</date>
                        <time type="timeFormat">${formData.value.timeFormat}</time>
                    </formatInfo>
                </content>
            `
            const result = await editTimeCfg(sendXml)

            closeLoading()

            pageData.value.submitDisabled = false
            pageData.value.isSystemTimeChanged = false
            dateTime.getTimeConfig(true)
            getData()
            commSaveResponseHandler(result)
        }

        // 禁用夏令时勾选
        const isDSTDisabled = computed(() => {
            const findItem = DEFAULT_TIME_ZONE.find((item) => formData.value.timeZone === item.timeZone)
            if (findItem) return !findItem.enableDst
            return true
        })

        /**
         * @description 日历组件选择时间
         */
        const handleSystemTimeChange = () => {
            pageData.value.isSystemTimeChanged = true
            isTimePickerChange = true
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
                    if (!isTimePickerChange) {
                        clock()
                    }
                })
            }
        }

        watch(formatSystemTime, (newFormat, oldFormat) => {
            formData.value.systemTime = dayjs(formData.value.systemTime, oldFormat).format(newFormat)
            pageData.value.systemTime = dayjs(pageData.value.systemTime, oldFormat).format(newFormat)
        })

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
            pageData,
            formatSystemTime,
            isDSTDisabled,
            setData,
            handleIsSyncChange,
            pendingSystemTimeChange,
            handleSystemTimeChange,
            handleSyncTypeChange,
        }
    },
})
