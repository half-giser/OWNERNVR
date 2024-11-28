/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:57
 * @Description: 闪灯
 */
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { AlarmWhiteLightDto } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            scheduleManagePopOpen: false,
            schedule: '',
            scheduleName: '',
            scheduleChanged: false,
            scheduleList: [] as SelectOption<string, string>[],
            enableList: getSwitchOptions(),
            lightFrequencyList: [] as SelectOption<string, string>[],
        })

        const tableData = ref<AlarmWhiteLightDto[]>([])
        // 编辑行
        const editRows = useWatchEditRows<AlarmWhiteLightDto>()

        const buildTableData = () => {
            editRows.clear()
            tableData.value = []

            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'chls',
                isSupportWhiteLightAlarmOut: true,
            }).then((res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = $chl('content').attr('total').num()
                tableData.value = $chl('content/item').map((item) => {
                    const row = new AlarmWhiteLightDto()
                    row.id = item.attr('id')
                    row.name = queryXml(item.element)('name').text()
                    row.status = 'loading'
                    return row
                })
                tableData.value.forEach(async (row) => {
                    const sendXml = rawXml`
                        <condition>
                            <chlId>${row.id}</chlId>
                        </condition>
                        <requireField>
                            <param></param>
                        </requireField>
                    `
                    const result = await queryWhiteLightAlarmOutCfg(sendXml)
                    const $ = queryXml(result)

                    if (!tableData.value.some((item) => item === row)) {
                        return
                    }

                    row.status = ''
                    if ($('status').text() === 'success') {
                        if (!pageData.value.lightFrequencyList.length) {
                            pageData.value.lightFrequencyList = $('types/lightFrequency/enum').map((item) => {
                                return {
                                    value: item.text(),
                                    label: getLightFrequencyLang(item.text()),
                                }
                            })
                        }
                        row.enable = $('content/chl/param/lightSwitch').text()
                        row.durationTime = $('content/chl/param/durationTime').text().num()
                        row.frequencyType = $('content/chl/param/frequencyType').text()
                        setRowDisable(row)
                        row.disabled = false
                        editRows.listen(row)
                    } else {
                        row.enableDisable = true
                        row.disabled = true
                    }
                })
            })
        }

        const getSaveData = (rowData: AlarmWhiteLightDto) => {
            if (rowData.durationTime) {
                const sendXml = rawXml`
                    <content>
                        <chl id="${rowData.id}">
                            <param>
                                <name>${rowData.name}</name>
                                <lightSwitch>${rowData.enable}</lightSwitch>
                                <durationTime>${rowData.durationTime}</durationTime>
                                <frequency>${rowData.frequencyType}</frequency>
                            </param>
                        </chl>
                    </content>`
                return sendXml
            }
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const getSchedule = async () => {
            await getScheduleList()
            queryEventNotifyParam().then((result) => {
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    pageData.value.schedule = $('content/triggerChannelLightSchedule').attr('id')
                    pageData.value.scheduleName = $('content/triggerChannelLightSchedule').text()
                }
            })
            pageData.value.scheduleChanged = false
        }

        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const row of editRows.toArray()) {
                const sendXml = getSaveData(row)
                if (sendXml) {
                    try {
                        const result = await editWhiteLightAlarmOutCfg(sendXml)
                        const $ = queryXml(result)
                        if ($('status').text() === 'success') {
                            row.status = 'success'
                            editRows.remove(row)
                        } else {
                            row.status = 'error'
                        }
                    } catch {
                        row.status = 'error'
                    }
                }
            }

            if (pageData.value.scheduleChanged) {
                const scheduleSendXml = rawXml`
                    <content>
                        <triggerChannelLightSchedule id="${pageData.value.schedule}">
                            ${pageData.value.scheduleName}
                        </triggerChannelLightSchedule>
                    </content>
                `
                try {
                    await editEventNotifyParam(scheduleSendXml)
                } catch {}
                pageData.value.scheduleChanged = false
            }

            closeLoading()
        }

        const changePagination = () => {
            buildTableData()
        }

        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            buildTableData()
        }

        const getLightFrequencyLang = (value: string) => {
            switch (value) {
                case 'high':
                    return Translate('IDCS_HWDR_HIGH')
                case 'medium':
                    return Translate('IDCS_HWDR_MEDIUM')
                case 'low':
                    return Translate('IDCS_HWDR_LOW')
                default:
                    return value
            }
        }

        const handleEnabelChange = (row: AlarmWhiteLightDto) => {
            setRowDisable(row)
        }

        const handleEnabelChangeAll = (value: string) => {
            tableData.value.forEach((row) => {
                if (row.enable) {
                    row.enable = value
                    setRowDisable(row)
                }
            })
        }

        const handleFrequencyTypeChangeAll = (value: string) => {
            tableData.value.forEach((row) => {
                if (!row.disabled && !(row.enable && row.enable === 'false')) {
                    row.frequencyType = value
                }
            })
        }

        const handleDurationTimeFocus = (row: AlarmWhiteLightDto) => {
            if (row.durationTime) {
                if (row.durationTime <= 1) {
                    row.durationTime = 1
                } else if (row.durationTime >= 60) {
                    row.durationTime = 60
                }
            }
        }

        const handleDurationTimeBlur = (row: AlarmWhiteLightDto) => {
            if (!row.durationTime) {
                row.durationTime = 1
            }

            if (row.durationTime <= 1) {
                row.durationTime = 1
            } else if (row.durationTime >= 60) {
                row.durationTime = 60
            }
        }

        const handleDurationTimeKeydown = (row: AlarmWhiteLightDto) => {
            handleDurationTimeBlur(row)
        }

        const handleScheduleChange = () => {
            pageData.value.scheduleChanged = true
            pageData.value.scheduleName = pageData.value.schedule === DEFAULT_EMPTY_ID ? '' : pageData.value.scheduleList.find((item) => item.value === pageData.value.schedule)!.label
        }

        const setRowDisable = (rowData: AlarmWhiteLightDto) => {
            const disabled = rowData.enable === 'false'
            if (rowData.enable === '') {
                rowData.disabled = true
                rowData.enableDisable = true
                rowData.durationTimeDisable = true
                rowData.frequencyTypeDisable = true
            } else {
                rowData.enableDisable = false
            }

            if (disabled) {
                rowData.durationTimeDisable = true
                rowData.frequencyTypeDisable = true
            } else {
                rowData.durationTimeDisable = false
                rowData.frequencyTypeDisable = false
            }
        }

        const popOpen = () => {
            pageData.value.scheduleManagePopOpen = true
        }

        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }

        onMounted(async () => {
            await getSchedule()
            buildTableData()
        })

        return {
            pageData,
            tableData,
            editRows,
            changePagination,
            changePaginationSize,
            handleEnabelChange,
            handleEnabelChangeAll,
            handleFrequencyTypeChangeAll,
            handleDurationTimeFocus,
            handleDurationTimeBlur,
            handleDurationTimeKeydown,
            handleScheduleChange,
            popOpen,
            setData,
            ScheduleManagPop,
            handleSchedulePopClose,
        }
    },
})
