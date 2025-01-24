/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 15:16:08
 * @Description: 通道 - 信号接入配置
 */

import { ChannelSignalDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const cababilityStore = useCababilityStore()

        const tableData = ref<ChannelSignalDto[]>([new ChannelSignalDto()])
        const watchEdit = useWatchEditData(tableData)

        let supportLite = cababilityStore.supportLite
        let switchableIpChlMaxCount = cababilityStore.switchableIpChlMaxCount
        let ipChlMaxCountOriginal = cababilityStore.ipChlMaxCount
        let switchIpChlRange = cababilityStore.switchIpChlRange
        let supportChannelSignalLite = false
        const chls: number[] = []
        let chlSupSignalType = cababilityStore.chlSupSignalType

        const ipChlMaxCount = ref(cababilityStore.ipChlMaxCount)

        const signalTrasMap: Record<string, string> = {
            AHD: Translate('IDCS_SIGNAL_AHD'),
            TVI: Translate('IDCS_SIGNAL_TVI'),
            CVI: Translate('IDCS_SIGNAL_CVI'),
            AUTO: Translate('IDCS_SIGNAL_AUTO'),
        }

        const analogIpOptions = [
            {
                label: Translate('IDCS_SIGNAL_ANALOG'),
                value: 'Analog',
            },
            {
                label: Translate('IDCS_SIGNAL_IP'),
                value: 'IP',
            },
        ]

        const chlSupSignalTypeList = ref<SelectOption<string, string>[]>([])
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)

        const handleAnalogIpChange = (rowData: ChannelSignalDto) => {
            const count = tableData.value.filter((item) => item.signal === 'D').length
            if (rowData.analogIp === 'IP') {
                if ((switchIpChlRange[0] && rowData.id < switchIpChlRange[0] - 1) || (switchIpChlRange[1] && rowData.id > switchIpChlRange[1] - 1)) {
                    openMessageBox(Translate('IDCS_ANALOG_SWITCH_RANGE_ERROR').formatForLang(switchIpChlRange[0], switchIpChlRange[1]))
                    rowData.analogIp = 'Analog'
                    return
                }

                if (count >= switchableIpChlMaxCount) {
                    openMessageBox(Translate('IDCS_IP_CAN_NOT_ALL_SWITCH').formatForLang(switchableIpChlMaxCount))
                    rowData.analogIp = 'Analog'
                    return
                }
                rowData.showLite = false
                rowData.showSignal = false
                rowData.signal = 'D'
                ipChlMaxCount.value++
            } else {
                const name = rowData.name.slice(2, 4).indexOf('0') === 0 ? rowData.name.slice(3, 4) : rowData.name.slice(2, 4)
                if (chls.includes(Number(name))) {
                    openMessageBox(Translate('IDCS_SIGNAL_IP_TO_ANALOG_TIP'))
                    rowData.analogIp = 'IP'
                    return
                }
                rowData.showLite = true
                rowData.showSignal = true
                if (!rowData.signal) rowData.signal = 'AUTO'
                ipChlMaxCount.value--
            }
        }

        const handleAnalogIpChangeAll = (val: string) => {
            if (!tableData.value.length) return
            let guidAnalog = false
            const isIp: number[] = []
            tableData.value.forEach((ele) => {
                if (ele.analogIp === 'IP') isIp.push(ele.id)
                const name = ele.name.slice(2, 4).indexOf('0') === 0 ? ele.name.slice(3, 4) : ele.name.slice(2, 4)
                if (chls.includes(Number(name))) guidAnalog = true
            })
            let changeIpCount = 0
            const changeIpRowData: ChannelSignalDto[] = []
            let hasChangeIP = false
            if (val === 'IP' && tableData.value.length > switchableIpChlMaxCount) {
                tableData.value.forEach((ele) => {
                    if (!isIp.includes(ele.id) && changeIpCount < switchableIpChlMaxCount - isIp.length) {
                        changeIpRowData.push(ele)
                        changeIpCount++
                    }
                })
                openMessageBox(Translate('IDCS_IP_CAN_NOT_ALL_SWITCH').formatForLang(switchableIpChlMaxCount))
                hasChangeIP = true
            }

            if ((switchIpChlRange[0] && 1 < switchIpChlRange[0] && val === 'IP') || (switchIpChlRange[1] && tableData.value.length > switchIpChlRange[1] && val === 'IP')) {
                tableData.value.forEach((ele) => {
                    if (ele.id > switchIpChlRange[0] && ele.id < switchIpChlRange[1]) changeIpRowData.push(ele)
                })
                openMessageBox(Translate('IDCS_ANALOG_SWITCH_RANGE_ERROR').formatForLang(switchIpChlRange[0], switchIpChlRange[1]))
            }

            if (guidAnalog && val === 'Analog') {
                openMessageBox(Translate('IDCS_SIGNAL_IP_TO_ANALOG_TIP'))
                tableData.value.forEach((ele) => (ele.analogIp = 'IP'))
                guidAnalog = false
                return
            }

            if (changeIpRowData.length > 0 || hasChangeIP) {
                changeIpRowData.forEach((ele) => {
                    ele.showLite = false
                    ele.showSignal = false
                    ele.signal = 'D'
                    ele.analogIp = val
                })
            } else {
                tableData.value.forEach((ele) => {
                    if (val === 'IP') {
                        ele.showLite = false
                        ele.showSignal = false
                        ele.signal = 'D'
                    } else {
                        ele.showLite = true
                        ele.showSignal = true
                    }
                })
                tableData.value.forEach((ele) => (ele.analogIp = val))
            }

            if (val === 'IP') {
                ipChlMaxCount.value = ipChlMaxCountOriginal + switchableIpChlMaxCount
            } else {
                ipChlMaxCount.value = ipChlMaxCountOriginal
            }
        }

        const handleSignalChangeAll = (val: string) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                if (ele.signal !== 'D') {
                    ele.signal = val
                }
            })
        }

        const handleLiteChangeAll = (val: boolean) => {
            if (!tableData.value.length) return
            tableData.value.forEach((ele) => {
                ele.lite = val
            })
        }

        const getChlListData = () => {
            openLoading()
            getChlList({}).then((res) => {
                closeLoading()
                commLoadResponseHandler(res, ($) => {
                    $('content/item').forEach((ele) => {
                        const $item = queryXml(ele.element)
                        if ($item('chlType').text() === 'digital') chls.push(hexToDec(ele.attr('id').slice(7, 9)))
                    })
                })
            })
        }

        const getData = () => {
            openLoading()
            watchEdit.reset()
            queryBasicCfg().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                chlSupSignalTypeList.value = []
                let supportCvi = false
                chlSupSignalType.forEach((ele) => {
                    if (ele === 'CVI') {
                        supportCvi = true
                    } else {
                        chlSupSignalTypeList.value.push({
                            value: ele,
                            label: signalTrasMap[ele],
                        })
                    }
                })
                if (supportCvi) {
                    chlSupSignalTypeList.value.push({
                        value: 'CVI',
                        label: '',
                        options: [
                            {
                                value: 'CVI',
                                label: signalTrasMap.CVI,
                            },
                        ],
                    })
                }

                if ($('status').text() === 'success') {
                    const analogChlCount = cababilityStore.analogChlCount
                    const channelSignalTypeList = $('content/channelSignalType').text().split(':')
                    const defaultChannelSignalType = $('content/defaultChannelSignalType').text().split(':')
                    const channelSignalLiteList = $('content/channelSignalLite').text().split(':')
                    if ($('content/channelSignalLite').text()) supportChannelSignalLite = true

                    tableData.value = Array(analogChlCount)
                        .fill(null)
                        .map((_, i) => {
                            let analogIp = ''
                            if (i < channelSignalTypeList.length) {
                                if (channelSignalTypeList[i] === 'D') {
                                    analogIp = 'IP'
                                    ipChlMaxCount.value++
                                } else {
                                    analogIp = 'Analog'
                                }
                            }
                            return {
                                id: i,
                                name: Translate('IDCS_ANALOG_PREFIX').formatForLang(i + 1 > 9 ? i + 1 : '0' + (i + 1)),
                                lite: channelSignalLiteList[i].bool(),
                                signalType: channelSignalTypeList[i],
                                chlSupSignalTypeArray: chlSupSignalType,
                                defaultChannelSignalType: defaultChannelSignalType[i],
                                signal: channelSignalTypeList[i] === 'D' ? defaultChannelSignalType[i] : channelSignalTypeList[i],
                                analogIp,
                                showLite: channelSignalTypeList[i] === 'D' ? false : true,
                                showSignal: channelSignalTypeList[i] === 'D' ? false : true,
                            }
                        })
                    watchEdit.listen()
                }
            })
        }

        const save = () => {
            const changeAnalogIp = tableData.value.some((item) => {
                return (item.signal === 'D' && item.signalType !== 'D') || (item.signal !== 'D' && item.signalType === 'D')
            })

            if (changeAnalogIp) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_SIGNAL_SWITCH_AFTER_REBOOT'),
                }).then(async () => {
                    setData()
                    await initData()
                    getData()
                })
            } else {
                setData()
            }
        }

        const setData = () => {
            const channelSignalTypeList: string[] = []
            const channelSignalLiteList: boolean[] = []
            tableData.value.forEach((ele) => {
                channelSignalTypeList.push(ele.signal)
                channelSignalLiteList.push(ele.lite)
            })
            const data = rawXml`
                <content>
                    <channelSignalType>${channelSignalTypeList.join(':')}</channelSignalType>
                    ${supportChannelSignalLite ? `<channelSignalLite>${channelSignalLiteList.join(':')}</channelSignalLite>` : ''}
                </content>`

            openLoading()
            editBasicCfg(data).then(() => {
                closeLoading()
                watchEdit.update()
            })
        }

        const initData = async () => {
            await cababilityStore.updateCabability()
            supportLite = cababilityStore.supportLite
            switchableIpChlMaxCount = cababilityStore.switchableIpChlMaxCount
            ipChlMaxCount.value = cababilityStore.ipChlMaxCount
            ipChlMaxCountOriginal = cababilityStore.ipChlMaxCount
            switchIpChlRange = cababilityStore.switchIpChlRange
            chlSupSignalType = cababilityStore.chlSupSignalType
        }

        onMounted(async () => {
            getChlListData()
            await initData()
            getData()
        })

        return {
            tableData,
            ipChlMaxCount,
            watchEdit,
            supportLite,
            switchableIpChlMaxCount,
            chlSupSignalTypeList,
            handleAnalogIpChange,
            handleAnalogIpChangeAll,
            handleSignalChangeAll,
            handleLiteChangeAll,
            save,
            analogIpOptions,
            switchOptions,
        }
    },
})
