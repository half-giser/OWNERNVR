/*
 * @Description: 录像——参数配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-02 16:12:12
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 11:05:24
 */

import { cloneDeep } from 'lodash-es'
import RecParamCustomizationPop from './RecParamCustomizationPop.vue'
import { type ChlRecParamList, type ItemList } from '@/types/apiType/record'

export default defineComponent({
    components: {
        RecParamCustomizationPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const supportANR = systemCaps.supportANR
        // 保存原始数据，用来判断数据是否已被修改
        const originalData = ref({
            chlRecData: [] as ChlRecParamList[],
            streamRecSwitch: {
                doubleStreamSwitch: '',
                loopRecSwitch: '',
            },
        })

        const oldExpirationArr = [] as string[]

        const pageData = ref({
            doubleStreamRecSwitch: '',
            chkDoubleStreamRec: [
                { value: 'double', label: Translate('IDCS_RECORD_MODE_DOUBLE') },
                { value: 'main', label: Translate('IDCS_RECORD_MODE_MAIN') },
                { value: 'sub', label: Translate('IDCS_RECORD_MODE_SUB') },
            ],
            txtMSRecDuration: '',
            chkLoopRec: true,
            IPCMap: {} as Record<string, string>,
            expirationList: [] as ItemList[],
            perList: [] as ItemList[],
            postList: [] as ItemList[],
            // 开关选项列表
            switchOption: getSwitchOptions(),
            isSetCustomization: false,
            expirationType: '',
            expirationData: {} as ChlRecParamList,
        })

        const tableData = ref<ChlRecParamList[]>([])

        const getDevRecParamData = async () => {
            const result = await queryRecordDistributeInfo()
            const $dev = queryXml(result)

            commLoadResponseHandler(result, ($) => {
                pageData.value.doubleStreamRecSwitch = $('//content/doubleStreamRecSwitch').text()
                switch (pageData.value.doubleStreamRecSwitch) {
                    case 'main':
                        break
                    case 'sub':
                        break
                    default:
                        pageData.value.doubleStreamRecSwitch = 'double'
                }

                pageData.value.txtMSRecDuration = $('//content/mainStreamRecDuration').text()
                pageData.value.chkLoopRec = $('//content/loopRecSwitch').text().toLowerCase() === 'true'

                pageData.value.expirationList = $('//content/expirationNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        return {
                            value: item,
                            label: item == '0' ? Translate('IDCS_EXPIRE_OFF') : item == '1' ? '1 ' + Translate('IDCS_DAY_ALL') : item + ' ' + Translate('IDCS_DAYS'),
                        }
                    })
                pageData.value.expirationList.push({ value: 'customization', label: Translate('IDCS_REPLAY_CUSTOMIZE') })
            })

            return $dev
        }

        const getChlRecNodeList = async () => {
            const sendXML = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type='nodeType'>chls</nodeType>
                <requireField>
                    <name/>
                    <chlType/>
                    <supportANR/>
                </requireField>
            `
            const result = await queryNodeList(sendXML)
            commLoadResponseHandler(result, ($) => {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.IPCMap[item.attr('id') as string] = $item('supportANR').text()
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
                pageData.value.perList = $('//content/item/preRecordTimeNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        return {
                            value: item,
                            label: item == '0' ? Translate('IDCS_NO_BEFOREHAND_RECORD') : getTranslateForSecond(Number(item)),
                        }
                    })

                pageData.value.postList = $('//content/item/delayedRecordTimeNote')
                    .text()
                    .split(',')
                    .map((item) => {
                        return {
                            value: item,
                            label: item == '0' ? Translate('IDCS_NO_DELAY') : getTranslateForSecond(Number(item)),
                        }
                    })
            })

            return $chl
        }

        const getData = async () => {
            await getChlRecNodeList()

            const $dev = await getDevRecParamData()
            const $chl = await getChlRecParamData()

            if ($dev('//status').text() == 'success' && $chl('//status').text() == 'success') {
                const expiration = $dev('//content/expiration').text()
                const expirationUnit = $dev('//content/expiration').attr('unit')

                tableData.value = $chl('//content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const id = item.attr('id')!

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
                        expiration: expiration ? expiration : '0',
                        expirationUnit: expirationUnit ? expirationUnit : 'd',
                        manufacturerEnable: pageData.value.IPCMap[id as string] == 'true',
                    }
                })
                $dev('//content/chlParam/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    const singleExpirationUnit = $item('expiration').attr('unit') ? $item('expiration').attr('unit') : 'd'

                    tableData.value.forEach((element) => {
                        if (element.id == item.attr('id')) {
                            element.week = $item('week').text()
                            element.holiday = $item('holiday').text()
                            element.singleExpirationUnit = singleExpirationUnit
                            element.expiration = $item('expiration').text() ? $item('expiration').text() : '0'
                            element.expirationUnit = singleExpirationUnit
                        }
                    })
                })
                tableData.value.forEach((item) => {
                    if (!item.expiration) {
                        item.week = ''
                        item.holiday = ''
                        item.singleExpirationUnit = expirationUnit
                    } else {
                        if (item.singleExpirationUnit == 'h') {
                            item.expirationDisplay = item.expiration == '1' ? '1 ' + Translate('IDCS_HOUR') : item.expiration + ' ' + Translate('IDCS_HOURS')
                        } else {
                            item.expirationDisplay = item.expiration
                        }
                    }
                    oldExpirationArr.push(item.expirationDisplay!)
                })

                originalData.value.chlRecData = cloneDeep(tableData.value)
                originalData.value.streamRecSwitch = {
                    doubleStreamSwitch: $dev('//content/doubleStreamRecSwitch').text(),
                    loopRecSwitch: $dev('//content/loopRecSwitch').text(),
                }
            }
        }

        const setDevRecData = async () => {
            let sendXml = rawXml`
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
                    <loopRecSwitch>${String(pageData.value.chkLoopRec)}</loopRecSwitch>
                    <chlParam>
            `
            tableData.value.forEach((item) => {
                const singleExpirationUnit = item.singleExpirationUnit || 'd'
                sendXml += `<item id='${item.id}'>`
                sendXml += item.week ? `<week>${item.week}</week>` : ``
                sendXml += item.holiday ? `<holiday>${item.holiday}</holiday>` : ``
                sendXml += item.expiration ? `<expiration unit='${singleExpirationUnit}'>${item.expiration}</expiration>` : ``
                sendXml += `</item>`
            })
            sendXml += `</chlParam>`
            sendXml += `</content>`
            const result = await editRecordDistributeInfo(sendXml)
            return result
        }

        const setChlRecData = async (changeList: ChlRecParamList[]) => {
            let sendXml = rawXml`<content type='list' total='${String(changeList.length)}'\>`

            changeList.forEach((item) => {
                sendXml += rawXml`<item id='${item.id}'>
                    <rec per='${item.per}' post='${item.post}'/>`
                if (supportANR && item.manufacturerEnable) {
                    sendXml += `<ANRSwitch>${item.ANRSwitch}</ANRSwitch>`
                }
                sendXml += `</item>`
            })
            sendXml += `</content>`
            const result = await editNodeEncodeInfo(sendXml)

            return result
        }

        const setRecParamCfgData = async () => {
            // 判断修改过的选项
            const chlChangeList = [] as ChlRecParamList[]
            const devChangeList = [] as ChlRecParamList[]
            tableData.value.forEach((item, index) => {
                const element = originalData.value.chlRecData[index]
                if (item.per != element.per || item.post != element.post || item.ANRSwitch != element.ANRSwitch) {
                    chlChangeList.push(item)
                    element.per = item.per
                    element.post = item.post
                    element.ANRSwitch = item.ANRSwitch
                }

                if (
                    item.expiration != element.expiration ||
                    item.expirationUnit != element.expirationUnit ||
                    item.week != element.week ||
                    item.holiday != element.holiday ||
                    item.singleExpirationUnit != element.singleExpirationUnit
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
            if (devChangeList.length > 0 || doubleStreamSwitchChange || loopRecSwitchChange) {
                devResult = await setDevRecData()
            }

            if (chlChangeList.length > 0) {
                chlResult = await setChlRecData(chlChangeList)
                // todo:原代码中P2P模式下进行如下处理，recParamCfg.js，444行
                // if (APP_TYPE == "P2P") {
                //     result1=result1[0];
                //     result2=result2[0];
                // }
            }

            if (devResult && chlResult) {
                commSaveResponseHadler(chlResult)
            } else if (devResult) {
                commSaveResponseHadler(devResult)
            } else if (chlResult) {
                // 只有chlResult才会走到这里
                commSaveResponseHadler(chlResult)
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        const setData = async () => {
            openLoading()

            if (originalData.value.streamRecSwitch.doubleStreamSwitch != pageData.value.doubleStreamRecSwitch) {
                openMessageTipBox({
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

        const changeExpirationList = (rowData: ChlRecParamList) => {
            const value = rowData.expirationDisplay!
            if (value == 'customization') {
                rowData.expirationDisplay = oldExpirationArr[rowData.index]
                pageData.value.expirationType = 'single'
                pageData.value.expirationData = rowData
                pageData.value.isSetCustomization = true
            } else {
                if (value == '0') {
                    rowData.expiration = value
                    rowData.singleExpirationUnit = 'd'
                    oldExpirationArr[rowData.index] = rowData.expiration
                } else {
                    const unit = value == '1' ? Translate('IDCS_BY_DAY') : Translate('IDCS_DAYS')
                    const tips = value + ' ' + unit
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_CHANGE_EXPIRE_TIME_WARNING_D').formatForLang(tips),
                    })
                        .then(() => {
                            rowData.expiration = value
                            rowData.singleExpirationUnit = 'd'
                            oldExpirationArr[rowData.index] = rowData.expiration
                        })
                        .catch(() => {
                            if (rowData.singleExpirationUnit == 'h') {
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
            if (value == 'customization') {
                pageData.value.expirationType = 'all'
                pageData.value.isSetCustomization = true
            } else if (value == '0') {
                tableData.value.forEach((item) => {
                    item.expiration = value
                    item.expirationDisplay = value
                    item.singleExpirationUnit = 'd'
                    oldExpirationArr[item.index] = item.expiration
                })
            } else {
                const unit = value == '1' ? Translate('IDCS_BY_DAY') : Translate('IDCS_DAYS')
                const tips = value + ' ' + unit
                openMessageTipBox({
                    type: 'info',
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
                            if (item.singleExpirationUnit == 'h') {
                                item.expirationDisplay = oldExpirationArr[item.index]
                            } else {
                                item.expiration = oldExpirationArr[item.index]
                                item.expirationDisplay = oldExpirationArr[item.index]
                            }
                        })
                    })
            }
        }

        const handleGetExpirationData = (week: string, holiday: string, expiration: number, expirationData?: ChlRecParamList) => {
            if (pageData.value.expirationType == 'all') {
                tableData.value.forEach((item) => {
                    item.week = week
                    item.holiday = holiday
                    item.singleExpirationUnit = 'h'
                    item.expiration = String(expiration)
                    item.expirationDisplay = expiration == 1 ? '1 ' + Translate('IDCS_HOUR') : expiration + ' ' + Translate('IDCS_HOURS')

                    oldExpirationArr[item.index] = item.expirationDisplay
                })
            } else {
                expirationData!.week = week
                expirationData!.holiday = holiday
                expirationData!.singleExpirationUnit = 'h'
                expirationData!.expiration = String(expiration)
                expirationData!.expirationDisplay = expiration == 1 ? '1 ' + Translate('IDCS_HOUR') : expiration + ' ' + Translate('IDCS_HOURS')

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
            RecParamCustomizationPop,
            handleGetExpirationData,
        }
    },
})
