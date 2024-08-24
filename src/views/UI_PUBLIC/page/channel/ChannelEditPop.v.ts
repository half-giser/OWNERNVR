/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:18:09
 * @Description:
 */
import { type FormInstance } from 'element-plus'
import { type RuleItem } from 'async-validator'
import { ChannelInfoDto } from '@/types/apiType/channel'

export default defineComponent({
    props: {
        rowData: {
            type: Object as PropType<ChannelInfoDto>,
            required: true,
        },
        protocolList: {
            type: Array as PropType<Record<string, string>[]>,
            required: true,
        },
        manufacturerMap: {
            type: Object as PropType<Record<string, string>>,
            default: () => ({}),
        },
        nameMapping: {
            type: Object as PropType<Record<string, string>>,
            default: () => ({}),
        },
    },
    emits: {
        updateNameMapping(id: string, name: string) {
            return typeof id === 'string' && typeof name === 'string'
        },
        close(isRefresh = false) {
            return typeof isRefresh === 'boolean'
        },
        setDataCallBack(item: ChannelInfoDto) {
            return !!item
        },
    },
    setup(props, { emit }) {
        const userSessionStore = useUserSessionStore()
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const ipTitle = ref('')
        const showIpInput = ref(true)
        const ipPlaceholder = ref('')
        const editItem = ref(new ChannelInfoDto())
        const editPwdSwitch = ref(false)
        const isAnolog = ref(false)
        const inputDisabled = ref(false)
        const ipDisabled = ref(false)
        const portDisabled = ref(false)
        let isIp = false
        let isIpv6 = false
        let isDomain = false
        let notCheckNameFlag = false

        const getData = function () {
            const data = getXmlWrapData(`<condition><id>${props.rowData.id}</id></condition>`)
            openLoading(LoadingTarget.FullScreen)
            queryDev(data).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    editItem.value = new ChannelInfoDto()
                    editItem.value.name = $('//content/name').text()
                    editItem.value.port = $('//content/port').text()
                    // editItem.value.manufacturer = res('//content/manufacturer').text()
                    const filterPropertyList = filterProperty(props.protocolList, 'index')
                    const factoryName = $('//content/productModel').attr('factoryName')!
                    const manufacturer = $('//content/manufacturer').text()
                    if (factoryName) {
                        editItem.value.manufacturer = factoryName
                    } else if (manufacturer.indexOf('RTSP') != -1) {
                        editItem.value.manufacturer = props.protocolList[filterPropertyList.indexOf(manufacturer.slice(5))]['displayName']
                    } else {
                        editItem.value.manufacturer = props.manufacturerMap[manufacturer]
                    }
                    editItem.value.productModel.innerText = $('//content/productModel').text()
                    editItem.value.userName = $('//content/userName').text()

                    if ($('//content/ip').length == 0 || $('//content/ip').text() == '') {
                        isAnolog.value = true
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    } else {
                        const ipdomain = $('//content/ip').text()
                        isIp = checkIpV4(ipdomain)
                        isIpv6 = checkIpV6(ipdomain)
                        isDomain = !isIp && !isIpv6

                        if ($('//content/protocolType').text() == 'RTSP') {
                            portDisabled.value = true
                            editItem.value.port = ''
                        }

                        if (isIp) {
                            ipTitle.value = Translate('IPV4')
                            showIpInput.value = true
                        } else if (isIpv6) {
                            ipTitle.value = Translate('IPV6')
                            ipPlaceholder.value = Translate('IDCS_INPUT_IPV6_ADDRESS_TIP')
                            showIpInput.value = false
                        } else {
                            ipTitle.value = Translate('IDCS_DOMAIN')
                            ipPlaceholder.value = Translate('IDCS_DOMAIN_TIP')
                            showIpInput.value = false
                        }
                        editItem.value.ip = ipdomain

                        if ($('//content/addType').text() === 'poe') {
                            ipDisabled.value = true
                            portDisabled.value = true
                        }
                    }

                    if (props.rowData.chlStatus == Translate('IDCS_ONLINE')) {
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    }
                } else {
                    let errorInfo = Translate('IDCS_QUERY_DATA_FAIL')
                    const isNotExit = Number($('errorCode').text()) === errorCodeMap.resourceNotExist
                    if (isNotExit) errorInfo = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL'))
                    openMessageTipBox({
                        type: 'info',
                        message: errorInfo,
                        showCancelButton: false,
                    }).then(() => {
                        if (isNotExit) {
                            emit('close', true)
                        } else {
                            emit('close')
                        }
                    })
                }
            })
        }

        const validate: Record<string, RuleItem['validator']> = {
            validateName: (_rule, value, callback) => {
                value = value.trim()
                if (value.length === 0) {
                    callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                    return
                } else {
                    editItem.value.name = value = cutStringByByte(value, nameByteMaxLen)
                    // 应该不可能发生此情况
                    if (value == 0) {
                        callback(new Error(Translate('IDCS_INVALID_CHAR')))
                        return
                    }
                }
                if (!checkChlName(value.replace(' ', ''))) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                    })
                    return
                }
                if (!notCheckNameFlag && checkIsNameExit(value, props.rowData.id)) {
                    openMessageTipBox({
                        type: 'question',
                        message: Translate('IDCS_NAME_EXISTED'),
                        confirmButtonText: Translate('IDCS_KEEP'),
                        cancelButtonText: Translate('IDCS_EDIT'),
                    }).then(() => {
                        save(true)
                    })
                    return
                }
                callback()
            },
            validateIp: (_rule, value, callback) => {
                if (!isAnolog.value) {
                    value = value.trim()
                    if (isIp && (value.length == 0 || !checkIpV4(value))) {
                        callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                        return
                    }
                    if (isIp && !checkIpV4(value)) {
                        callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                        return
                    }
                    if (isDomain && value.length == 0) {
                        callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                        return
                    }
                    if (isIpv6 && value.length == 0) {
                        callback(new Error(Translate('IDCS_PROMPT_IPV6_ADDRESS_EMPTY')))
                        return
                    }
                    if (isIpv6 && !checkIpV6(value)) {
                        callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID')))
                        return
                    }
                }
                callback()
            },
            validateUserName: (_rule, value, callback) => {
                if (!isAnolog.value) {
                    value = value.trim()
                    if (props.rowData.protocolType != 'RTSP' && value.length == 0) {
                        callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                        return
                    }
                }
                callback()
            },
        }
        const rules = ref({
            name: [{ validator: validate.validateName, trigger: 'manual' }],
            ip: [{ validator: validate.validateIp, trigger: 'manual' }],
            userName: [{ validator: validate.validateUserName, trigger: 'manual' }],
        })

        const save = function (notCheckName: boolean) {
            notCheckNameFlag = notCheckName
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    let data =
                        '<content>' +
                        '<id>' +
                        props.rowData.id +
                        '</id>' +
                        '<manufacturer type="manufacturer">' +
                        editItem.value.manufacturer +
                        '</manufacturer>' +
                        '<name><![CDATA[' +
                        editItem.value.name.trim() +
                        ']]></name>'
                    if (!isAnolog.value) {
                        if (!portDisabled.value) {
                            data +=
                                '<ip>' +
                                (isIp || isIpv6 ? editItem.value.ip : '') +
                                '</ip>' +
                                (isDomain ? '<domain><![CDATA[' + editItem.value.ip + ']]></domain>' : '') +
                                '<port>' +
                                editItem.value.port +
                                '</port>'
                        }
                        const psdXml = '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(editItem.value.password, userSessionStore.sesionKey) + ']]></password>'
                        data += '<userName>' + editItem.value.userName + '</userName>' + (editPwdSwitch.value ? psdXml : '')
                    }
                    data += '</content>'
                    editDev(getXmlWrapData(data)).then((res) => {
                        const $ = queryXml(res)
                        if ($('status').text() == 'success') {
                            emit('updateNameMapping', props.rowData.id, editItem.value.name)
                            openMessageTipBox({
                                type: 'success',
                                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                            }).then(() => {
                                if (editItem.value.ip == '0.0.0.0') {
                                    editItem.value.ip = ''
                                }
                                emit('setDataCallBack', editItem.value)
                                emit('close')
                            })
                        } else {
                            const errorCode = Number($('errorCode').text())
                            if (errorCode === errorCodeMap.nameExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST'),
                                })
                            } else if (errorCode === errorCodeMap.resourceNotExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL')),
                                }).then(() => {
                                    emit('close', true)
                                })
                            } else if (errorCode === errorCodeMap.nodeExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_CHANNEL_EXIST'),
                                })
                            } else if (errorCode === errorCodeMap.ipError) {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_ERROR_IP_ROUTE_INVALID'),
                                })
                            } else {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                                })
                            }
                        }
                    })
                }
            })
        }

        // 检测名字是否已经存在
        const checkIsNameExit = function (name: string, currId: string) {
            let isSameName = false
            for (const key in props.nameMapping) {
                if (key != currId) {
                    if (name == props.nameMapping[key]) {
                        isSameName = true
                        break
                    }
                }
            }
            return isSameName
        }

        const opened = function () {
            if (formRef.value) formRef.value.resetFields()
            ipTitle.value = Translate('IPV4')
            showIpInput.value = true
            ipPlaceholder.value = ''
            editPwdSwitch.value = false
            isAnolog.value = false
            inputDisabled.value = false
            ipDisabled.value = false
            portDisabled.value = false
            notCheckNameFlag = false
            getData()
        }

        return {
            formRef,
            rules,
            ipTitle,
            showIpInput,
            ipPlaceholder,
            editPwdSwitch,
            editItem,
            inputDisabled,
            ipDisabled,
            portDisabled,
            opened,
            save,
        }
    },
})
