/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:57:50
 * @Description: 智能分析-车辆统计
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:18:20
 */
import IntelBaseChannelSelector from './IntelBaseChannelSelector.vue'
import IntelBaseEventSelector from './IntelBaseEventSelector.vue'
import IntelBaseAttributeSelector from './IntelBaseAttributeSelector.vue'
import { type IntelVehicleStatsList, IntelVehicleStatsForm } from '@/types/apiType/intelligentAnalysis'
import { type BarChartXValueOptionItem } from '@/components/chart/BaseBarChart.vue'

export default defineComponent({
    components: {
        IntelBaseChannelSelector,
        IntelBaseEventSelector,
        IntelBaseAttributeSelector,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        let chlMap: Record<string, string> = {}
        let eventMap: Record<string, string> = {}

        const pageData = ref({
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
            getData()
        }

        /**
         * @description 修改属性
         * @param {string[][]} e
         */
        const changeAttribute = (e: string[][]) => {
            formData.value.attribute = e[0]
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
                    <startTime>${formatDate(formData.value.dateRange[0], 'YYYY-MM-DD HH:mm:ss')}</startTime>
                    <endTime>${formatDate(formData.value.dateRange[1], 'YYYY-MM-DD HH:mm:ss')}</endTime>
                    <timeQuantum>${stats.getTimeQuantum().toString()}</timeQuantum>
                    <deduplicate>${formData.value.deduplicate.toString()}</deduplicate>
                    <chls type="list">${formData.value.chl.map((item) => `<item id="${item}"></item>`).join('')}</chls>
                    <events type="list">${formData.value.event.map((item) => `<item>${item}</item>`).join('')}</events>
                    <vehicle type="list">${formData.value.attribute.map((item) => `<item>${item}</item>`).join('')}</vehicle>
                </condition>
            `
            const result = await faceImgStatistic_v2(sendXml)
            const $ = queryXml(result)
            closeLoading()
            if ($('//status').text() === 'success') {
                tableData.value = $('//content/timeStatistic/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        imageTotalNum: Number($item('imageTotalNum').text()),
                        imageTotalInNum: Number($item('imageTotalInNum').text()),
                        imageTotalOutNum: Number($item('imageTotalOutNum').text()),
                        chl: $item('chls/item').map((chl) => {
                            const $chl = queryXml(chl.element)
                            return {
                                chlId: chl.attr('id')!,
                                imageNum: Number($chl('imageNum').text()),
                                vehicleIn: Number($chl('vehicleIn').text()),
                                vehicleOut: Number($chl('vehicleOut').text()),
                                nonVehicleIn: Number($chl('nonVehicleIn').text()),
                                nonVehicleOut: Number($chl('nonVehicleOut').text()),
                            }
                        }),
                    }
                })
                showMaxSearchLimitTips($)
            } else {
                if (Number($('//errorCode').text()) === ErrorCode.USER_ERROR_JSU_HAVEACSSYSTEM) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SELECT_EVENT_TIP'),
                    })
                }
                tableData.value = []
            }

            pageData.value.barData = getBarData()
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
         * @description 导出
         */
        const exportChart = () => {
            const csvTime = stats.getTimeRange()
            const csvTitle = {
                colspan: 3,
                content: `${Translate('IDCS_VEHICLE')}(${eventMap[formData.value.event[0]]}) ${Translate('IDCS_COLIMNAR_CHART')} ${csvTime}`,
            }
            const csvHead = [Translate('IDCS_CHANNEL'), Translate('IDCS_TIME'), Translate('IDCS_TIMES')]

            if (formData.value.event[0] === 'passLine') {
                if (formData.value.attribute.includes('car')) {
                    csvHead.push(`${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_ENTRANCE')})`, `${Translate('IDCS_DETECTION_VEHICLE')} (${Translate('IDCS_LEAVE')})`)
                    csvTitle.colspan += 2
                }

                if (formData.value.attribute.includes('motor')) {
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
                            if (formData.value.attribute.includes('car')) {
                                data.push(chl.vehicleIn + '', chl.vehicleOut + '')
                            }

                            if (formData.value.attribute.includes('motor')) {
                                data.push(chl.nonVehicleIn + '', chl.nonVehicleOut + '')
                            }
                        }
                        csvBody.push(data)
                    })
                }
            })

            const xlsName = 'VEHICLE_STATISTIC-' + formatDate(new Date(), 'YYYYMMDDHHmmss') + '.xls'
            downloadExcel(csvHead, csvBody, xlsName, csvTitle)
        }

        onMounted(async () => {
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
            IntelBaseChannelSelector,
            IntelBaseEventSelector,
            IntelBaseAttributeSelector,
        }
    },
})
