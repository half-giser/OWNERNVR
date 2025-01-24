/*
 * @Description: 录像——参数配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-02 16:12:12
 */

import { cloneDeep } from 'lodash-es'
import RecordParameterCustomPop from './RecordParameterCustomPop.vue'
import { RecordParamDto } from '@/types/apiType/record'

export default defineComponent({
    components: {
        RecordParameterCustomPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const supportANR = systemCaps.supportANR
        // 保存原始数据，用来判断数据是否已被修改
        const originalData = ref({
            chlRecData: [] as RecordParamDto[],
            streamRecSwitch: {
                doubleStreamSwitch: '',
                loopRecSwitch: '',
            },
        })

        const oldExpirationArr: string[] = []

        const pageData = ref({
            doubleStreamRecSwitch: '',
            chkDoubleStreamRec: [
                {
                    value: 'double',
                    label: Translate('IDCS_RECORD_MODE_DOUBLE'),
                },
                {
                    value: 'main',
                    label: Translate('IDCS_RECORD_MODE_MAIN'),
                },
                {
                    value: 'sub',
                    label: Translate('IDCS_RECORD_MODE_SUB'),
                },
            ],
            txtMSRecDuration: '',
            chkLoopRec: true,
            IPCMap: {} as Record<string, string>,
            expirationList: [] as SelectOption<string, string>[],
            perList: [] as SelectOption<string, string>[],
            postList: [] as SelectOption<string, string>[],
            // 开关选项列表
            switchOption: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            isSetCustomization: false,
            expirationType: '',
            expirationData: new RecordParamDto(),
        })

        const tableData = ref<RecordParamDto[]>([])

        const getDevRecParamData = async () => {
            const result = await queryRecordDistributeInfo()
            const $dev = queryXml(result)

            commLoadResponseHandler(result, ($) => {
                pageData.value.doubleStreamRecSwitch = $('content/doubleStreamRecSwitch').text()
                switch (pageData.value.doubleStreamRecSwitch) {
                    case 'main':
                        break
                    case 'sub':
                        break
                    default:
                        pageData.value.doubleStreamRecSwitch = 'double'
                }

                pageData.value.txtMSRecDuration = $('content/mainStreamRecDuration').text()
                pageData.value.chkLoopRec = $('content/loopRecSwitch').text().bool()

                pageData.value.expirationList = $('content/expirationNote')
                    .text()
                    .array()
                    .map((item) => {
                        return {
                            value: item,
                            label: item === '0' ? Translate('IDCS_EXPIRE_OFF') : item === '1' ? '1 ' + Translate('IDCS_DAY_ALL') : item + ' ' + Translate('IDCS_DAYS'),
                        }
                    })
                pageData.value.expirationList.push({
                    value: 'customization',
                    label: Translate('IDCS_REPLAY_CUSTOMIZE'),
                })
            })

            return $dev
        }

        const getChlRecNodeList = async () => {
            const result = await getChlList({
                requireField: ['supportANR'],
            })
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.IPCMap[item.attr('id')] = $item('supportANR').text()
                })
            })
        }

        const getChlRecParamData = async () => {
            const sendXML = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <rec/>
                    <preRecordTimeNote/>
                    <delayedRecordTimeNote/>
                </requireField>
            `
            const result = await queryNodeEncodeInfo(sendXML)
            const $chl = queryXml(result)

            commLoadResponseHandler(result, ($) => {
                pageData.value.perList = $('content/item/preRecordTimeNote')
                    .text()
                    .array()
                    .map((item) => {
                        return {
                            value: item,
                            label: item === '0' ? Translate('IDCS_NO_BEFOREHAND_RECORD') : getTranslateForSecond(Number(item)),
                        }
                    })

                pageData.value.postList = $('content/item/delayedRecordTimeNote')
                    .text()
                    .array()
                    .map((item) => {
                        return {
                            value: item,
                            label: item === '0' ? Translate('IDCS_NO_DELAY') : getTranslateForSecond(Number(item)),
                        }
                    })
            })

            return $chl
        }

        const getData = async () => {
            await getChlRecNodeList()

            const $dev = await getDevRecParamData()
            const $chl = await getChlRecParamData()

            if ($dev('status').text() === 'success' && $chl('status').text() === 'success') {
                const expiration = $dev('content/expiration').text()
                const expirationUnit = $dev('content/expiration').attr('unit')

                tableData.value = $chl('content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const id = item.attr('id')

                    return {
                        id,
                        index,
                        name: $item('name').text(),
                        chlType: $item('chlType').text(),
                        preRecordTimeNote: $item('preRecordTimeNote').text(),
                        delayedRecordTimeNote: $item('delayedRecordTimeNote').text(),
                        per: $item('rec').attr('per'),
                        post: $item('rec').attr('post'),
                        ANRSwitch: supportANR ? $item('ANRSwitch').text() : 'false',
                        expiration: expiration || '0',
                        expirationUnit: expirationUnit ? expirationUnit : 'd',
                        manufacturerEnable: pageData.value.IPCMap[id] === 'true',
                        expirationDisplay: '',
                        week: '',
                        holiday: '',
                        singleExpirationUnit: '',
                    }
                })
                $dev('content/chlParam/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    const singleExpirationUnit = $item('expiration').attr('unit') || 'd'

                    tableData.value.some((element) => {
                        if (element.id === item.attr('id')) {
                            element.week = $item('week').text()
                            element.holiday = $item('holiday').text()
                            element.singleExpirationUnit = singleExpirationUnit
                            element.expiration = $item('expiration').text() || '0'
                            element.expirationUnit = singleExpirationUnit
                            return true
                        }
                    })
                })
                tableData.value.forEach((item) => {
                    if (!item.expiration) {
                        item.week = ''
                        item.holiday = ''
                        item.singleExpirationUnit = expirationUnit
                    } else {
                        if (item.singleExpirationUnit === 'h') {
                            item.expirationDisplay = item.expiration === '1' ? '1 ' + Translate('IDCS_HOUR') : item.expiration + ' ' + Translate('IDCS_HOURS')
                        } else {
                            item.expirationDisplay = item.expiration
                        }
                    }
                    oldExpirationArr.push(item.expirationDisplay!)
                })

                originalData.value.chlRecData = cloneDeep(tableData.value)
                originalData.value.streamRecSwitch = {
                    doubleStreamSwitch: $dev('content/doubleStreamRecSwitch').text(),
                    loopRecSwitch: $dev('content/loopRecSwitch').text(),
                }
            }
        }

        const setDevRecData = async () => {
            const sendXml = rawXml`
                <types>
                    <recModeType>
                        <enum>manually</enum>
                        <enum>auto</enum>
                    </recModeType>
                    <autoRecModeType>
                        <enum>ALWAYS_HIGH</enum>
                        <enum>MOTION</enum>
                        <enum>ALARM</enum>
                        <enum>MOTION_ALARM</enum>
                        <enum>INTENSIVE_MOTION</enum>
                        <enum>INTENSIVE_ALARM</enum>
                        <enum>INTENSIVE_MOTION_ALARM</enum>
                    </autoRecModeType>
                </types>
                <content>
                    <doubleStreamRecSwitch>${pageData.value.doubleStreamRecSwitch}</doubleStreamRecSwitch>
                    <loopRecSwitch>${pageData.value.chkLoopRec}</loopRecSwitch>
                    <chlParam>
                        ${tableData.value
                            .map((item) => {
                                const singleExpirationUnit = item.singleExpirationUnit || 'd'
                                return rawXml`
                                    <item id='${item.id}'>
                                        ${item.week ? `<week>${item.week}</week>` : ''}
                                        ${item.holiday ? `<holiday>${item.holiday}</holiday>` : ''}
                                        ${item.expiration ? `<expiration unit='${singleExpirationUnit}'>${item.expiration}</expiration>` : ''}
                                    </item>
                                `
                            })
                            .join('')}
                    </chlParam>
                </content>
            `

            const result = await editRecordDistributeInfo(sendXml)
            return result
        }

        const setChlRecData = async (changeList: RecordParamDto[]) => {
            const sendXml = rawXml`
                <content type='list' total='${changeList.length}'>
                    ${changeList
                        .map((item) => {
                            return rawXml`
                                <item id='${item.id}'>
                                    <rec per='${item.per}' post='${item.post}'/>
                                    ${supportANR && item.manufacturerEnable ? `<ANRSwitch>${item.ANRSwitch}</ANRSwitch>` : ''}
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            const result = await editNodeEncodeInfo(sendXml)

            return result
        }

        const setRecParamCfgData = async () => {
            // 判断修改过的选项
            const chlChangeList: RecordParamDto[] = []
            const devChangeList: RecordParamDto[] = []
            tableData.value.forEach((item, index) => {
                const element = originalData.value.chlRecData[index]
                if (item.per !== element.per || item.post !== element.post || item.ANRSwitch !== element.ANRSwitch) {
                    chlChangeList.push(item)
                    element.per = item.per
                    element.post = item.post
                    element.ANRSwitch = item.ANRSwitch
                }

                if (
                    item.expiration !== element.expiration ||
                    item.expirationUnit !== element.expirationUnit ||
                    item.week !== element.week ||
                    item.holiday !== element.holiday ||
                    item.singleExpirationUnit !== element.singleExpirationUnit
                ) {
                    devChangeList.push(item)
                    element.expiration = item.expiration
                    element.expirationUnit = item.expirationUnit
                    element.week = item.week
                    element.holiday = item.holiday
                    element.singleExpirationUnit = item.singleExpirationUnit
                }
            })
            const doubleStreamSwitchChange = originalData.value.streamRecSwitch.doubleStreamSwitch !== pageData.value.doubleStreamRecSwitch
            const loopRecSwitchChange = originalData.value.streamRecSwitch.loopRecSwitch !== String(pageData.value.chkLoopRec)

            let devResult
            let chlResult
            if (devChangeList.length || doubleStreamSwitchChange || loopRecSwitchChange) {
                devResult = await setDevRecData()
            }

            if (chlChangeList.length) {
                chlResult = await setChlRecData(chlChangeList)
            }

            if (devResult && chlResult) {
                commSaveResponseHandler(chlResult)
            } else if (devResult) {
                commSaveResponseHandler(devResult)
            } else if (chlResult) {
                // 只有chlResult才会走到这里
                commSaveResponseHandler(chlResult)
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        const setData = () => {
            openLoading()

            if (originalData.value.streamRecSwitch.doubleStreamSwitch !== pageData.value.doubleStreamRecSwitch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_RECORD_MODE_CHANGE_AFTER_REBOOT'),
                }).then(() => {
                    setRecParamCfgData()
                })
            } else {
                setRecParamCfgData()
            }
            closeLoading()
        }

        const changeAllPerList = (value: string) => {
            tableData.value.forEach((item) => {
                item.per = value
            })
        }

        const changeAllPostList = (value: string) => {
            tableData.value.forEach((item) => {
                item.post = value
            })
        }

        const changeAllANRSwitchList = (value: string) => {
            tableData.value.forEach((item) => {
                if (item.manufacturerEnable) {
                    item.ANRSwitch = value
                }
            })
        }

        const changeExpirationList = (rowData: RecordParamDto) => {
            const value = rowData.expirationDisplay!
            if (value === 'customization') {
                rowData.expirationDisplay = oldExpirationArr[rowData.index]
                pageData.value.expirationType = 'single'
                pageData.value.expirationData = rowData
                pageData.value.isSetCustomization = true
            } else {
                if (value === '0') {
                    rowData.expiration = value
                    rowData.singleExpirationUnit = 'd'
                    oldExpirationArr[rowData.index] = rowData.expiration
                } else {
                    const unit = value === '1' ? Translate('IDCS_BY_DAY') : Translate('IDCS_DAYS')
                    const tips = value + ' ' + unit
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_CHANGE_EXPIRE_TIME_WARNING_D').formatForLang(tips),
                    })
                        .then(() => {
                            rowData.expiration = value
                            rowData.singleExpirationUnit = 'd'
                            oldExpirationArr[rowData.index] = rowData.expiration
                        })
                        .catch(() => {
                            if (rowData.singleExpirationUnit === 'h') {
                                rowData.expirationDisplay = oldExpirationArr[rowData.index]
                            } else {
                                rowData.expiration = oldExpirationArr[rowData.index]
                                rowData.expirationDisplay = oldExpirationArr[rowData.index]
                            }
                        })
                }
            }
        }

        const changeAllExpirationList = (value: string) => {
            if (value === 'customization') {
                pageData.value.expirationType = 'all'
                pageData.value.isSetCustomization = true
            } else if (value === '0') {
                tableData.value.forEach((item) => {
                    item.expiration = value
                    item.expirationDisplay = value
                    item.singleExpirationUnit = 'd'
                    oldExpirationArr[item.index] = item.expiration
                })
            } else {
                const unit = value === '1' ? Translate('IDCS_BY_DAY') : Translate('IDCS_DAYS')
                const tips = value + ' ' + unit
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_CHANGE_EXPIRE_TIME_WARNING_D').formatForLang(tips),
                })
                    .then(() => {
                        tableData.value.forEach((item) => {
                            item.expiration = value
                            item.expirationDisplay = value
                            item.singleExpirationUnit = 'd'
                            oldExpirationArr[item.index] = item.expiration
                        })
                    })
                    .catch(() => {
                        tableData.value.forEach((item) => {
                            if (item.singleExpirationUnit === 'h') {
                                item.expirationDisplay = oldExpirationArr[item.index]
                            } else {
                                item.expiration = oldExpirationArr[item.index]
                                item.expirationDisplay = oldExpirationArr[item.index]
                            }
                        })
                    })
            }
        }

        const handleGetExpirationData = (week: string, holiday: string, expiration: number, expirationData?: RecordParamDto) => {
            if (pageData.value.expirationType === 'all') {
                tableData.value.forEach((item) => {
                    item.week = week
                    item.holiday = holiday
                    item.singleExpirationUnit = 'h'
                    item.expiration = String(expiration)
                    item.expirationDisplay = expiration === 1 ? '1 ' + Translate('IDCS_HOUR') : expiration + ' ' + Translate('IDCS_HOURS')

                    oldExpirationArr[item.index] = item.expirationDisplay
                })
            } else {
                expirationData!.week = week
                expirationData!.holiday = holiday
                expirationData!.singleExpirationUnit = 'h'
                expirationData!.expiration = String(expiration)
                expirationData!.expirationDisplay = expiration === 1 ? '1 ' + Translate('IDCS_HOUR') : expiration + ' ' + Translate('IDCS_HOURS')

                oldExpirationArr[expirationData!.index] = expirationData!.expirationDisplay
            }
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            supportANR,
            tableData,
            pageData,
            setData,
            changeAllPerList,
            changeAllPostList,
            changeAllANRSwitchList,
            changeExpirationList,
            changeAllExpirationList,
            handleGetExpirationData,
        }
    },
})
