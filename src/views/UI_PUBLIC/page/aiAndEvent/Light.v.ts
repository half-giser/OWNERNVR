/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:57
 * @Description: 闪灯
 */
export default defineComponent({
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
            scheduleChanged: false,
            scheduleList: [] as SelectOption<string, string>[],
            enableList: getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS),
            lightFrequencyList: [] as SelectOption<string, string>[],
        })

        const tableData = ref<AlarmWhiteLightDto[]>([])
        const scheduleData = ref<Record<string, string>>({})
        const editRows = useWatchEditRows<AlarmWhiteLightDto>()
        const editSchedule = useWatchEditData(scheduleData)

        const getData = async () => {
            editRows.clear()
            tableData.value = []

            const res = await getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'chls',
                requireField: ['supportManualWhiteLightAlarmOut'],
                isSupportWhiteLightAlarmOut: true,
            })
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
        }

        const getSaveData = (rowData: AlarmWhiteLightDto) => {
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

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const getSchedule = async () => {
            editSchedule.reset()
            const result = await queryEventNotifyParam()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/triggerChannelLightInfos/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    scheduleData.value[item.attr('id')] = $item('schedule').attr('id')
                })
                editSchedule.listen()
            }
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

            await setSchedule()

            closeLoading()
        }

        const setSchedule = async () => {
            if (!editSchedule.disabled.value) {
                const sendXml = rawXml`
                    <content>
                        <triggerChannelLightInfos>
                            ${Object.entries(scheduleData.value)
                                .map((item) => {
                                    return rawXml`
                                    <item id="${item[0]}">
                                        <schedule id="${item[1]}">${pageData.value.scheduleList.find((schedule) => schedule.value === item[1])?.label || Translate('IDCS_NULL')}</schedule>
                                    </item>
                                `
                                })
                                .join('')}
                        </triggerChannelLightInfos>
                    </content>
                `
                await editEventNotifyParam(sendXml)
                editSchedule.update()
            }
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

        const changeAllSchedule = (schedule: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    scheduleData.value[item.id] = schedule
                }
            })
        }

        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()

            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    scheduleData.value[item.id] = getScheduleId(pageData.value.scheduleList, scheduleData.value[item.id])
                }
            })
        }

        onMounted(async () => {
            await getScheduleList()
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
            openSchedulePop,
            changeAllSchedule,
            closeSchedulePop,
            setData,
            scheduleData,
            editSchedule,
        }
    },
})
