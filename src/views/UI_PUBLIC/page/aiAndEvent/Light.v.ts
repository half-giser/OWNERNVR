/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-13 15:58:57
 * @Description:闪灯
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-09 16:35:31
 */
import { ArrowDown } from '@element-plus/icons-vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { whiteLightInfo } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    components: {
        ArrowDown,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const scheduleList = buildScheduleList()
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
            enableList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            lightFrequencyList: [] as SelectOption<string, string>[],
            applyDisable: true,
            initComplated: false,
            editRows: [] as whiteLightInfo[],
        })
        const buildTableData = function () {
            pageData.value.initComplated = false
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'chls',
                isSupportWhiteLightAlarmOut: true,
            }).then(async (res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = Number($chl('/response/content').attr('total'))
                $chl('/response/content/item').forEach(async (item) => {
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
                            res('//types/lightFrequency/enum').forEach((item: any) => {
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
        const getSaveData = function (rowData: whiteLightInfo) {
            if (rowData.durationTime) {
                const sendXml = rawXml`<content>
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
        const getSchedule = async function () {
            queryEventNotifyParam().then((resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    pageData.value.schedule = res('//content/triggerChannelLightSchedule').attr('id')
                    if (pageData.value.schedule == '{00000000-0000-0000-0000-000000000000}') {
                        pageData.value.schedule = ''
                    }
                    pageData.value.scheduleName = res('//content/triggerChannelLightSchedule').text()
                }
            })
            pageData.value.scheduleChanged = false
        }
        const setData = function () {
            openLoading(LoadingTarget.FullScreen)
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
                let scheduleSendXml = ''
                // 后续可能要改
                if (pageData.value.schedule == '') {
                    scheduleSendXml = rawXml`<content>
                                                <triggerChannelLightSchedule id="{00000000-0000-0000-0000-000000000000}">
                                                </triggerChannelLightSchedule>
                                            </content>`
                } else {
                    scheduleSendXml = rawXml`<content>
                                                <triggerChannelLightSchedule id="${pageData.value.schedule}">
                                                    ${pageData.value.scheduleName}
                                                </triggerChannelLightSchedule>
                                            </content>`
                }
                editEventNotifyParam(scheduleSendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() === 'success') {
                        pageData.value.applyDisable = true
                    }
                    pageData.value.scheduleChanged = false
                })
            }
            closeLoading(LoadingTarget.FullScreen)
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
        const getLightFrequencyLang = function (value: string) {
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
        const handleEnabelChange = function (row: whiteLightInfo) {
            setRowDisable(row)
            addEditRows(row)
            pageData.value.applyDisable = false
        }
        const handleEnabelChangeAll = function (value: string) {
            tableData.value.forEach((row) => {
                if (row['enable']) {
                    row.enable = value
                    setRowDisable(row)
                    addEditRows(row)
                    if (!row.rowDisable) pageData.value.applyDisable = false
                }
            })
        }
        const handleDurationTimeChange = function (row: whiteLightInfo) {
            addEditRows(row)
            if (!row.rowDisable) pageData.value.applyDisable = false
        }
        const handleFrequencyTypeChange = function (row: whiteLightInfo) {
            addEditRows(row)
            if (!row.rowDisable) pageData.value.applyDisable = false
        }
        const handleFrequencyTypeChangeAll = function (value: string) {
            tableData.value.forEach((row) => {
                if (!row['rowDisable'] && !(row['enable'] && row['enable'] == 'false')) {
                    row.frequencyType = value
                    addEditRows(row)
                    if (!row.rowDisable) pageData.value.applyDisable = false
                }
            })
        }
        const handleDurationTimeFocus = function (row: whiteLightInfo) {
            if (row.durationTime) {
                if (row.durationTime <= 1) {
                    row.durationTime = 1
                } else if (row.durationTime >= 60) {
                    row.durationTime = 60
                }
            }
        }
        const handleDurationTimeBlur = function (row: whiteLightInfo) {
            if (!row.durationTime) {
                row.durationTime = 1
            }
            if (row.durationTime <= 1) {
                row.durationTime = 1
            } else if (row.durationTime >= 60) {
                row.durationTime = 60
            }
        }
        const handleDurationTimeKeydown = function (row: whiteLightInfo) {
            handleDurationTimeBlur(row)
        }
        const handleScheduleChange = function () {
            pageData.value.applyDisable = false
            pageData.value.scheduleChanged = true
        }
        const addEditRows = function (row: whiteLightInfo) {
            if (!row.rowDisable) {
                if (!pageData.value.editRows.some((item) => item.id == row.id)) {
                    pageData.value.editRows.push(row)
                }
            }
        }
        const setRowDisable = function (rowData: whiteLightInfo) {
            const disabled = rowData['enable'] && rowData['enable'] == 'false' ? true : false
            if (rowData['enable'] == null) {
                rowData['rowDisable'] = true
                rowData['durationTimeDisable'] = true
                rowData['frequencyTypeDisable'] = true
            }
            if (rowData['enable']) {
                rowData['enableDisable'] = false
            }
            if (disabled) {
                rowData['rowDisable'] = false
                rowData['durationTimeDisable'] = true
                rowData['frequencyTypeDisable'] = true
            } else {
                rowData['rowDisable'] = false
                rowData['durationTimeDisable'] = false
                rowData['frequencyTypeDisable'] = false
            }
        }
        const popOpen = function () {
            pageData.value.scheduleManagePopOpen = true
        }
        onMounted(async () => {
            pageData.value.scheduleList = await buildScheduleList()
            await getSchedule()
            buildTableData()
        })
        return {
            Translate,
            LoadingTarget,
            openLoading,
            closeLoading,
            openMessageTipBox,
            scheduleList,
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
        }
    },
})
