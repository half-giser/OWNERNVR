/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:44:19
 * @Description: 智能分析-人员统计
 */
import { VALUE_NAME_MAPPING } from '@/utils/const/snap'
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseProfileSelector from './IntelBaseProfileSelector.vue'
import { type BarChartXValueOptionItem } from '@/components/chart/BaseBarChart.vue'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseEventSelector,
        IntelBaseProfileSelector,
    },
    setup() {
        const { Translate } = useLangStore()

        let chlMap: Record<string, string> = {}
        let eventMap: Record<string, string> = {}
        let chlLoadComplete = false
        let totalTableData: IntelPersonStatsList[] = []
        let childTableData: IntelPersonStatsList[] = []

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

        const formData = ref(new IntelPersonStatsForm())

        const tableData = ref<IntelPersonStatsList[]>([])

        const dateRangeType = computed(() => pageData.value.dateRangeType)
        const dateRange = computed(() => formData.value.dateRange)
        const stats = useStatsAxis(dateRangeType, dateRange)
        const onlyChild = ref(false)

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
            chlLoadComplete = true
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

        const changeAttr = (e: Record<string, Record<string, string[]>>) => {
            formData.value.attribute = e
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
         * @description 获取统计数据
         */
        const getData = async () => {
            if (!formData.value.chl.length) {
                // NTA1-1294 不显示已删除通道，表格没有可选通道时，提示“请选择通道”且不下发查询协议
                if (chlLoadComplete) {
                    openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'))
                }
                return
            }
            openLoading()
            const attributeXml =
                formData.value.event[0] === 'videoMetadata'
                    ? Object.keys(formData.value.attribute)
                          .map((key) => {
                              const detail = Object.entries(formData.value.attribute[key])
                                  .map((item) => {
                                      return `<item name="${item[0]}">${item[1].join(',')}</item>`
                                  })
                                  .join('')
                              return rawXml`
                                <item type="${key}">
                                    <attribute>${detail}</attribute>
                                </item>`
                          })
                          .join('')
                    : ''
            const sendXml = rawXml`
                <resultLimit>150000</resultLimit>
                <condition>
                    <startTime>${formatGregoryDate(formData.value.dateRange[0], DEFAULT_DATE_FORMAT)}</startTime>
                    <endTime>${formatGregoryDate(formData.value.dateRange[1], DEFAULT_DATE_FORMAT)}</endTime>
                    <timeQuantum>${stats.getTimeQuantum()}</timeQuantum>
                    <chls type="list">${formData.value.chl.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">${formData.value.event.map((item) => `<item>${item}</item>`).join('')}</events>
                    <person type="list">
                        <item>male</item>
                        <item>female</item>
                    </person>
                    <targetAttribute type="list">${attributeXml}</targetAttribute>
                </condition>
            `
            const result = await faceImgStatistic_v2(sendXml)
            const $ = queryXml(result)
            closeLoading()
            totalTableData = []
            childTableData = []
            if ($('status').text() === 'success') {
                $('content/timeStatistic/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    let childTotalNum = 0 // 儿童 -- 总数
                    let childTotalInNum = 0 // 儿童 -- 进入总数
                    let childTotalOutNum = 0 // 儿童 -- 离开总数
                    const totalData: IntelPersonStatsChlList[] = []
                    const childData: IntelPersonStatsChlList[] = []
                    const groupData: IntelPersonStatsGroupList[] = []
                    $item('chls/item').forEach((chl) => {
                        const $chl = queryXml(chl.element)
                        const tempData = new IntelPersonStatsChlList()
                        const childTempData = new IntelPersonStatsChlList()
                        const chlId = chl.attr('id')
                        const imageNum = $chl('imageNum').text().num()
                        tempData.chlId = chlId
                        tempData.imageNum = imageNum
                        childTempData.chlId = chlId
                        childTempData.imageNum = imageNum

                        const personIn = $chl('personIn').text().num()
                        const personOut = $chl('personOut').text().num()
                        const childIn = $chl('childIn').text().num()
                        const childOut = $chl('childOut').text().num()

                        if (formData.value.event[0] === 'passLine' || formData.value.event[0] === 'regionStatistics') {
                            tempData.personIn = personIn
                            tempData.personOut = personOut
                        } else if (formData.value.event[0] === 'passengerFlow') {
                            // 大人 + 儿童
                            tempData.personIn = personIn
                            tempData.personOut = personOut
                            tempData.childIn = childIn
                            tempData.childOut = childOut

                            // 仅儿童
                            childTempData.personIn = 0
                            childTempData.personOut = 0 //导出时，人数统计为0
                            childTempData.childIn = childIn
                            childTempData.childOut = childOut
                            childTempData.imageNum = childIn + childOut
                            childTotalInNum += childIn
                            childTotalOutNum += childOut
                            childTotalNum += childIn + childOut
                        }
                        totalData.push(tempData)
                        childData.push(childTempData)
                    })
                    $item('groups/item').forEach((group) => {
                        const $group = queryXml(group.element)
                        groupData.push({
                            groupId: group.attr('id'),
                            name: $group('name').text() || Translate('IDCS_UNKNOWN_GROUP'),
                            imageNum: $group('imageNum').text().num(),
                        })
                    })
                    totalTableData.push({
                        imageTotalNum: $item('imageTotalNum').text().num(),
                        imageTotalInNum: $item('imageTotalInNum').text().num(),
                        imageTotalOutNum: $item('imageTotalOutNum').text().num(),
                        chl: totalData,
                        groups: groupData,
                    })
                    childTableData.push({
                        imageTotalNum: childTotalNum,
                        imageTotalInNum: childTotalInNum,
                        imageTotalOutNum: childTotalOutNum,
                        chl: childData,
                        groups: groupData,
                    })
                })
                tableData.value = onlyChild.value ? childTableData : totalTableData
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
                    return isDoubleLine.value ? [item.imageTotalInNum, item.imageTotalOutNum] : [item.imageTotalNum]
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
            return {
                writeY: maximun,
                writeYSpacing: maximun / 5,
                unit: stats.getUnit(),
                unitNum: isDoubleLine.value ? 2 : 1,
                xValue: stats.calX(),
                yValue: tableData.value.length
                    ? (tableData.value.map((item) => {
                          return isDoubleLine.value ? [item.imageTotalInNum, item.imageTotalOutNum] : item.imageTotalNum
                      }) as number[] | number[][])
                    : (Array(stats.getTimeQuantum())
                          .fill(0)
                          .map(() => {
                              return isDoubleLine.value ? [0, 0] : 0
                          }) as number[] | number[][]),
                color: isDoubleLine.value ? [1, 0] : [0],
                tooltip: isDoubleLine.value ? [Translate('IDCS_ENTRANCE'), Translate('IDCS_LEAVE')] : [],
            }
        }

        const isDoubleLine = computed(() => {
            return ['passLine', 'regionStatistics', 'passengerFlow'].includes(formData.value.event[0])
        })

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
        const exportChart = async () => {
            const csvTime = stats.getTimeRange()
            const csvTitle = {
                colspan: 3,
                content: `${Translate('IDCS_DETECTION_PERSON')}(${eventMap[formData.value.event[0]] ? eventMap[formData.value.event[0]] : ' '}) ${Translate('IDCS_COLIMNAR_CHART')} ${csvTime}`,
            }
            const csvHead = [Translate('IDCS_CHANNEL'), Translate('IDCS_TIME'), Translate('IDCS_TIMES')]

            if (formData.value.event[0] === 'passLine' || formData.value.event[0] === 'regionStatistics') {
                csvHead.push(`${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_LEAVE')})`)
                csvTitle.colspan = 5
            } else if (formData.value.event[0] === 'passengerFlow') {
                csvHead.push(
                    `${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_ENTRANCE')})`,
                    `${Translate('IDCS_DETECTION_PERSON')} (${Translate('IDCS_LEAVE')})`,
                    `${Translate('IDCS_CHILD_ENTRY_NUMBER')}`,
                    `${Translate('IDCS_CHILD_EXIT_NUMBER')}`,
                )
                csvTitle.colspan = 7
            }
            const label = stats.calLabel()
            const csvBody: string[][] = []
            const defaultValue = Array(csvTitle.colspan - 2).fill('0')
            label.forEach((labelItem, index) => {
                const item = tableData.value[index]
                if (!item || !item.chl.length) {
                    csvBody.push(['--', labelItem, ...defaultValue])
                } else {
                    item.chl.map((chl) => {
                        const data = [chlMap[chl.chlId], labelItem, chl.imageNum + '']
                        if (formData.value.event[0] === 'passLine' || formData.value.event[0] === 'regionStatistics') {
                            data.push(chl.personIn + '', chl.personOut + '')
                        } else if (formData.value.event[0] === 'passengerFlow') {
                            data.push(chl.personIn + '', chl.personOut + '', chl.childIn + '', chl.childOut + '')
                        }
                        csvBody.push(data)
                    })
                }
            })

            const xlsName = 'PEOPLE_STATISTIC-' + formatDate(new Date(), 'YYYYMMDDHHmmss') + '.xls'
            let structureInfo = null
            if (formData.value.event[0] === 'videoMetadata') {
                const attributeOption = await getSearchOptions()
                const type = Translate('IDCS_DETECTION_PERSON')
                const contentList: string[] = []
                attributeOption.person.forEach((attr) => {
                    let content = ''
                    if (formData.value.attribute.person[attr.value] && formData.value.attribute.person[attr.value].length) {
                        content += attr.label + ':'
                        content += formData.value.attribute.person[attr.value]
                            .map((item) => {
                                return Translate(VALUE_NAME_MAPPING[item])
                            })
                            .join(',')
                        content += ';'
                    }
                    if (content) contentList.push(content)
                })
                structureInfo = {
                    type,
                    content: contentList,
                }
                downloadExcel(csvHead, csvBody, xlsName, csvTitle, structureInfo)
            } else {
                downloadExcel(csvHead, csvBody, xlsName, csvTitle)
            }
        }

        const handleOnlyChildChange = () => {
            tableData.value = onlyChild.value ? childTableData : totalTableData
            pageData.value.barData = getBarData()
        }

        onActivated(() => {
            pageData.value.barData = getBarData()
        })

        return {
            formData,
            pageData,
            onlyChild,
            changeDateRange,
            getChlMap,
            changeChl,
            getEventMap,
            changeEvent,
            changeAttr,
            changeType,
            exportChart,
            handleOnlyChildChange,
        }
    },
})
