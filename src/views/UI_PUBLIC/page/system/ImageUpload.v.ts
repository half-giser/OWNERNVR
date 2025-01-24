/*
 * @Description: 系统——上海地标平台——定时图像上传
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-23 11:43:19
 */
import dayjs from 'dayjs'
import { SystenSHDBImageUploadDto } from '@/types/apiType/system'
import { type TableInstance } from 'element-plus'
import ImageUploadAddTimePop from './ImageUploadAddTimePop.vue'

export default defineComponent({
    components: {
        ImageUploadAddTimePop,
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()

        const tableRef = ref<TableInstance>()
        const timeMode = ref(24)
        const tableData = ref<SystenSHDBImageUploadDto[]>([])

        const pageData = ref({
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 当前行
            currentRow: new SystenSHDBImageUploadDto(),
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
        const handleToolBarEvent = (event: ConfigToolBarEvent<SearchToolBarEvent>) => {
            if (event.type === 'add') {
                pageData.value.addUploadTimePopOpen = true
                return
            }
        }

        /**
         * @description 表格项展开回调
         * @param {SystenSHDBImageUploadDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = (row: SystenSHDBImageUploadDto, expanded: boolean) => {
            tableRef.value!.setCurrentRow(row)
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
        const getRowKey = (row: SystenSHDBImageUploadDto) => {
            return row.chlId
        }

        // 24小时制转12小时制
        const _24turn12 = (value: string) => {
            return dayjs(`2000-01-01 ${value}`, DEFAULT_DATE_FORMAT).format('hh:mm:ss A')
        }

        // 获取时间格式
        const getTimeCfg = async () => {
            const res = await queryTimeCfg()
            timeMode.value = queryXml(res)('content/formatInfo/time').text().num()
        }

        // 获取数据
        const getData = async () => {
            openLoading()
            const result = await querySHDBNormalUploadCfg()
            closeLoading()
            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const chlId = $item('chl').attr('id')
                    const timelist = $item('timeList/item').map((ele) => {
                        return {
                            value: ele.text(),
                            label: timeMode.value === 12 ? _24turn12(ele.text()) : ele.text(),
                        }
                    })
                    return {
                        chlId,
                        chlNum: hexToDec(chlId.substring(1, chlId.indexOf('-'))),
                        name: $item('chl').text(),
                        timeCount: $item('timeList').attr('total').num(),
                        timelist,
                    }
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
        const orderTimeList = (row?: SystenSHDBImageUploadDto) => {
            if (!row) {
                tableData.value.forEach((item) => {
                    orderTimeList(item)
                })
                return
            }
            row.timelist.sort((a, b) => {
                const timeA = getSeconds(a.value)
                const timeB = getSeconds(b.value)
                return timeA - timeB
            })
        }

        // 清空当前通道所有时间项
        const clearChannelAllTime = (row: SystenSHDBImageUploadDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_SCHEDULE_CLEAR').formatForLang(getShortString(row.name, 10)),
            }).then(() => {
                row.timeCount = 0
                row.timelist = []
            })
        }

        // 删除时间项
        const deleteTimeItem = (row: SystenSHDBImageUploadDto, index: number) => {
            row.timelist.splice(index, 1)
            row.timeCount = row.timelist.length
        }

        // 打开添加时间项弹窗
        const openAddTimeDialog = (row: SystenSHDBImageUploadDto) => {
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
                openMessageBox(Translate('IDCS_SCHEDULE_TIME_NUMBER'))
                return false
            }

            for (let i = 0; i < timeList.length; i++) {
                const distime = getSeconds(timeList[i].value) - getSeconds(time)
                if (Math.abs(distime) < 5 * 60) {
                    openMessageBox(Translate('IDCS_SCHEDULE_TIME_INTER'))
                    return false
                }
            }

            return true
        }

        /**
         * @description 计算秒时间戳
         * @param {String} formatString HH:mm
         */
        const getSeconds = (formatString = '00:00:00') => {
            const split = formatString.split(':')
            return Number(split[0]) * 3600 + Number(split[1]) * 60
        }

        // 添加时间项弹窗确认
        const addUploadTime = (data: SystenSHDBImageUploadDto[], addTime: string) => {
            if (!data.length) {
                openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'))
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
            const sendXml = rawXml`
                <content type='list'>
                    <itemType>
                        <timeList type='list' />
                    </itemType>
                    ${tableData.value
                        .map((item) => {
                            return rawXml`
                                <item>
                                    <chl id='${item.chlId}'>${item.name}</chl>
                                    <timeList total='${item.timeCount}'>
                                        ${item.timelist.map((time) => `<item>${time.value}</item>`).join('')}
                                    </timeList>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            return sendXml
        }

        // 提交数据
        const setData = async () => {
            const sendXml = getSaveData()
            openLoading()
            const result = await editSHDBNormalUploadCfg(sendXml)
            closeLoading()
            commSaveResponseHandler(result)
        }

        // 挂载完成获取数据
        onMounted(async () => {
            await getTimeCfg()
            getData()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
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
