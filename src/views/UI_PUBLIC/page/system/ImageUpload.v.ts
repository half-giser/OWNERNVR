/*
 * @Description: 系统——上海地标平台——定时图像上传
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-23 11:43:19
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-24 14:16:21
 */
import dayjs from 'dayjs'
import { type ImageUploadDto } from '@/types/apiType/system'
import { type TableInstance } from 'element-plus'
import AddUploadTimePop from './AddUploadTimePop.vue'

export default defineComponent({
    components: {
        AddUploadTimePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        const tableRef = ref<TableInstance>()
        const timeMode = ref(24)
        const tableData = ref<ImageUploadDto[]>([])

        const pageData = ref({
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 当前行
            currentRow: {} as ImageUploadDto,
            // 添加项时间
            addTimeData: '00:00:00',
            // 添加单个时间项弹窗开关
            addSignTimeDialogOpen: false,
            // 添加时间项弹窗
            addUploadTimePopOpen: false,
        })
        /**
         * 处理右上侧添加事件
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<ChannelToolBarEvent>) => {
            if (event.type === 'add') {
                pageData.value.addUploadTimePopOpen = true
                return
            }
        }
        /**
         * @description 表格项展开回调
         * @param {ImageUploadDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: ImageUploadDto, expanded: boolean) => {
            tableRef.value?.setCurrentRow(row)
            if (expanded) {
                if (!pageData.value.expandRowKey.includes(row.chlId)) {
                    pageData.value.expandRowKey.push(row.chlId)
                }
            } else {
                const index = pageData.value.expandRowKey.indexOf(row.chlId)
                if (index > -1) {
                    pageData.value.expandRowKey.splice(index, 1)
                }
            }
        }
        // 行标识
        const getRowKey = (row: ImageUploadDto) => {
            return row.chlId
        }
        // 24小时制转12小时制
        const _24turn12 = (value: string) => {
            const time = new Date('2024/1/1 ' + value)
            return dayjs(time).format('hh:mm:ss A')
        }
        // 获取时间格式
        const getTimeCfg = () => {
            queryTimeCfg().then((res) => {
                timeMode.value = Number(queryXml(res)('content/formatInfo/time').text())
            })
        }
        // 获取数据
        const getData = async () => {
            openLoading()
            const result = await querySHDBNormalUploadCfg()
            closeLoading()
            tableData.value = []
            commLoadResponseHandler(result, async ($) => {
                $('/response/content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const chlId = $item('chl').attr('id')
                    const timelist = $item('timeList/item').map((ele) => {
                        return {
                            value: ele.text(),
                            label: timeMode.value === 12 ? _24turn12(ele.text()) : ele.text(),
                        }
                    })
                    tableData.value.push({
                        chlId,
                        chlNum: parseInt(chlId.substring(1, chlId.indexOf('-')), 16),
                        name: $item('chl').text(),
                        timeCount: Number($item('timeList').attr('total')),
                        timelist,
                    })
                })
            })
            orderChl()
            orderTimeList()
        }
        // 排序通道
        const orderChl = () => {
            tableData.value.sort((a, b) => {
                return a.chlNum - b.chlNum
            })
        }
        // 排序时间项
        const orderTimeList = (row?: ImageUploadDto) => {
            if (!row) {
                tableData.value.forEach((item) => {
                    orderTimeList(item)
                })
                return
            }
            row.timelist.sort((a, b) => {
                const timeA = new Date('2017/1/11 ' + a.value).getTime()
                const timeB = new Date('2017/1/11 ' + b.value).getTime()
                return timeA - timeB
            })
        }
        // 清空当前通道所有时间项
        const clearChannelAllTime = (row: ImageUploadDto) => {
            const shortName = row.name.length > 10 ? row.name.slice(0, 10) + '...' : row.name
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_SCHEDULE_CLEAR').formatForLang(shortName),
            }).then(() => {
                row.timeCount = 0
                row.timelist = []
            })
        }
        // 删除时间项
        const deleteTimeItem = (row: ImageUploadDto, index: number) => {
            row.timelist.splice(index, 1)
            row.timeCount = row.timelist.length
        }
        // 打开添加时间项弹窗
        const openAddTimeDialog = (row: ImageUploadDto) => {
            pageData.value.currentRow = row
            pageData.value.addSignTimeDialogOpen = true
        }
        // 添加时间项
        const addTimeItem = () => {
            const timeList = pageData.value.currentRow.timelist
            const time = pageData.value.addTimeData
            if (!checkTime(timeList, time)) {
                return false
            }
            timeList.push({
                value: time,
                label: timeMode.value === 12 ? _24turn12(time) : time,
            })
            orderTimeList(pageData.value.currentRow)
            pageData.value.currentRow.timeCount = timeList.length
            pageData.value.addTimeData = '00:00:00'
            pageData.value.addSignTimeDialogOpen = false
        }
        // 校验添加时间是否合格
        const checkTime = (timeList: SelectOption<string, string>[], time: string) => {
            if (timeList.length >= 20) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SCHEDULE_TIME_NUMBER'),
                })
                return false
            }
            for (let i = 0; i < timeList.length; i++) {
                const distime = (new Date('2017/1/11 ' + timeList[i].value).getTime() - new Date('2017/1/11 ' + time).getTime()) / 1000
                if (Math.abs(distime) < 5 * 60) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SCHEDULE_TIME_INTER'),
                    })
                    return false
                }
            }

            return true
        }
        // 添加时间项弹窗确认
        const addUploadTime = (data: ImageUploadDto[], addTime: string) => {
            if (data.length === 0) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'),
                })
                return false
            } else {
                for (const item of data) {
                    if (!checkTime(item.timelist, addTime)) {
                        return false
                    }
                }
                data.forEach((item) => {
                    item.timelist.push({
                        value: addTime,
                        label: timeMode.value === 12 ? _24turn12(addTime) : addTime,
                    })
                    orderTimeList(item)
                    item.timeCount = item.timelist.length
                })
            }
            pageData.value.addUploadTimePopOpen = false
        }
        const getSaveData = () => {
            let sendXml = rawXml`<content type='list'>
            <itemType><timeList type='list' /></itemType>`
            tableData.value.forEach((item) => {
                sendXml += rawXml`<item><chl id='${item.chlId}'>${item.name}</chl>
                            <timeList total='${String(item.timeCount)}'>`
                item.timelist.forEach((time) => {
                    sendXml += rawXml`<item>${time.value}</item>`
                })
                sendXml += rawXml`</timeList></item>`
            })
            sendXml += `</content>`
            return sendXml
        }
        // 提交数据
        const setData = async () => {
            const sendXml = getSaveData()
            openLoading()
            const result = await editSHDBNormalUploadCfg(sendXml)
            closeLoading()
            commSaveResponseHadler(result)
        }
        // 挂载完成获取数据
        onMounted(async () => {
            getTimeCfg()
            await getData()
        })
        return {
            AddUploadTimePop,
            // 工具栏事件
            handleToolBarEvent,
            pageData,
            tableRef,
            tableData,
            getRowKey,
            // 展开行
            handleExpandChange,
            // 清空通道所有时间项
            clearChannelAllTime,
            deleteTimeItem,
            // 打开添加单个时间项弹窗
            openAddTimeDialog,
            // 添加单个时间项
            addTimeItem,
            // 添加多个通道时间项
            addUploadTime,
            setData,
        }
    },
})
