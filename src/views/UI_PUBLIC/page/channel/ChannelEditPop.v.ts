/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:18:09
 * @Description: 通道编辑 弹窗
 */
import { type FormRules, type FormInstance } from 'element-plus'
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
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
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

        const getData = () => {
            const data = rawXml`
                <condition>
                    <id>${props.rowData.id}</id>
                </condition>
            `
            openLoading()
            queryDev(data).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    editItem.value = new ChannelInfoDto()
                    editItem.value.name = $('//content/name').text()
                    editItem.value.port = $('//content/port').text().num()
                    // editItem.value.manufacturer = res('//content/manufacturer').text()
                    const filterPropertyList = filterProperty(props.protocolList, 'index')
                    const factoryName = $('//content/productModel').attr('factoryName')
                    const manufacturer = $('//content/manufacturer').text()
                    if (factoryName) {
                        editItem.value.manufacturer = factoryName
                    } else if (manufacturer.indexOf('RTSP') !== -1) {
                        editItem.value.manufacturer = props.protocolList[filterPropertyList.indexOf(manufacturer.slice(5))].displayName
                    } else {
                        editItem.value.manufacturer = props.manufacturerMap[manufacturer]
                    }
                    editItem.value.productModel.innerText = $('//content/productModel').text()
                    editItem.value.userName = $('//content/userName').text()

                    if (!$('//content/ip').length || !$('//content/ip').text()) {
                        isAnolog.value = true
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    } else {
                        const ipdomain = $('//content/ip').text()
                        isIp = checkIpV4(ipdomain)
                        isIpv6 = checkIpV6(ipdomain)
                        isDomain = !isIp && !isIpv6

                        if ($('//content/protocolType').text() === 'RTSP') {
                            portDisabled.value = true
                            editItem.value.port = 0
                        }

                        if (isIp) {
                            ipTitle.value = 'IPV4'
                            showIpInput.value = true
                        } else if (isIpv6) {
                            ipTitle.value = 'IPV6'
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

                    if (props.rowData.isOnline) {
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    }
                } else {
                    let errorInfo = Translate('IDCS_QUERY_DATA_FAIL')
                    const isNotExit = $('errorCode').text().num() === ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR
                    if (isNotExit) errorInfo = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL'))
                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    }).then(() => {
                        emit('close', true)
                        // if (isNotExit) {
                        //     emit('close', true)
                        // } else {
                        //     emit('close', true)
                        // }
                    })
                }
            })
        }

        const rules = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        value = value.trim()
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (!checkChlName(value.replace(' ', ''))) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                            })
                            return
                        }

                        if (!notCheckNameFlag && checkIsNameExit(value, props.rowData.id)) {
                            openMessageBox({
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
                    trigger: 'manual',
                },
            ],
            ip: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!isAnolog.value) {
                            value = value.trim()
                            if (isIp && (!value.length || !checkIpV4(value))) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                                return
                            }

                            if (isIp && !checkIpV4(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                                return
                            }

                            if (isDomain && !value.length) {
                                callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                                return
                            }

                            if (isIpv6 && !value.length) {
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
                    trigger: 'manual',
                },
            ],
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!isAnolog.value) {
                            value = value.trim()
                            if (props.rowData.protocolType !== 'RTSP' && !value.length) {
                                callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const save = (notCheckName: boolean) => {
            notCheckNameFlag = notCheckName
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    const sendXml = rawXml`
                        <content>
                            <id>${props.rowData.id}</id>
                            <manufacturer type="manufacturer">${editItem.value.manufacturer}</manufacturer>
                            <name>${wrapCDATA(editItem.value.name.trim())}</name>
                            ${ternary(!isAnolog.value && !portDisabled.value, `<ip>${isIp || isIpv6 ? editItem.value.ip : ''}</ip>`)}
                            ${ternary(!isAnolog.value && !portDisabled.value && isDomain, `<domain>${wrapCDATA(editItem.value.ip)}</domain>`)}
                            ${ternary(!isAnolog.value && !portDisabled.value, `<port>${editItem.value.port}</port>`)}
                            ${ternary(!isAnolog.value && editPwdSwitch.value, `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(editItem.value.password, userSessionStore.sesionKey))}`)}
                            ${ternary(!isAnolog.value, `<userName>${editItem.value.userName}</userName>`)}
                        </content>
                    `
                    editDev(sendXml).then((res) => {
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            emit('updateNameMapping', props.rowData.id, editItem.value.name)
                            openMessageBox({
                                type: 'success',
                                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                            }).then(() => {
                                if (editItem.value.ip === '0.0.0.0') {
                                    editItem.value.ip = ''
                                }
                                emit('setDataCallBack', editItem.value)
                                emit('close', true)
                            })
                        } else {
                            const errorCode = $('errorCode').text().num()
                            let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                            if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                                errorInfo = Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')
                            } else if (errorCode === ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL')),
                                }).then(() => {
                                    emit('close', true)
                                })
                                return
                            } else if (errorCode === ErrorCode.USER_ERROR_NODE_ID_EXISTS) {
                                errorInfo = Translate('IDCS_PROMPT_CHANNEL_EXIST')
                            } else if (errorCode === ErrorCode.USER_ERROR_INVALID_IP) {
                                errorInfo = Translate('IDCS_PROMPT_CHANNEL_EXIST')
                            }
                            openMessageBox({
                                type: 'info',
                                message: errorInfo,
                            })
                        }
                    })
                }
            })
        }

        // 检测名字是否已经存在
        const checkIsNameExit = (name: string, currId: string) => {
            return Object.entries(props.nameMapping).some((item) => item[0] !== currId && item[1] === name)
        }

        const opened = () => {
            if (formRef.value) formRef.value.resetFields()
            ipTitle.value = 'IPV4'
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
            formatInputMaxLength,
        }
    },
})
