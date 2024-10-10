import { AlarmOut } from '@/types/apiType/aiAndEvent'
import { defineComponent } from 'vue'
import { cloneDeep } from 'lodash-es'
import { editAlarmOutParam } from '@/api/aiAndEvent'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const pageData = ref({
            delayList: [] as SelectOption<number, string>[],
            scheduleList: [] as SelectOption<string, string>[],
            typeList: [] as SelectOption<string, string>[],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            alarmoutTypeText: {
                NC: Translate('IDCS_ALWAYS_CLOSE'),
                NO: Translate('IDCS_ALWAYS_OPEN'),
            } as Record<string, string>,
            localAlarmOutCount: 0,
            applyDisabled: true,
            initComplated: false,
        })

        // 表格数据
        const tableData = ref<AlarmOut[]>([])
        // 缓存表格初始数据，保存时对比变化了的行
        let tableDataInit = [] as AlarmOut[]
        // 当前告警输出的常开/常闭类型
        const curAlarmoutType = ref('')

        onMounted(async () => {
            pageData.value.scheduleList = await buildScheduleList()
            await getAlarmOutType()
            buildTableData()
        })

        watch(
            tableData,
            () => {
                if (pageData.value.initComplated) {
                    pageData.value.applyDisabled = false
                }
            },
            {
                deep: true,
            },
        )

        /**
         * @description: 获取表格数据
         * @return {*}
         */
        const buildTableData = () => {
            pageData.value.initComplated = false
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'alarmOuts',
            }).then(async (result) => {
                const $chl = queryXml(result)
                pageData.value.totalCount = Number($chl('/response/content').attr('total'))
                $chl('/response/content/item').forEach(async (item) => {
                    const row = new AlarmOut()
                    row.id = item.attr('id')!
                    row.name = xmlParse('./name', item.element).text()
                    row.status = 'loading'
                    tableData.value.push(row)
                })

                let completeCount = 0

                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]

                    const sendXml = rawXml`
                    <condition>
                        <alarmOutId>${row.id}</alarmOutId>
                    </condition>
                    `
                    const alarmParam = await queryAlarmOutParam(sendXml)
                    const $ = queryXml(alarmParam)
                    row.status = ''

                    // 从第一个数据中获取延迟时间下拉选项和类型下拉选项
                    if (pageData.value.delayList.length === 0) {
                        pageData.value.delayList = $('/response/content/delayTimeNote')
                            .text()
                            .split(',')
                            .map((delayItem) => {
                                const value = Number(delayItem)
                                return {
                                    value: value,
                                    label: value === 0 ? Translate('IDCS_MANUAL') : getTranslateForSecond(value),
                                }!
                            })
                    }

                    if ($('/response/status').text() === 'success') {
                        // 查询成功的行取消禁用
                        row.disabled = false
                        row.delayTime = Number($('/response/content/delayTime').text())
                        const $schedule = $('/response/content/schedule')
                        row.scheduleId = $schedule.attr('id')
                        row.scheduleName = $schedule.text()
                        row.index = $('/response/content/index').text()
                        row.devDesc = $('/response/content/devDesc').text()
                        // devDescTemp不存在表示设备本地报警输出，本地报警输出才能设置报警类型
                        if (!row.devDesc) {
                            row.type = pageData.value.alarmoutTypeText[curAlarmoutType.value]
                            pageData.value.localAlarmOutCount++
                        } else {
                            row.type = '--'
                        }

                        tableDataInit.push(cloneDeep(row))
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

        /**
         * @description 改变页码，刷新数据
         */
        const changePagination = () => {
            buildTableData()
        }

        /**
         * @description 改变每页显示条数，刷新数据
         */
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            buildTableData()
        }

        /**
         * @description: 获取告警输出常开/常闭类型
         * @return {*}
         */
        const getAlarmOutType = async () => {
            const result = await queryBasicCfg(getXmlWrapData(''))
            const $ = queryXml(result)
            curAlarmoutType.value = $('/response/content/alarmoutType').text()
            pageData.value.typeList = $('/response/types/alarmoutType/enum').map((typeItem) => {
                const value = typeItem.text()
                return {
                    value: value,
                    label: pageData.value.alarmoutTypeText[value],
                }
            })
        }

        /**
         * @description: 改变所有项的值
         * @param {string} value 值
         * @param {string} field 字段名
         * @return {*}
         */
        const changeAllValue = (value: any, field: string) => {
            tableData.value.forEach((item) => {
                ;(item as any)[field] = value
            })
        }

        /**
         * @description: 报警输出类型变化
         * @return {*}
         */
        const changeType = async (value: string) => {
            if (value === curAlarmoutType.value) return
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_ALARMOUT_TYPE_EDIT_AFTER_REBOOT'),
            }).then(async () => {
                openLoading(LoadingTarget.FullScreen)
                const sendXml = rawXml`
                <content>
                    <alarmoutType>${value}</alarmoutType>
                </content>
                `
                const result = await editBasicCfg(sendXml)
                closeLoading(LoadingTarget.FullScreen)
                commSaveResponseHadler(result, () => {
                    curAlarmoutType.value = value
                })
            })
        }

        /**
         * @description: 保存数据
         * @return {*}
         */
        const setData = () => {
            openLoading(LoadingTarget.FullScreen)
            const diffRows = getArrayDiffRows(tableData.value, tableDataInit, ['name', 'delayTime', 'scheduleId'])

            if (diffRows.length > 0) {
                let completeCount = 0
                diffRows.forEach(async (row) => {
                    const rowItem = row as AlarmOut
                    const sendXml = rawXml`
                    <content>
                        <id>${rowItem.id}</id>
                        <name><![CDATA[${rowItem.name}]]></name>
                        <delayTime unit='s'>${rowItem.delayTime.toString()}</delayTime>
                        <schedule id='${rowItem.scheduleId}'></schedule>
                    </content>
                    `
                    const result = await editAlarmOutParam(sendXml)
                    const $ = queryXml(result)
                    const isSuccess = $('/response/status').text() === 'success'
                    rowItem.status = isSuccess ? 'success' : 'error'
                    completeCount++

                    if (completeCount >= diffRows.length) {
                        pageData.value.applyDisabled = false
                        // 更新表格初始对比值
                        tableDataInit = cloneDeep(tableData.value)
                        closeLoading(LoadingTarget.FullScreen)
                    }
                })
            }
        }

        return {
            pageData,
            tableData,
            curAlarmoutType,
            changePagination,
            changePaginationSize,
            changeAllValue,
            changeType,
            setData,
        }
    },
})
