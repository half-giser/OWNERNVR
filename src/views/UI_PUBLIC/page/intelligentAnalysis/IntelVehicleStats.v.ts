/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:57:50
 * @Description: 智能分析-车辆统计
 */
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import { type BarChartXValueOptionItem } from '@/components/chart/BaseBarChart.vue'
import { VALUE_NAME_MAPPING } from '@/utils/const/snap'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseEventSelector,
    },
    setup() {
        const { Translate } = useLangStore()

        let chlMap: Record<string, string> = {}
        let eventMap: Record<string, string> = {}
        let chlLoadComplete = false
        let lock = false

        const pageData = ref({
            searchType: 'byCar',
            searchOptions: [
                {
                    label: Translate('IDCS_DETECTION_VEHICLE'),
                    value: 'byCar',
                },
                {
                    label: Translate('IDCS_NON_VEHICLE'),
                    value: 'byMotorcycle',
                },
                {
                    label: Translate('IDCS_LICENSE_PLATE_NUM'),
                    value: 'byPlateNumber',
                },
            ],
            event: [],
            eventForPlate: [],
            attributeForCar: {} as Record<string, Record<string, string[]>>,
            attributeForMotor: {} as Record<string, Record<string, string[]>>,
            plateNumber: '',
            // 日期范围类型
            dateRangeType: 'date',
            // 统计显示类型选项
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
        })

        const formData = ref(new IntelVehicleStatsForm())

        const tableData = ref<IntelVehicleStatsList[]>([])

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
            if (['plateDetection', 'plateMatchWhiteList', 'plateMatchStranger'].includes(e[0])) {
                formData.value.deduplicate = false
            }

            if (pageData.value.searchType === 'byCar') {
                formData.value.attribute = pageData.value.attributeForCar
            } else if (pageData.value.searchType === 'byMotorcycle') {
                formData.value.attribute = pageData.value.attributeForMotor
            }
            getData()
        }

        /**
         * @description 修改属性
         * @param {string[][]} e
         */
        const changeAttribute = (e: Record<string, Record<string, string[]>>) => {
            formData.value.attribute = e
            getData()
        }

        const changeTab = () => {
            if (pageData.value.searchType === 'byCar') {
                formData.value.attribute = pageData.value.attributeForCar
                formData.value.event = pageData.value.event
            } else if (pageData.value.searchType === 'byMotorcycle') {
                formData.value.attribute = pageData.value.attributeForMotor
                formData.value.event = pageData.value.event
            } else {
                formData.value.event = pageData.value.eventForPlate
            }
            getData()
        }

        const changeDeDuplicate = () => {
            getData()
        }

        /**
         * @description 获取统计数据
         */
        const getData = async () => {
            if (lock) {
                return
            }

            if (!formData.value.chl.length) {
                // NTA1-1294 不显示已删除通道，表格没有可选通道时，提示“请选择通道”且不下发查询协议
                if (chlLoadComplete) {
                    openMessageBox(Translate('IDCS_PROMPT_CHANNEL_GROUP_EMPTY'))
                }
                return
            }

            openLoading()
            lock = true
            const carXml = pageData.value.searchType === 'byCar' ? '<item>car</item>' : ''
            const motorXml = pageData.value.searchType === 'byMotorcycle' ? '<item>motor</item>' : ''
            const vehicleXml = pageData.value.searchType === 'byPlateNumber' ? '<item>car</item><item>motor</item>' : carXml + motorXml
            const attributeXml =
                formData.value.event[0] === 'videoMetadata'
                    ? Object.keys(formData.value.attribute)
                          .map((key) => {
                              const detail = Object.entries(formData.value.attribute[key])
                                  .map((item) => {
                                      if (item[0] === 'vehicleBrand') {
                                          if (item[1][0] === 'all') {
                                              return `<item name="${item[0]}"></item>`
                                          } else {
                                              return `<item name="${item[0]}">${item[1].join(',')}</item>`
                                          }
                                      } else {
                                          return `<item name="${item[0]}">${item[1].join(',')}</item>`
                                      }
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
                    <deduplicate>${pageData.value.searchType === 'byPlateNumber' ? formData.value.deduplicate : 'false'}</deduplicate>
                    <chls type="list">${formData.value.chl.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">${formData.value.event.map((item) => `<item>${item}</item>`).join('')}</events>
                    <vehicle type="list">${vehicleXml}</vehicle>
                    <targetAttribute type="list">${attributeXml}</targetAttribute>
                </condition>
            `
            const result = await faceImgStatistic_v2(sendXml)
            const $ = queryXml(result)
            closeLoading()
            lock = false

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
                                vehicleIn: $chl('vehicleIn').text().num(),
                                vehicleOut: $chl('vehicleOut').text().num(),
                                nonVehicleIn: $chl('nonVehicleIn').text().num(),
                                nonVehicleOut: $chl('nonVehicleOut').text().num(),
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
        }

        const isDoubleLine = computed(() => {
            return ['passLine', 'regionStatistics'].includes(formData.value.event[0])
        })

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

        /**
         * @description 导出
         */
        const exportChart = async () => {
            let csvTitlePrefix = ''
            let xlsNamePrefix = ''
            if (pageData.value.searchType === 'byCar') {
                csvTitlePrefix = Translate('IDCS_DETECTION_VEHICLE')
                xlsNamePrefix = 'VEHICLE'
            } else if (pageData.value.searchType === 'byMotorcycle') {
                csvTitlePrefix = Translate('IDCS_NON_VEHICLE')
                xlsNamePrefix = 'NON_VEHICLE'
            } else {
                csvTitlePrefix = Translate('IDCS_LICENSE_PLATE')
                xlsNamePrefix = 'PLATE'
            }
            const csvTime = stats.getTimeRange()
            const csvTitle = {
                colspan: 3,
                content: `${csvTitlePrefix}(${eventMap[formData.value.event[0]]}) ${Translate('IDCS_COLIMNAR_CHART')} ${csvTime}`,
            }
            const csvHead = [Translate('IDCS_CHANNEL'), Translate('IDCS_TIME'), Translate('IDCS_TIMES')]

            if (formData.value.event[0] === 'passLine' || formData.value.event[0] === 'regionStatistics') {
                if (pageData.value.searchType === 'byCar') {
                    csvHead.push(`${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }

                if (pageData.value.searchType === 'byMotorcycle') {
                    csvHead.push(`${Translate('IDCS_NON_VEHICLE')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_NON_VEHICLE')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }
            }
            const label = stats.calLabel()
            const defaultValue: string[] = Array(csvTitle.colspan - 2).fill('0')
            const csvBody: string[][] = []
            label.forEach((labelItem, index) => {
                const item = tableData.value[index]
                if (!item || !item.chl.length) {
                    csvBody.push(['--', labelItem, ...defaultValue])
                } else {
                    item.chl.map((chl) => {
                        const data = [chlMap[chl.chlId], labelItem, chl.imageNum + '']
                        if (formData.value.event[0] === 'passLine' || formData.value.event[0] === 'regionStatistics') {
                            if (pageData.value.searchType === 'byCar') {
                                data.push(chl.vehicleIn + '', chl.vehicleOut + '')
                            }

                            if (pageData.value.searchType === 'byMotorcycle') {
                                data.push(chl.nonVehicleIn + '', chl.nonVehicleOut + '')
                            }
                        }
                        csvBody.push(data)
                    })
                }
            })

            const xlsName = `${xlsNamePrefix}_STATISTIC-` + formatDate(new Date(), 'YYYYMMDDHHmmss') + '.xls'
            let structureInfo = null
            if (formData.value.event[0] === 'videoMetadata') {
                const attributeOption = await getSearchOptions()
                const vehicleType = pageData.value.searchType === 'byCar' ? 'car' : 'motor'
                const type = pageData.value.searchType === 'byCar' ? Translate('IDCS_DETECTION_VEHICLE') : Translate('IDCS_NON_VEHICLE')
                const contentList: string[] = []
                attributeOption[vehicleType].forEach((item) => {
                    let content = ''
                    if (formData.value.attribute[vehicleType][item.value] && formData.value.attribute[vehicleType][item.value].length) {
                        content = item.label + ':'
                        content += formData.value.attribute[vehicleType][item.value]
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

        onActivated(() => {
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
            changeAttribute,
            exportChart,
            changeTab,
            changeDeDuplicate,
        }
    },
})
