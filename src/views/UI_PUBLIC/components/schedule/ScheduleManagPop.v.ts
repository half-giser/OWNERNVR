/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 16:36:16
 * @Description: 排程管理弹窗
 */
import ScheduleEditPop from './ScheduleEditPop.vue'
import { ScheduleInfo, type NameValueItem } from '@/types/apiType/schedule'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    components: {
        ScheduleEditPop,
    },
    emits: {
        close() {
            return true
        },
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        // 周排程组件引用
        const scheduleWeekRef = ref<ScheduleWeekInstance>()
        // 排程表格引用
        const scheduleTable = ref<TableInstance>()

        const pageData = ref({
            //排程编辑弹窗显示状态
            scheduleEditPopOpen: false,
            // 排程列表
            scheduleList: [] as NameValueItem[],
            // 当前选中的排程id
            currentScheduleId: '',
            // 当前选中的排程详情
            currentScheduleInfo: undefined as ScheduleInfo | undefined,
            // 编辑的排程信息
            editScheduleInfo: undefined as ScheduleInfo | undefined,
            // 排程详情中，天的类型枚举
            dayEnum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
            // 默认的排程
            defaultSchedules: ['24x7'],
        })

        const scheduleTitle = computed(() => {
            return pageData.value.currentScheduleInfo ? Translate('IDCS_SCHEDULE_INFORMATION_D').formatForLang(getShortString(pageData.value.currentScheduleInfo.name, 10)) : ''
        })

        /**
         * @description: 排程管理弹框打开事件
         * @return {*}
         */
        const onOpen = async () => {
            queryList()
        }

        /**
         * @description: 查询列表
         * @return {*}
         */
        const queryList = async () => {
            openLoading()

            const result = await queryScheduleList()
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() !== 'success') return

            pageData.value.scheduleList = $('//content/item').map((item) => {
                return {
                    id: item.attr('id')!,
                    name: item.text(),
                }
            })

            if (!pageData.value.scheduleList.length) return

            let selectRow
            if (pageData.value.currentScheduleId) {
                selectRow = pageData.value.scheduleList.find((o) => o.id === pageData.value.currentScheduleId)
            }

            if (!selectRow) {
                selectRow = pageData.value.scheduleList[0]
                pageData.value.currentScheduleId = selectRow.id
            }

            if (pageData.value.scheduleList.length) scheduleTable.value!.setCurrentRow(selectRow)
        }

        /**
         * @description: 切换表格选中行
         * @param {NameValueItem} row
         * @return {*}
         */
        const tableRowChange = async (row: NameValueItem | undefined) => {
            if (!row) return
            pageData.value.currentScheduleId = row.id
            if (await getScheduleDetail(row.id)) {
                scheduleWeekRef.value?.resetValue(pageData.value.currentScheduleInfo!.timespan)
            } else {
                pageData.value.currentScheduleInfo = undefined
                scheduleWeekRef.value?.resetValue([])
            }
        }

        /**
         * @description: 获取排程详情
         * @param {string} id 排程ID
         * @return {*}
         */
        const getScheduleDetail = async (id: string) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <id>${id}</id>
                </condition>
            `

            const result = await querySchedule(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.currentScheduleInfo = new ScheduleInfo()
                pageData.value.currentScheduleInfo.id = $('//content/id').text()
                pageData.value.currentScheduleInfo.name = $('//content/name').text()

                pageData.value.dayEnum.forEach((day, index) => {
                    pageData.value.currentScheduleInfo!.timespan[index] = $('//content/period/item')
                        .filter((item) => {
                            return xmlParse('./day', item.element).text() === day
                        })
                        .map((item) => {
                            return [xmlParse('./start', item.element).text(), xmlParse('./end', item.element).text()]
                        })
                })
                return true
            } else {
                return false
            }
        }

        /**
         * @description: 添加或修改排程
         * @param {NameValueItem} row
         * @return {*}
         */
        const openScheduleEditPop = async (row?: NameValueItem) => {
            if (row) {
                if (await getScheduleDetail(row.id)) {
                    pageData.value.editScheduleInfo = pageData.value.currentScheduleInfo
                }
            } else {
                pageData.value.editScheduleInfo = undefined
            }
            pageData.value.scheduleEditPopOpen = true
        }

        /**
         * @description: 删除排程
         * @param {NameValueItem} row
         * @return {*}
         */
        const deleteSchedule = async (row: NameValueItem) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_SCHEDULE_S').formatForLang(replaceWithEntity(getShortString(row.name, 10))),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <scheduleIds type="list">
                            <item id="${row.id}">${row.name}</item>
                        </scheduleIds>
                    </condition>
                `

                const result = await delSchedule(sendXml)
                closeLoading()

                commSaveResponseHadler(result, () => {
                    queryList()
                })
            })
        }

        /**
         * @description: 关闭编辑排程弹窗
         * @return {*}
         */
        const editPopClose = (isRefresh: boolean) => {
            pageData.value.scheduleEditPopOpen = false
            if (isRefresh) {
                queryList()
            }
        }

        return {
            scheduleWeekRef,
            scheduleTable,
            scheduleTitle,
            pageData,
            onOpen,
            tableRowChange,
            deleteSchedule,
            openScheduleEditPop,
            editPopClose,
            ScheduleEditPop,
        }
    },
})
