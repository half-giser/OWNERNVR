/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:57
 * @Description:闪灯
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 10:29:43
 */
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { whiteLightInfo } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const tableData = ref<whiteLightInfo[]>([])
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            scheduleManagePopOpen: false,
            schedule: '',
            scheduleName: '',
            scheduleChanged: false,
            scheduleList: [] as SelectOption<string, string>[],
            enableList: getSwitchOptions(),
            lightFrequencyList: [] as SelectOption<string, string>[],
            applyDisable: true,
            initComplated: false,
            editRows: [] as whiteLightInfo[],
        })
        const buildTableData = () => {
            pageData.value.initComplated = false
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'chls',
                isSupportWhiteLightAlarmOut: true,
            }).then(async (res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach(async (item) => {
                    const row = new whiteLightInfo()
                    row.id = item.attr('id')!
                    row.name = xmlParse('./name', item.element).text()
                    row.status = 'loading'
                    tableData.value.push(row)
                })
                let completeCount = 0
                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    const sendXml = rawXml`<condition>
                                        <chlId>${row.id}</chlId>
                                    </condition>
                                    <requireField>
                                        <param></param>
                                    </requireField>`
                    const whiteLightInfo = await queryWhiteLightAlarmOutCfg(sendXml)
                    const res = queryXml(whiteLightInfo)
                    row.status = ''
                    if (res('status').text() == 'success') {
                        if (pageData.value.lightFrequencyList.length === 0) {
                            res('//types/lightFrequency/enum').forEach((item) => {
                                pageData.value.lightFrequencyList.push({
                                    value: item.text(),
                                    label: getLightFrequencyLang(item.text()),
                                })
                            })
                        }
                        row.enable = res('//content/chl/param/lightSwitch').text()
                        row.durationTime = Number(res('//content/chl/param/durationTime').text())
                        row.frequencyType = res('//content/chl/param/frequencyType').text()
                        setRowDisable(row)
                        row.rowDisable = false
                    } else {
                        row.enableDisable = true
                        row.rowDisable = true
                    }

                    completeCount++
                    if (completeCount >= tableData.value.length) {
                        nextTick(() => {
                            pageData.value.initComplated = true
                        })
                    }
                }
            })
        }

        const getSaveData = (rowData: whiteLightInfo) => {
            if (rowData.durationTime) {
                const sendXml = rawXml`
                    <content>
                        <chl id="${rowData.id}">
                            <param>
                                <name>${rowData.name}</name>
                                <lightSwitch>${rowData.enable}</lightSwitch>
                                <durationTime>${rowData.durationTime.toString()}</durationTime>
                                <frequency>${rowData.frequencyType}</frequency>
                            </param>
                        </chl>
                    </content>`
                return sendXml
            } else {
                console.log('durationTime is null')
            }
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const getSchedule = async () => {
            await getScheduleList()
            queryEventNotifyParam().then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    pageData.value.schedule = res('//content/triggerChannelLightSchedule').attr('id')
                    pageData.value.scheduleName = res('//content/triggerChannelLightSchedule').text()
                }
            })
            pageData.value.scheduleChanged = false
        }

        const setData = () => {
            openLoading()
            pageData.value.editRows.forEach((row) => {
                const sendXml = getSaveData(row)
                if (sendXml) {
                    editWhiteLightAlarmOutCfg(sendXml).then((resb) => {
                        const res = queryXml(resb)
                        const isSuccess = res('status').text() === 'success'
                        row.status = isSuccess ? 'success' : 'error'
                        if (isSuccess) {
                            pageData.value.editRows.splice(pageData.value.editRows.indexOf(row), 1)
                            if (pageData.value.editRows.length === 0) {
                                pageData.value.applyDisable = true
                            }
                        }
                    })
                }
            })
            if (pageData.value.scheduleChanged == true) {
                const scheduleSendXml = rawXml`
                    <content>
                        <triggerChannelLightSchedule id="${pageData.value.schedule}">
                            ${pageData.value.scheduleName}
                        </triggerChannelLightSchedule>
                    </content>
                `
                editEventNotifyParam(scheduleSendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() === 'success') {
                        pageData.value.applyDisable = true
                    }
                    pageData.value.scheduleChanged = false
                })
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

        const handleEnabelChange = (row: whiteLightInfo) => {
            setRowDisable(row)
            addEditRows(row)
            pageData.value.applyDisable = false
        }

        const handleEnabelChangeAll = (value: string) => {
            tableData.value.forEach((row) => {
                if (row.enable) {
                    row.enable = value
                    setRowDisable(row)
                    addEditRows(row)
                    if (!row.rowDisable) pageData.value.applyDisable = false
                }
            })
        }

        const handleDurationTimeChange = (row: whiteLightInfo) => {
            addEditRows(row)
            if (!row.rowDisable) pageData.value.applyDisable = false
        }

        const handleFrequencyTypeChange = (row: whiteLightInfo) => {
            addEditRows(row)
            if (!row.rowDisable) pageData.value.applyDisable = false
        }

        const handleFrequencyTypeChangeAll = (value: string) => {
            tableData.value.forEach((row) => {
                if (!row.rowDisable && !(row.enable && row.enable == 'false')) {
                    row.frequencyType = value
                    addEditRows(row)
                    if (!row.rowDisable) pageData.value.applyDisable = false
                }
            })
        }

        const handleDurationTimeFocus = (row: whiteLightInfo) => {
            if (row.durationTime) {
                if (row.durationTime <= 1) {
                    row.durationTime = 1
                } else if (row.durationTime >= 60) {
                    row.durationTime = 60
                }
            }
        }

        const handleDurationTimeBlur = (row: whiteLightInfo) => {
            if (!row.durationTime) {
                row.durationTime = 1
            }

            if (row.durationTime <= 1) {
                row.durationTime = 1
            } else if (row.durationTime >= 60) {
                row.durationTime = 60
            }
        }

        const handleDurationTimeKeydown = (row: whiteLightInfo) => {
            handleDurationTimeBlur(row)
        }

        const handleScheduleChange = () => {
            pageData.value.applyDisable = false
            pageData.value.scheduleChanged = true
            pageData.value.scheduleName = pageData.value.schedule === DEFAULT_EMPTY_ID ? '' : pageData.value.scheduleList.find((item) => item.value == pageData.value.schedule)!.label
        }

        const addEditRows = (row: whiteLightInfo) => {
            if (!row.rowDisable) {
                if (!pageData.value.editRows.some((item) => item.id == row.id)) {
                    pageData.value.editRows.push(row)
                }
            }
        }

        const setRowDisable = (rowData: whiteLightInfo) => {
            const disabled = rowData.enable == 'false'
            if (rowData.enable == '') {
                rowData.rowDisable = true
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
            changePagination,
            changePaginationSize,
            handleEnabelChange,
            handleEnabelChangeAll,
            handleDurationTimeChange,
            handleFrequencyTypeChange,
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
