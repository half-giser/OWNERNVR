/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:18:09
 * @Description: 通道编辑 弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        rowData: {
            type: Object as PropType<ChannelInfoDto>,
            required: true,
        },
        protocolList: {
            type: Array as PropType<ChannelRTSPPropertyDto[]>,
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
        close(isRefresh = false) {
            return typeof isRefresh === 'boolean'
        },
        confirm(item: ChannelInfoDto) {
            return !!item
        },
    },
    setup(props, { emit }) {
        const userSessionStore = useUserSessionStore()
        const { Translate } = useLangStore()

        const formRef = useFormRef()
        const ipTitle = ref('')
        const showIpInput = ref(true)
        const ipPlaceholder = ref('')
        const formData = ref(new ChannelInfoDto())
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
                    formData.value.name = $('content/name').text()
                    formData.value.port = $('content/port').text().num()
                    const filterPropertyList = props.protocolList.map((item) => item.index)
                    const factoryName = $('content/productModel').attr('factoryName')
                    const manufacturer = $('content/manufacturer').text()
                    if (factoryName) {
                        formData.value.manufacturer = factoryName
                    } else if (manufacturer.indexOf('RTSP') !== -1) {
                        formData.value.manufacturer = props.protocolList[filterPropertyList.indexOf(manufacturer.slice(5))].displayName
                    } else {
                        formData.value.manufacturer = props.manufacturerMap[manufacturer]
                    }
                    formData.value.productModel.innerText = $('content/productModel').text()
                    formData.value.userName = $('content/userName').text()

                    if (!$('content/ip').text()) {
                        isAnolog.value = true
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    } else {
                        const ipdomain = $('content/ip').text()
                        isIp = checkIpV4(ipdomain)
                        isIpv6 = checkIpV6(ipdomain)
                        isDomain = !isIp && !isIpv6

                        if ($('content/protocolType').text() === 'RTSP') {
                            portDisabled.value = true
                            formData.value.port = 0
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
                        formData.value.ip = ipdomain

                        if ($('content/addType').text() === 'poe') {
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
                    openMessageBox(errorInfo).finally(() => {
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
                            openMessageBox(Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'))
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
            formRef.value!.validate((valid) => {
                if (valid) {
                    const sendXml = rawXml`
                        <content>
                            <id>${props.rowData.id}</id>
                            <manufacturer type="manufacturer">${formData.value.manufacturer}</manufacturer>
                            <name>${wrapCDATA(formData.value.name.trim())}</name>
                            ${!isAnolog.value && !portDisabled.value ? `<ip>${isIp || isIpv6 ? formData.value.ip : ''}</ip>` : ''}
                            ${!isAnolog.value && !portDisabled.value && isDomain ? `<domain>${wrapCDATA(formData.value.ip)}</domain>` : ''}
                            ${!isAnolog.value && !portDisabled.value ? `<port>${formData.value.port}</port>` : ''}
                            ${!isAnolog.value && editPwdSwitch.value ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>` : ''}
                            ${!isAnolog.value ? `<userName>${formData.value.userName}</userName>` : ''}
                        </content>
                    `
                    editDev(sendXml).then((res) => {
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            openMessageBox({
                                type: 'success',
                                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                            }).then(() => {
                                if (formData.value.ip === DEFAULT_EMPTY_IP) {
                                    formData.value.ip = ''
                                }
                                formData.value.password = ''
                                emit('confirm', formData.value)
                                emit('close', true)
                            })
                        } else {
                            const errorCode = $('errorCode').text().num()
                            let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                            switch (errorCode) {
                                case ErrorCode.USER_ERROR_NAME_EXISTED:
                                    errorInfo = Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')
                                    break
                                case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                                    openMessageBox(Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL'))).then(() => {
                                        emit('close', true)
                                    })
                                    return
                                case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                                    errorInfo = Translate('IDCS_PROMPT_CHANNEL_EXIST')
                                    break
                                case ErrorCode.USER_ERROR_INVALID_IP:
                                    errorInfo = Translate('IDCS_PROMPT_CHANNEL_EXIST')
                                    break
                            }

                            openMessageBox(errorInfo)
                        }
                    })
                }
            })
        }

        // 检测名字是否已经存在
        const checkIsNameExit = (name: string, currId: string) => {
            return Object.entries(props.nameMapping).some((item) => item[0] !== currId && item[1] === name)
        }

        const open = () => {
            ipTitle.value = 'IPV4'
            showIpInput.value = true
            ipPlaceholder.value = ''
            editPwdSwitch.value = false
            isAnolog.value = false
            inputDisabled.value = false
            ipDisabled.value = false
            portDisabled.value = false
            notCheckNameFlag = false
            formData.value = new ChannelInfoDto()
            getData()
        }

        return {
            formRef,
            rules,
            ipTitle,
            showIpInput,
            ipPlaceholder,
            editPwdSwitch,
            formData,
            inputDisabled,
            ipDisabled,
            portDisabled,
            open,
            save,
        }
    },
})
