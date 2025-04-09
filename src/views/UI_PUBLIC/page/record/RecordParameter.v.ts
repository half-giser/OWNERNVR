/*
 * @Description: 录像——参数配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-02 16:12:12
 */

import RecordParameterCustomPop from './RecordParameterCustomPop.vue'

export default defineComponent({
    components: {
        RecordParameterCustomPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const supportANR = systemCaps.supportANR
        const oldExpirationArr: string[] = []

        const pageData = ref({
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
            IPCMap: {} as Record<string, string>,
            expirationList: [] as SelectOption<string, string>[],
            perList: [] as SelectOption<string, string>[],
            postList: [] as SelectOption<string, string>[],
            // 开关选项列表
            switchOption: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            isSetCustomization: false,
            expirationType: '',
            expirationData: new RecordParamDto(),
            originalDoubleStreamSwitch: '',
        })

        const tableData = ref<RecordParamDto[]>([])
        const editRows = useWatchEditRows<RecordParamDto>()

        const formData = ref(new RecordParamForm())
        const editForm = useWatchEditData(formData)

        const getDevRecParamData = async () => {
            const result = await queryRecordDistributeInfo()
            const $ = await commLoadResponseHandler(result)

            let doubleStreamRecSwitch = $('content/doubleStreamRecSwitch').text()
            if (!['main', 'sub'].includes(doubleStreamRecSwitch)) {
                doubleStreamRecSwitch = 'double'
            }
            formData.value.doubleStreamRecSwitch = doubleStreamRecSwitch
            // pageData.value.txtMSRecDuration = $('content/mainStreamRecDuration').text()
            formData.value.loopRecSwitch = $('content/loopRecSwitch').text().bool()

            pageData.value.originalDoubleStreamSwitch = doubleStreamRecSwitch

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

            return $
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
            const $ = await commLoadResponseHandler(result)

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

            return $
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
                        disabled: false,
                        status: '',
                        statusTip: '',
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
                    oldExpirationArr.push(item.expirationDisplay)
                    editRows.listen(item)
                })

                editForm.listen()
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
                    <doubleStreamRecSwitch>${formData.value.doubleStreamRecSwitch}</doubleStreamRecSwitch>
                    <loopRecSwitch>${formData.value.loopRecSwitch}</loopRecSwitch>
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

        const setChlRecData = async () => {
            const rows = editRows.toArray()
            const sendXml = rawXml`
                <content type='list' total='${rows.length}'>
                    ${rows
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
            let result: XMLDocument | Element | undefined

            if (editRows.size() || !editForm.disabled.value) {
                result = await setDevRecData()
            }

            if (editRows.size()) {
                result = await setChlRecData()
            }

            if (result) {
                commSaveResponseHandler(result)
                pageData.value.originalDoubleStreamSwitch = formData.value.doubleStreamRecSwitch
                editForm.update()
                editRows.toArray().forEach((item) => {
                    editRows.remove(item)
                })
            }
        }

        const setData = () => {
            openLoading()

            if (pageData.value.originalDoubleStreamSwitch !== formData.value.doubleStreamRecSwitch) {
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
            formData,
            editRows,
            editForm,
        }
    },
})
