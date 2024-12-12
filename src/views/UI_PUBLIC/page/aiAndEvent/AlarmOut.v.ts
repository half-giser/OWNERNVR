/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 11:05:51
 * @Description: 报警输出
 */
import { AlarmOutDto } from '@/types/apiType/aiAndEvent'
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
            isSchedulePop: false,
        })

        // 表格数据
        const tableData = ref<AlarmOutDto[]>([])
        // 编辑行
        const editRows = useWatchEditRows<AlarmOutDto>()

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
            getData()
        })

        /**
         * @description: 获取表格数据
         * @return {*}
         */
        const getData = () => {
            editRows.clear()
            tableData.value = []

            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'alarmOuts',
            }).then((result) => {
                const $chl = queryXml(result)
                pageData.value.totalCount = $chl('content').attr('total').num()
                tableData.value = $chl('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const row = new AlarmOutDto()
                    row.id = item.attr('id')
                    row.name = $item('name').text()
                    row.status = 'loading'
                    return row
                })

                tableData.value.forEach(async (row) => {
                    const sendXml = rawXml`
                        <condition>
                            <alarmOutId>${row.id}</alarmOutId>
                        </condition>
                    `
                    const alarmParam = await queryAlarmOutParam(sendXml)
                    const $ = queryXml(alarmParam)

                    if (!tableData.value.some((item) => item === row)) {
                        return
                    }

                    row.status = ''

                    // 从第一个数据中获取延迟时间下拉选项和类型下拉选项
                    if (!pageData.value.delayList.length) {
                        pageData.value.delayList = $('content/delayTimeNote')
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

                    if ($('status').text() === 'success') {
                        row.disabled = false
                        row.delayTime = $('content/delayTime').text().num()
                        const $schedule = $('content/schedule')
                        row.scheduleId = $schedule.attr('id')
                        row.scheduleName = $schedule.text()
                        row.oldSchedule = $schedule.attr('id')
                        row.index = $('content/index').text()
                        row.devDesc = $('content/devDesc').text()
                        // devDescTemp不存在表示设备本地报警输出，本地报警输出才能设置报警类型
                        if (!row.devDesc) {
                            row.type = pageData.value.alarmoutTypeText[curAlarmoutType.value]
                            pageData.value.localAlarmOutCount++
                        } else {
                            row.type = '--'
                        }

                        editRows.listen(row)
                    }
                })
            })
        }

        /**
         * @description 改变页码，刷新数据
         */
        const changePagination = () => {
            getData()
        }

        /**
         * @description 改变每页显示条数，刷新数据
         */
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        const changeScheduleAll = (value: string) => {
            if (value === 'scheduleMgr') {
                pageData.value.isSchedulePop = true
            } else {
                tableData.value.forEach((item) => {
                    item.scheduleId = value
                    item.oldSchedule = value
                })
            }
        }

        const changeSchedule = (row: AlarmOutDto) => {
            if (row.scheduleId === 'scheduleMgr') {
                pageData.value.isSchedulePop = true
                nextTick(() => {
                    row.scheduleId = row.oldSchedule
                })
            } else {
                nextTick(() => {
                    row.oldSchedule = row.scheduleId
                })
            }
        }

        /**
         * @description: 获取告警输出常开/常闭类型
         * @return {*}
         */
        const getAlarmOutType = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            curAlarmoutType.value = $('content/alarmoutType').text()
            pageData.value.typeList = $('types/alarmoutType/enum').map((typeItem) => {
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
        const focusName = (name: string) => {
            originalName.value = name
        }

        // 失去焦点时检查名称是否合法
        const blurName = (row: AlarmOutDto) => {
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
                    if (item.id !== row.id && name === item.name) {
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
        const blurInput = (event: Event) => {
            ;(event.target as HTMLInputElement).blur()
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
                commSaveResponseHandler(result, () => {
                    curAlarmoutType.value = value
                })
            })
        }

        /**
         * @description: 保存数据
         * @return {*}
         */
        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const rowItem of editRows.toArray()) {
                const sendXml = rawXml`
                    <content>
                        <id>${rowItem.id}</id>
                        <name><![CDATA[${rowItem.name}]]></name>
                        <delayTime unit='s'>${rowItem.delayTime}</delayTime>
                        <schedule id='${rowItem.scheduleId}'></schedule>
                    </content>
                `
                try {
                    const result = await editAlarmOutParam(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        rowItem.status = 'success'
                        editRows.remove(rowItem)
                    } else {
                        rowItem.status = 'error'
                    }
                } catch {
                    rowItem.status = 'error'
                }
            }

            closeLoading()
        }

        const displaySerialNum = (row: AlarmOutDto) => {
            if (row.disabled) {
                return ''
            }
            return `${row.devDesc ? row.devDesc : Translate('IDCS_LOCAL')}-${row.index}`
        }

        const displayAlarmOutType = (row: AlarmOutDto) => {
            return row.disabled ? '' : row.devDesc ? '--' : pageData.value.alarmoutTypeText[curAlarmoutType.value]
        }

        return {
            pageData,
            tableData,
            editRows,
            curAlarmoutType,
            changePagination,
            changePaginationSize,
            changeAllValue,
            focusName,
            blurName,
            blurInput,
            // 排程
            changeScheduleAll,
            changeSchedule,
            changeType,
            setData,
            displaySerialNum,
            displayAlarmOutType,
        }
    },
})
