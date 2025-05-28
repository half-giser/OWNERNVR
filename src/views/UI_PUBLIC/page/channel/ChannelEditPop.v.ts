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
        confirm(item: ChannelEditForm) {
            return !!item
        },
    },
    setup(props, { emit }) {
        const userSessionStore = useUserSessionStore()
        const { Translate } = useLangStore()

        const formData = ref(new ChannelEditForm())

        const formRef = useFormRef()
        const editPwdSwitch = ref(false)

        const ipType = ref('IPV4')

        let notCheckNameFlag = false

        const isAnolog = computed(() => {
            return !formData.value.port
        })

        const portDisabled = computed(() => {
            return !formData.value.port || props.rowData.protocolType === 'RSTP' || props.rowData.isOnline || props.rowData.accessType === 'poe' || props.rowData.autoReportID !== ''
        })

        const ipDisabled = computed(() => {
            return !formData.value.ip || props.rowData.addType === 'poe' || props.rowData.isOnline || props.rowData.autoReportID !== ''
        })

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
                    formData.value.nameMaxByteLen = $('content/name').attr('maxByteLen').num() || nameByteMaxLen
                    formData.value.name = $('content/name').text()
                    formData.value.port = $('content/port').text().num()

                    formData.value.chlNum = props.rowData.chlNum

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
                    formData.value.userNameMaxByteLen = $('content/userName').attr('maxByteLen').num() || nameByteMaxLen
                    formData.value.userName = $('content/userName').text()

                    formData.value.autoReportID = $('content/autoReportID').text()
                    formData.value.chlIndex = $('content/chlIndex').text().num() + 1

                    formData.value.ip = $('content/ip').text()

                    if (formData.value.ip) {
                        const ipdomain = $('content/ip').text()
                        const isIp = checkIpV4(ipdomain)
                        const isIpv6 = checkIpV6(ipdomain)

                        if ($('content/protocolType').text() === 'RTSP') {
                            formData.value.port = 0
                        }

                        if (isIp) {
                            ipType.value = 'IPV4'
                        } else if (isIpv6) {
                            ipType.value = 'IPV6'
                        } else {
                            ipType.value = 'domain'
                        }
                    }
                } else {
                    let errorInfo = Translate('IDCS_QUERY_DATA_FAIL')
                    const isNotExit = $('errorCode').text().num() === ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR
                    if (isNotExit) errorInfo = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL'))
                    openMessageBox(errorInfo).finally(() => {
                        emit('close', true)
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
                            openMessageBox(Translate('IDCS_CAN_NOT_CONTAIN_SPECIAL_CHAR').formatForLang(CHANNEL_LIMIT_CHAR))
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
                            if (ipType.value === 'IPV4' && (!value.length || !checkIpV4(value))) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_EMPTY')))
                                return
                            }

                            if (ipType.value === 'IPV4' && !checkIpV4(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                                return
                            }

                            if (ipType.value === 'domain' && !value.length) {
                                callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                                return
                            }

                            if (ipType.value === 'IPV6' && !value.length) {
                                callback(new Error(Translate('IDCS_PROMPT_IPV6_ADDRESS_EMPTY')))
                                return
                            }

                            if (ipType.value === 'IPV6' && !checkIpV6(value)) {
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
                            ${formData.value.autoReportID ? `<autoReportID>${wrapCDATA(formData.value.autoReportID)}</autoReportID>` : ''}
                            ${!isAnolog.value && !portDisabled.value ? `<ip>${ipType.value === 'IPV4' || ipType.value === 'IPV6' ? formData.value.ip : ''}</ip>` : ''}
                            ${!isAnolog.value && !portDisabled.value && ipType.value === 'domain' ? `<domain>${wrapCDATA(formData.value.ip)}</domain>` : ''}
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
                                case ErrorCode.USER_ERROR_INVALID_PARAM:
                                    errorInfo = Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS')
                                    break
                                default:
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
            editPwdSwitch.value = false
            ipType.value = 'IPV4'
            notCheckNameFlag = false
            getData()
        }

        return {
            formRef,
            rules,
            editPwdSwitch,
            formData,
            ipDisabled,
            portDisabled,
            open,
            save,
            ipType,
        }
    },
})
