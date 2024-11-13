/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 11:05:51
 * @Description: 报警输出
 */
import { AlarmOutDto } from '@/types/apiType/aiAndEvent'
import { cloneDeep } from 'lodash-es'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

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
            //排程管理弹窗
            scheduleManagePopOpen: false,
            applyDisabled: true,
            initComplated: false,
        })

        // 表格数据
        const tableData = ref<AlarmOutDto[]>([])
        // 缓存表格初始数据，保存时对比变化了的行
        let tableDataInit = [] as AlarmOutDto[]
        // 名称被修改时保存原始名称
        const originalName = ref('')
        // 当前告警输出的常开/常闭类型
        const curAlarmoutType = ref('')

        onMounted(async () => {
            pageData.value.scheduleList = await buildScheduleList({
                isManager: true,
                defaultValue: '',
            })
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
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach(async (item) => {
                    const row = new AlarmOutDto()
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
                        pageData.value.delayList = $('//content/delayTimeNote')
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

                    if ($('//status').text() === 'success') {
                        // 查询成功的行取消禁用
                        row.disabled = false
                        row.delayTime = Number($('//content/delayTime').text())
                        const $schedule = $('//content/schedule')
                        row.scheduleId = $schedule.attr('id')
                        row.scheduleName = $schedule.text()
                        row.oldSchedule = $schedule.attr('id')
                        row.index = $('//content/index').text()
                        row.devDesc = $('//content/devDesc').text()
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

        const changeScheduleAll = (value: string) => {
            if (value == 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
            } else {
                tableData.value.forEach((item) => {
                    item.scheduleId = value
                    item.oldSchedule = value
                })
            }
        }

        const changeSchedule = (row: AlarmOutDto) => {
            if (row.scheduleId == 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
                row.scheduleId = row.oldSchedule
            } else {
                row.oldSchedule = row.scheduleId
            }
        }

        /**
         * @description: 获取告警输出常开/常闭类型
         * @return {*}
         */
        const getAlarmOutType = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            curAlarmoutType.value = $('//content/alarmoutType').text()
            pageData.value.typeList = $('//types/alarmoutType/enum').map((typeItem) => {
                const value = typeItem.text()
                return {
                    value: value,
                    label: pageData.value.alarmoutTypeText[value],
                }
            })
        }

        /**
         * @description 名称被修改时校验是否合法
         */
        const nameFocus = (name: string) => {
            originalName.value = name
        }

        // 失去焦点时检查名称是否合法
        const nameBlur = (row: AlarmOutDto) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                })
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_NAME_EMPTY'),
                    })
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id != row.id && name == item.name) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_NAME_SAME'),
                        })
                        row.name = originalName.value
                        break
                    }
                }
            }
        }

        // 回车键失去焦点
        const enterBlur = (event: { target: { blur: () => void } }) => {
            event.target.blur()
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
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_ALARMOUT_TYPE_EDIT_AFTER_REBOOT'),
            }).then(async () => {
                openLoading()
                setData()
                const sendXml = rawXml`
                    <content>
                        <alarmoutType>${value}</alarmoutType>
                    </content>
                `
                const result = await editBasicCfg(sendXml)
                closeLoading()
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
            const diffRows = getArrayDiffRows(tableData.value, tableDataInit, ['name', 'delayTime', 'scheduleId'])

            if (diffRows.length) {
                let completeCount = 0
                openLoading()
                diffRows.forEach(async (row) => {
                    const rowItem = row as AlarmOutDto
                    const sendXml = rawXml`
                        <content>
                            <id>${rowItem.id}</id>
                            <name><![CDATA[${rowItem.name}]]></name>
                            <delayTime unit='s'>${rowItem.delayTime}</delayTime>
                            <schedule id='${rowItem.scheduleId}'></schedule>
                        </content>
                    `
                    const result = await editAlarmOutParam(sendXml)
                    const $ = queryXml(result)
                    const isSuccess = $('//status').text() === 'success'
                    rowItem.status = isSuccess ? 'success' : 'error'
                    completeCount++

                    if (completeCount >= diffRows.length) {
                        // 更新表格初始对比值
                        tableDataInit = cloneDeep(tableData.value)
                        closeLoading()
                        nextTick(() => {
                            pageData.value.applyDisabled = true
                        })
                    }
                })
            } else {
                // 比对后无变化
                pageData.value.applyDisabled = true
            }
        }

        const displaySerialNum = (row: AlarmOutDto) => {
            return `${row.devDesc ? row.devDesc : Translate('IDCS_LOCAL')}-${row.index}`
        }

        return {
            ScheduleManagPop,
            pageData,
            tableData,
            curAlarmoutType,
            changePagination,
            changePaginationSize,
            changeAllValue,
            nameFocus,
            nameBlur,
            enterBlur,
            // 排程
            changeScheduleAll,
            changeSchedule,
            changeType,
            setData,
            displaySerialNum,
        }
    },
})
