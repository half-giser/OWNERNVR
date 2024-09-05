/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:09:06
 * @Description: 日期与时间
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 14:27:47
 */
import { SystemDateTimeForm } from '@/types/apiType/system'
import dayjs from 'dayjs'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()
        const dateTime = useDateTimeStore()

        let interval: NodeJS.Timeout | number = 0

        // 时区及是否支持夏令时
        const TIME_ZONE = [
            { timeZone: 'GMT+12', enableDst: false },
            { timeZone: 'GMT+11', enableDst: false },
            { timeZone: 'HAST10HADT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'AKST9AKDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'PST8PDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'MST7MDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'CST6CDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'CST6CDT,M4.1.0,M10.5.0', enableDst: true },
            { timeZone: 'CST5CDT,M3.2.0/0,M11.1.0/1', enableDst: true },
            { timeZone: 'EST5EDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'VET4:30', enableDst: false },
            { timeZone: 'CST4CDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'AMT4AMST,M10.3.0/0,M2.3.0/0', enableDst: true },
            { timeZone: 'AST4', enableDst: false },
            { timeZone: 'PYT4PYST,M10.1.0/0,M4.2.0/0', enableDst: true },
            { timeZone: 'CLT4CLST,M10.2.0/0,M3.2.0/0', enableDst: true },
            { timeZone: 'NST3:30NDT,M3.2.0,M11.1.0', enableDst: true },
            { timeZone: 'BRT3BRST,M10.3.0/0,M2.3.0/0', enableDst: true },
            { timeZone: 'ART3', enableDst: false },
            { timeZone: 'WGT3WGST,M3.5.6/22,M10.5.6/23', enableDst: true },
            { timeZone: 'UYT3UYST,M10.1.0,M3.2.0', enableDst: true },
            { timeZone: 'FNT2', enableDst: false },
            { timeZone: 'AZOT1AZOST,M3.5.0/0,M10.5.0/1', enableDst: true },
            { timeZone: 'GMT0BST,M3.5.0/1,M10.5.0', enableDst: true },
            { timeZone: 'CET-1CEST,M3.5.0,M10.5.0/3', enableDst: true },
            { timeZone: 'WAT-1WAST,M9.1.0,M4.1.0', enableDst: true },
            { timeZone: 'EET-2EEST,M3.5.0/3,M10.5.0/4', enableDst: true },
            { timeZone: 'EET-2', enableDst: false },
            { timeZone: 'IST-2IDT,M3.5.5/2,M10.5.0/2', enableDst: true },
            { timeZone: 'SAST-2', enableDst: false },
            { timeZone: 'EET-2EEST,M3.5.0/0,M10.5.0/0', enableDst: true },
            { timeZone: 'EET-2EEST,M3.5.5/0,M10.5.5/0', enableDst: true },
            { timeZone: 'AST-3', enableDst: false },
            { timeZone: 'MSK-3', enableDst: false },
            { timeZone: 'IRST-3:30IRDT-4:30,J80/0,J264/0', enableDst: true },
            { timeZone: 'AZT-4AZST,M3.5.0/4,M10.5.0/5', enableDst: true },
            { timeZone: 'GST-4', enableDst: false },
            { timeZone: 'AFT-4:30', enableDst: false },
            { timeZone: 'PKT-5', enableDst: false },
            { timeZone: 'IST-5:30', enableDst: false },
            { timeZone: 'NPT-5:45', enableDst: false },
            { timeZone: 'ALMT-6', enableDst: false },
            { timeZone: 'MMT-6:30', enableDst: false },
            { timeZone: 'WIT-7', enableDst: false },
            { timeZone: 'CST-8', enableDst: false },
            { timeZone: 'WST-8', enableDst: false },
            { timeZone: 'JST-9', enableDst: false },
            { timeZone: 'CST-9:30', enableDst: false },
            { timeZone: 'CST-9:30CST,M10.1.0,M4.1.0/3', enableDst: true },
            { timeZone: 'YAKT-10', enableDst: false },
            { timeZone: 'EST-10EST,M10.1.0,M4.1.0/3', enableDst: true },
            { timeZone: 'SBT-11', enableDst: false },
            { timeZone: 'NFT-11:30', enableDst: false },
            { timeZone: 'NZST-12NZDT,M9.5.0,M4.1.0/3', enableDst: true },
            { timeZone: 'FJT-12FJST,M10.5.0,M1.3.0/3', enableDst: true },
            { timeZone: 'PETT-12PETST,M3.5.0,M10.5.0/3', enableDst: true },
            { timeZone: 'MHT-12', enableDst: false },
            { timeZone: 'CHAST-12:45CHADT,M9.5.0/2:45,M4.1.0/3:45', enableDst: true },
            { timeZone: 'TOT-13', enableDst: false },
            { timeZone: 'SST-13SDT,M9.5.0/3,M4.1.0/4', enableDst: true },
        ]

        const formData = ref(new SystemDateTimeForm())

        // 同步方式与显示文本映射
        const SYNC_TYPE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_MANUAL'),
            NTP: Translate('IDCS_TIME_SERVER_SYNC'),
        }

        // 日期格式与显示文本映射
        const DATE_FORMAT_MAPPING: Record<string, string> = {
            'year-month-day': Translate('IDCS_DATE_FORMAT_YMD'),
            'month-day-year': Translate('IDCS_DATE_FORMAT_MDY'),
            'day-month-year': Translate('IDCS_DATE_FORMAT_DMY'),
        }

        // 时间格式与显示文本映射
        const TIME_FORMAT_MAPPING: Record<string, string> = {
            '24': Translate('IDCS_TIME_FORMAT_24'),
            '12': Translate('IDCS_TIME_FORMAT_12'),
        }

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
            timeZoneOption: TIME_ZONE,
            // 系统时间最小值
            serverTimeStart: new Date(2010, 0, 1),
            // 系统时间最大值
            serverTimeEnd: new Date(2037, 11, 31),
            // 是否可提交
            submitDisabled: true,
            // 系统时间改变标识
            isSystemTimeChanged: false,
            // 从请求获取的系统时间，用于时钟的计算
            systemTime: '',
            // 请求结束的事件，用于时钟的计算
            startTime: 0,
        })

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
                formData.value.systemTime = dayjs(new Date()).format(formatSystemTime.value)
            } else {
            }
            clock()
        }

        /**
         * @description 定时更新时间
         */
        const renderTime = () => {
            if (formData.value.isSync) {
                formData.value.systemTime = dayjs(new Date()).format(formatSystemTime.value)
            } else {
                const now = performance.now()
                formData.value.systemTime = dayjs(pageData.value.systemTime, formatSystemTime.value)
                    .add(now - pageData.value.startTime, 'millisecond')
                    .format(formatSystemTime.value)
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
            openLoading(LoadingTarget.FullScreen)

            const result = await queryTimeCfg()
            const $ = queryXml(result)

            pageData.value.syncTypeOptions = $('//types/synchronizeType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: SYNC_TYPE_MAPPING[item.text()],
                }
            })

            formData.value.dateFormat = $('//content/formatInfo/date').text()
            pageData.value.dateFormatOptions = $('//types/dateFormat/enum').map((item) => {
                return {
                    value: item.text(),
                    label: DATE_FORMAT_MAPPING[item.text()],
                }
            })

            formData.value.timeFormat = $('//content/formatInfo/time').text()
            pageData.value.timeFormatOptions = $('//types/timeFormat/enum').map((item) => {
                return {
                    value: item.text(),
                    label: TIME_FORMAT_MAPPING[item.text()],
                }
            })

            formData.value.syncType = $('//content/synchronizeInfo/type').text()

            formData.value.timeServer = $('//content/synchronizeInfo/ntpServer').text().trim()
            pageData.value.timeServerOptions = $('//types/ntpServerType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: item.text(),
                }
            })

            formData.value.timeZone = $('//content/timezoneInfo/timeZone').text()
            formData.value.enableDST = $('//content/timezoneInfo/daylightSwitch').text().toBoolean()

            let currentDate = dayjs($('//content/synchronizeInfo/currentTime').text().trim(), formatSystemTime.value).toDate()
            if (currentDate < pageData.value.serverTimeStart) {
                currentDate = pageData.value.serverTimeStart
            } else if (currentDate > pageData.value.serverTimeEnd) {
                currentDate = pageData.value.serverTimeEnd
            }

            nextTick(() => {
                formData.value.systemTime = dayjs(currentDate).format(formatSystemTime.value)
                pageData.value.startTime = performance.now()
                pageData.value.systemTime = formData.value.systemTime
                clock()
            })

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

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
                        <daylightSwitch>${String(formData.value.enableDST)}</daylightSwitch>
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

            closeLoading(LoadingTarget.FullScreen)

            pageData.value.submitDisabled = false
            pageData.value.isSystemTimeChanged = false
            dateTime.getTimeConfig(true)
            getData()
            commSaveResponseHadler(result)
        }

        // 禁用夏令时勾选
        const isDSTDisabled = computed(() => {
            const findItem = TIME_ZONE.find((item) => formData.value.timeZone === item.timeZone)
            if (findItem) return !findItem.enableDst
            return true
        })

        /**
         * @description 日历周末高亮
         * @param {Date} date
         * @returns
         */
        const handleCalendarCellHighLight = (date: Date) => {
            if (userSession.calendarType === 'Persian') {
                return ''
            }
            const day = dayjs(date).day()
            if (day === 0 || day === 6) {
                return 'highlight'
            }
            return ''
        }

        /**
         * @description 时区文本显示
         * @param {number} index
         * @returns {string}
         */
        const displayTimeZone = (index: number) => {
            return Translate('IDCS_TIME_ZONE_' + (index + 1))
        }

        /**
         * @description 日历组件选择时间
         */
        const handleSystemTimeChange = () => {
            pageData.value.isSystemTimeChanged = true
            clearInterval(interval)
        }

        watch(formatSystemTime, (newFormat, oldFormat) => {
            formData.value.systemTime = dayjs(formData.value.systemTime, oldFormat).format(newFormat)
            pageData.value.systemTime = dayjs(pageData.value.systemTime, oldFormat).format(newFormat)
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
            handleCalendarCellHighLight,
            displayTimeZone,
            handleSystemTimeChange,
        }
    },
})
