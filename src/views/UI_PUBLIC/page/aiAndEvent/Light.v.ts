/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:57
 * @Description: 闪灯
 */
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const LIGHT_FREQUENCY_MAPPING: Record<string, string> = {
            high: Translate('IDCS_HWDR_HIGH'),
            medium: Translate('IDCS_HWDR_MEDIUM'),
            low: Translate('IDCS_HWDR_LOW'),
        }

        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            isSchedulePop: false,
            schedule: '',
            scheduleName: '',
            scheduleChanged: false,
            scheduleList: [] as SelectOption<string, string>[],
            enableList: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
            lightFrequencyList: [] as SelectOption<string, string>[],
        })

        const tableData = ref<AlarmWhiteLightDto[]>([])
        // 编辑行
        const editRows = useWatchEditRows<AlarmWhiteLightDto>()

        const getData = () => {
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
                                    label: LIGHT_FREQUENCY_MAPPING[item.text()],
                                }
                            })
                        }
                        row.enable = $('content/chl/param/lightSwitch').text().bool()
                        row.durationTime = $('content/chl/param/durationTime').text().num()
                        row.frequencyType = $('content/chl/param/frequencyType').text()
                        row.disabled = false
                        editRows.listen(row)
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
            getData()
        }

        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        const changeAllEnable = (value: boolean) => {
            tableData.value.forEach((row) => {
                if (row.enable) {
                    row.enable = value
                }
            })
        }

        const changeAllFrequencyType = (value: string) => {
            tableData.value.forEach((row) => {
                if (!row.disabled && row.enable) {
                    row.frequencyType = value
                }
            })
        }

        const changeSchedule = () => {
            pageData.value.scheduleChanged = true
            pageData.value.scheduleName = pageData.value.schedule === DEFAULT_EMPTY_ID ? '' : pageData.value.scheduleList.find((item) => item.value === pageData.value.schedule)!.label
        }

        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            pageData.value.schedule = getScheduleId(pageData.value.scheduleList, pageData.value.schedule)
            changeSchedule()
        }

        onMounted(async () => {
            await getSchedule()
            getData()
        })

        return {
            pageData,
            tableData,
            editRows,
            changePagination,
            changePaginationSize,
            changeAllEnable,
            changeAllFrequencyType,
            changeSchedule,
            openSchedulePop,
            closeSchedulePop,
            setData,
        }
    },
})
