/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 15:55:22
 * @Description: 智能分析 - 组合统计
 */
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseAttributeSelector from './IntelBaseAttributeSelector.vue'
import { type BarChartXValueOptionItem } from '@/components/chart/BaseBarChart.vue'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseEventSelector,
        IntelBaseAttributeSelector,
    },
    setup() {
        const { Translate } = useLangStore()

        let chlMap: Record<string, string> = {}
        let eventMap: Record<string, string> = {}

        const pageData = ref({
            // 日期范围类型
            dateRangeType: 'date',
            // 统计显示类型选项
            chartOptions: [
                {
                    label: Translate('IDCS_COLIMNAR_CHART'),
                    value: 'chart',
                },
                {
                    label: Translate('IDCS_DETAIL_CHART'),
                    value: 'table',
                },
            ],
            // 图表/表格
            chartType: 'chart',
            // 图表选项
            barData: {
                xValue: [] as BarChartXValueOptionItem[],
                unit: '',
                writeY: 0,
                writeYSpacing: 0,
                yValue: [] as number[] | number[][],
                unitNum: 0,
                color: [] as number[],
                tooltip: [] as string[],
            },
            // 表格选项
            tableData: {
                label: [] as string[],
                data: [] as IntelStatsBarChartDataDto[],
            },
        })

        const formData = ref(new IntelCombineStatsForm())

        const tableData = ref<IntelCombineStatsList[]>([])

        const dateRangeType = computed(() => pageData.value.dateRangeType)
        const dateRange = computed(() => formData.value.dateRange)
        const stats = useStatsAxis(dateRangeType, dateRange)

        /**
         * @description 更改时间范围类型
         * @param {Array} value 时间戳 ms
         * @param {String} type
         */
        const changeDateRange = (value: [number, number], type: string) => {
            formData.value.dateRange = [...value]
            if (type === 'today') {
                pageData.value.dateRangeType = 'date'
            } else {
                pageData.value.dateRangeType = type
            }
            getData()
        }

        /**
         * @description 获取通道ID与通道名称的映射
         * @param {Record<string, string>} e
         */
        const getChlMap = (e: Record<string, string>) => {
            chlMap = e
        }

        /**
         * @description 修改通道选项
         * @param {string[]} e
         */
        const changeChl = (e: string[]) => {
            formData.value.chl = e
            getData()
        }

        /**
         * @description 获取事件key与回显名称的映射
         * @param {Record<string, string>} e
         */
        const getEventMap = (e: Record<string, string>) => {
            eventMap = e
        }

        /**
         * @description 修改事件选项
         * @param {string[]} e
         */
        const changeEvent = (e: string[]) => {
            formData.value.event = e
            pageData.value.chartType = 'chart'
            pageData.value.tableData = {
                label: [],
                data: [],
            }
            getData()
        }

        /**
         * @description 修改图表类型
         * @param {string} type
         */
        const changeType = (type: string) => {
            pageData.value.chartType = type
        }

        /**
         * @description 修改属性
         * @param {string[][]} e
         */
        const changeAttribute = (e: string[][]) => {
            formData.value.vehicleAttribute = e[0]
            formData.value.personAttribute = e[1]
            getData()
        }

        /**
         * @description 获取统计数据
         */
        const getData = async () => {
            if (!formData.value.chl.length) {
                return
            }
            openLoading()
            const sendXml = rawXml`
                <resultLimit>150000</resultLimit>
                <condition>
                    <startTime>${formatGregoryDate(formData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${formatGregoryDate(formData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <timeQuantum>${stats.getTimeQuantum()}</timeQuantum>
                    <deduplicate>${formData.value.deduplicate}</deduplicate>
                    <chls type="list">${formData.value.chl.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">${formData.value.event.map((item) => `<item>${item}</item>`).join('')}</events>
                    <person type="list">${formData.value.personAttribute.map((item) => `<item>${item}</item>`).join('')}</person>
                    <vehicle type="list">${formData.value.vehicleAttribute.map((item) => `<item>${item}</item>`).join('')}</vehicle>
                </condition>
            `
            const result = await faceImgStatistic_v2(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('status').text() === 'success') {
                tableData.value = $('content/timeStatistic/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        imageTotalNum: $item('imageTotalNum').text().num(),
                        imageTotalInNum: $item('imageTotalInNum').text().num(),
                        imageTotalOutNum: $item('imageTotalOutNum').text().num(),
                        chl: $item('chls/item').map((chl) => {
                            const $chl = queryXml(chl.element)
                            return {
                                chlId: chl.attr('id'),
                                imageNum: $chl('imageNum').text().num(),
                                personIn: $chl('personIn').text().num(),
                                personOut: $chl('personOut').text().num(),
                                vehicleIn: $chl('vehicleIn').text().num(),
                                vehicleOut: $chl('vehicleOut').text().num(),
                                nonVehicleIn: $chl('nonVehicleIn').text().num(),
                                nonVehicleOut: $chl('nonVehicleOut').text().num(),
                            }
                        }),
                        groups: $item('groups/item').map((group) => {
                            const $group = queryXml(group.element)
                            return {
                                groupId: group.attr('id'),
                                name: $group('name').text() || Translate('IDCS_UNKNOWN_GROUP'),
                                imageNum: $group('imageNum').text().num(),
                            }
                        }),
                    }
                })
                showMaxSearchLimitTips($)
            } else {
                if ($('errorCode').text().num() === ErrorCode.USER_ERROR_JSU_HAVEACSSYSTEM) {
                    openMessageBox(Translate('IDCS_SELECT_EVENT_TIP'))
                }
                tableData.value = []
            }

            pageData.value.barData = getBarData()
            if (formData.value.event[0] === 'faceMatchWhiteList') {
                pageData.value.tableData = getTableData()
            }
        }

        /**
         * @description 获取最大条形图值
         * @returns {number}
         */
        const getMaximun = () => {
            const array = tableData.value
                .map((item) => {
                    return formData.value.event[0] === 'passLine' ? [item.imageTotalInNum, item.imageTotalOutNum] : [item.imageTotalNum]
                })
                .flat()
            if (!array.length) {
                array.push(0)
            }
            return Math.max.apply(null, array)
        }

        /**
         * @description 生成图表数据
         * @returns {Object}
         */
        const getBarData = () => {
            const maximun = stats.calY(getMaximun())
            const isPassLine = formData.value.event[0] === 'passLine'
            return {
                writeY: maximun,
                writeYSpacing: maximun / 5,
                unit: stats.getUnit(),
                unitNum: isPassLine ? 2 : 1,
                xValue: stats.calX(),
                yValue: tableData.value.length
                    ? (tableData.value.map((item) => {
                          return isPassLine ? [item.imageTotalInNum, item.imageTotalOutNum] : item.imageTotalNum
                      }) as number[] | number[][])
                    : (Array(stats.getTimeQuantum())
                          .fill(0)
                          .map(() => {
                              return isPassLine ? [0, 0] : 0
                          }) as number[] | number[][]),
                color: isPassLine ? [1, 0] : [0],
                tooltip: isPassLine ? [Translate('IDCS_ENTRANCE'), Translate('IDCS_LEAVE')] : [],
            }
        }

        /**
         * @description 生成表格数据
         * @returns {Object}
         */
        const getTableData = () => {
            const groups: Record<string, { data: number[]; name: string }> = {}
            const label = stats.calLabel()
            tableData.value.forEach((item) => {
                item.groups.forEach((group) => {
                    if (!groups[group.groupId]) {
                        groups[group.groupId] = {
                            data: Array(label.length).fill(0),
                            name: group.name,
                        }
                    }
                })
            })
            tableData.value.forEach((item, index) => {
                item.groups.forEach((group) => {
                    groups[group.groupId].data[index] = group.imageNum
                })
            })
            return {
                label: label,
                data: Object.entries(groups).map((item) => {
                    return {
                        groupId: item[0],
                        groupName: item[1].name,
                        data: item[1].data,
                    }
                }),
            }
        }

        /**
         * @description 导出
         */
        const exportChart = () => {
            const csvTime = stats.getTimeRange()
            const csvTitle = {
                colspan: 3,
                content: `${Translate('COMBINE_STATISTIC')}(${eventMap[formData.value.event[0]]}) ${Translate('IDCS_COLIMNAR_CHART')} ${csvTime}`,
            }
            const csvHead = [Translate('IDCS_CHANNEL'), Translate('IDCS_TIME'), Translate('IDCS_TIMES')]

            if (formData.value.event[0] === 'passLine') {
                if (formData.value.personAttribute.includes('')) {
                    csvHead.push(`${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }

                if (formData.value.vehicleAttribute.includes('car')) {
                    csvHead.push(`${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }

                if (formData.value.vehicleAttribute.includes('motor')) {
                    csvHead.push(`${Translate('IDCS_NON_VEHICLE')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_NON_VEHICLE')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }
            }
            const label = stats.calLabel()
            const defaultValue = Array(csvTitle.colspan - 2).fill('0')
            const csvBody = [] as string[][]
            label.forEach((labelItem, index) => {
                const item = tableData.value[index]
                if (!item || !item.chl.length) {
                    csvBody.push(['--', labelItem, ...defaultValue])
                } else {
                    item.chl.map((chl) => {
                        const data = [chlMap[chl.chlId], labelItem, chl.imageNum + '']
                        if (formData.value.event[0] === 'passLine') {
                            if (formData.value.personAttribute.includes('')) {
                                data.push(chl.personIn + '', chl.personOut + '')
                            }

                            if (formData.value.vehicleAttribute.includes('car')) {
                                data.push(chl.vehicleIn + '', chl.vehicleOut + '')
                            }

                            if (formData.value.vehicleAttribute.includes('motor')) {
                                data.push(chl.nonVehicleIn + '', chl.nonVehicleOut + '')
                            }
                        }
                        csvBody.push(data)
                    })
                }
            })

            const xlsName = 'COMBINE_STATISTIC-' + formatDate(new Date(), 'YYYYMMDDHHmmss') + '.xls'
            downloadExcel(csvHead, csvBody, xlsName, csvTitle)
        }

        onMounted(() => {
            pageData.value.barData = getBarData()
        })

        return {
            formData,
            changeDateRange,
            pageData,
            getChlMap,
            changeChl,
            getEventMap,
            changeEvent,
            changeType,
            changeAttribute,
            exportChart,
        }
    },
})
