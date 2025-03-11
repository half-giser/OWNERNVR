/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:39:11
 * @Description: 添加通道 - 添加录像机通道弹窗
 */
import { type TableInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelAddRecorderDto>,
            required: true,
        },
        mapping: {
            type: Object as PropType<Record<string, ChannelDefaultPwdDto>>,
            required: true,
        },
    },
    emits: {
        callBack() {
            return true
        },
        close() {
            return true
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()
        const userSessionStore = useUserSessionStore()
        const systemCaps = useCababilityStore()
        const router = useRouter()
        const formRef = useFormRef()
        const formData = ref(new ChannelRecorderAddDto())
        const tableRef = ref<TableInstance>()
        const selNum = ref(0)
        const disabled = ref(true)
        const eleUserNameDisabled = ref(true)
        const eleChlCountDisabled = ref(true)
        const eleBtnTestDisabled = ref(true)

        const DEFAULT_RECORDER_IP = DEFAULT_EMPTY_IP
        const DEFAULT_RECORDER_SERVER_PORT = 6036
        const DEFAULT_RECORDER_HTTP_PORT = 80
        const DEFAULT_RECORDER_CHANNEL_COUNT = 8

        const errorMap: Record<number, string> = {
            [ErrorCode.USER_ERROR_NO_USER]: Translate('IDCS_DEVICE_PWD_ERROR'),
            [ErrorCode.USER_ERROR_PWD_ERR]: Translate('IDCS_DEVICE_PWD_ERROR'),
            [ErrorCode.USER_ERROR_USER_LOCKED]: Translate('IDCS_REMOTE_USER_LOCKED'),
            [ErrorCode.USER_ERROR_NO_AUTH]: Translate('IDCS_NO_PERMISSION'),
            [ErrorCode.USER_ERROR_CHECK_FILE_ERROR]: Translate('IDCS_RECORDER_HTTPPORT_ERR'),
        }

        const handleRowClick = (rowData: ChannelRecorderDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value!.getSelectionRows().length
        }

        const getData = (showSuccessTip?: boolean) => {
            openLoading()
            if ((props.mapping as Record<string, ChannelDefaultPwdDto>).RECORDER) {
                const data = rawXml`
                    <condition>
                        ${formData.value.chkDomain ? `<domain>${formData.value.domain}</domain>` : `<ip>${formData.value.ip}</ip>`}
                        <port>${formData.value.servePort}</port>
                        <version>${props.editItem.version || ''}</version>
                        <httpPort>${formData.value.httpPort}</httpPort>
                        <userName>${formData.value.userName}</userName>
                        ${formData.value.useDefaultPwd ? '' : `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>`}
                    </condition>
                `
                queryRecorder(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        if (showSuccessTip) {
                            openMessageBox({
                                type: 'success',
                                message: Translate('IDCS_TEST_SUCCESS'),
                            })
                        }

                        formData.value.ip = $('content/ip').text() || DEFAULT_RECORDER_IP
                        formData.value.chkDomain = !$('content/ip').text()
                        if ($('content/domain').text()) {
                            const domain = $('content/domain').text()
                            const isIp = checkIpV4(domain)
                            formData.value.chkDomain = !isIp
                            formData.value.ip = isIp ? domain : formData.value.ip
                            formData.value.domain = isIp ? '' : domain
                        }
                        formData.value.servePort = $('content/port').text().num()

                        const chlCount = $('content/chlList').attr('total').num()
                        if (chlCount > 0) {
                            formData.value.channelCount = chlCount
                        } else {
                            eleChlCountDisabled.value = false
                        }

                        const productModel = $('content/productModel').text() || props.editItem.productModel
                        formData.value.recorderList = $('content/chlList/item').map((ele) => {
                            const $item = queryXml(ele.element)
                            const newData = new ChannelRecorderDto()
                            newData.index = ele.attr('index').num()
                            newData.name = $item('name').text()
                            newData.isAdded = $item('isAdded').text().bool()
                            newData.bandWidth = $item('bandWidth').text()
                            newData.productModel = productModel
                            return newData
                        })
                        formData.value.recorderList.sort((a, b) => {
                            return a.index - b.index
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        openMessageBox(errorMap[errorCode] || Translate('IDCS_LOGIN_OVERTIME')).then(() => {
                            const chlCount = formData.value.channelCount
                            formData.value.recorderList = Array(chlCount)
                                .fill(0)
                                .map((_, index) => {
                                    const item = new ChannelRecorderDto()
                                    item.index = index + 1
                                    item.productModel = props.editItem.productModel
                                    return item
                                })
                            eleUserNameDisabled.value = false
                            eleBtnTestDisabled.value = false
                            eleChlCountDisabled.value = false
                        })
                    }
                })
            }
        }

        const rules = ref<FormRules>({
            ip: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.chkDomain) {
                            const domain = formData.value.domain.trim()
                            if (!domain.length) {
                                callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                                return
                            }
                        } else {
                            const ip = value.trim()
                            if (!ip || ip === DEFAULT_EMPTY_IP) {
                                callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const loadNoRecoderData = (chlCount: number) => {
            formData.value.recorderList = Array(chlCount)
                .fill(0)
                .map((_, index) => {
                    const item = new ChannelRecorderDto()
                    item.index = index + 1
                    return item
                })
        }

        const getTestData = () => {
            const sendXml = rawXml`
                <content>
                    ${formData.value.chkDomain ? `<domain>${wrapCDATA(formData.value.domain)}</domain>` : `<ip>${formData.value.ip}</ip>`}
                    <port>${formData.value.servePort ? formData.value.servePort : ''}</port>
                    <userName>${formData.value.userName}</userName>
                    ${!props.editItem.ip || (props.editItem.ip && !formData.value.useDefaultPwd) ? `<password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>` : ''}
                </content>
            `
            return sendXml
        }

        const test = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    openLoading()
                    testRecorder(getTestData()).then((res) => {
                        closeLoading()
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            getData(true)
                        } else {
                            const errorCode = $('errorCode').text().num()
                            openMessageBox(errorMap[errorCode] || Translate('IDCS_LOGIN_OVERTIME')).then(() => {
                                loadNoRecoderData(formData.value.channelCount)
                            })
                        }
                    })
                }
            })
        }

        const save = () => {
            if (!tableRef.value!.getSelectionRows().length) return
            setData()
        }

        const setData = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    getChlList().then((res) => {
                        closeLoading()
                        commLoadResponseHandler(res, () => {
                            const $ = queryXml(res)
                            const addedChlNum = $('content/item').length
                            if (addedChlNum + tableRef.value!.getSelectionRows().length > systemCaps.chlMaxCount) {
                                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                                return
                            }
                            openLoading()
                            createDevList(getSaveData()).then((res) => {
                                closeLoading()
                                const $ = queryXml(res)
                                if ($('status').text() === 'success') {
                                    openMessageBox({
                                        type: 'success',
                                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                    }).then(() => {
                                        router.push('list')
                                    })
                                } else {
                                    const errorCdoe = $('errorCode').text().num()
                                    switch (errorCdoe) {
                                        case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_CAMERA_EXISTED'))
                                            break
                                        case ErrorCode.USER_ERROR_OVER_LIMIT:
                                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT')).then(() => {
                                                emit('close')
                                            })
                                            break
                                        case ErrorCode.USER_ERROR_OVER_BANDWIDTH_LIMIT:
                                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'))
                                            break
                                        case ErrorCode.USER_ERROR_SPECIAL_CHAR:
                                            // POE连接冲突提示
                                            openMessageBox(Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang($('poePort').text()))
                                            break
                                        case ErrorCode.USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH:
                                            openMessageBox(Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(systemCaps.faceMatchLimitMaxChlNum))
                                            break
                                        case ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH:
                                            openMessageBox({
                                                type: 'question',
                                                message:
                                                    Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(systemCaps.faceMatchLimitMaxChlNum) +
                                                    Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD')),
                                            }).then(() => {
                                                const sendXml = rawXml`
                                                    <content>
                                                        <AISwitch>false</AISwitch>
                                                    </content>
                                                `
                                                editBasicCfg(sendXml)
                                            })
                                            break
                                        default:
                                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                                            break
                                    }
                                }
                            })
                        })
                    })
                }
            })
        }

        const getSaveData = () => {
            const defalutNamePrefix = 'Recorder_'
            const selection = tableRef.value!.getSelectionRows() as ChannelRecorderDto[]

            const sendXml = rawXml`
                <types>
                    <manufacturer>
                        <enum displayName='TVT'>TVT</enum>
                        <enum displayName='ONVIF'>ONVIF</enum>
                        <enum displayName='ONVIF'>HIKVISION</enum>
                        <enum displayName='ONVIF'>DAHUA</enum>
                        <enum displayName='RECORDER'>RECORDER</enum>
                    </manufacturer>
                    <protocolType>
                        <enum>TVT_IPCAMERA</enum>
                        <enum>ONVIF</enum>
                        <enum>RECORDER</enum>
                    </protocolType>
                </types>
                <content type='list'>
                    <itemType>
                        <manufacturer type='manufacturer'/>
                        <protocolType type='protocolType'/>
                        <bandWidth unit='MB'/>
                    </itemType>
                    ${selection
                        .map((ele) => {
                            return rawXml`
                                <item>
                                    <name maxByteLen="63">${wrapCDATA(ele.name || defalutNamePrefix + ele.index)}</name>
                                    ${formData.value.chkDomain ? `<domain>${wrapCDATA(formData.value.domain)}</domain>` : `<ip>${formData.value.ip}</ip>`}
                                    <port>${formData.value.servePort}</port>
                                    <userName>${formData.value.userName}</userName>
                                    ${!props.editItem.ip || (props.editItem.ip && !formData.value.useDefaultPwd) ? `<password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>` : ''}
                                    <index>${ele.index - 1}</index>
                                    <manufacturer>RECORDER</manufacturer>
                                    <protocolType>RECORDER</protocolType>
                                    <productModel factoryName='Customer'>${ele.productModel}</productModel>
                                    ${ele.bandWidth ? `<bandWidth>${ele.bandWidth}</bandWidth>` : ''}
                                    <rec per='5' post='10'/>
                                    <snapSwitch>false</snapSwitch>
                                    <buzzerSwitch>false</buzzerSwitch>
                                    <popVideoSwitch>false</popVideoSwitch>
                                    <frontEndOffline_popMsgSwitch>true</frontEndOffline_popMsgSwitch>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `

            return sendXml
        }

        const opened = () => {
            selNum.value = 0
            disabled.value = true
            eleChlCountDisabled.value = true
            eleUserNameDisabled.value = true
            eleBtnTestDisabled.value = true
            formData.value = new ChannelRecorderAddDto()
            formData.value.userName = (props.mapping as Record<string, ChannelDefaultPwdDto>).RECORDER.userName
            if (props.editItem.ip) {
                formData.value.ip = props.editItem.ip
                formData.value.servePort = props.editItem.port
                formData.value.channelCount = props.editItem.chlTotalCount ? props.editItem.chlTotalCount : DEFAULT_RECORDER_CHANNEL_COUNT
                formData.value.httpPort = props.editItem.httpPort
                formData.value.useDefaultPwd = true
                getData()
            } else {
                formData.value.ip = DEFAULT_RECORDER_IP
                formData.value.servePort = DEFAULT_RECORDER_SERVER_PORT
                formData.value.channelCount = DEFAULT_RECORDER_CHANNEL_COUNT
                formData.value.httpPort = DEFAULT_RECORDER_HTTP_PORT
                formData.value.useDefaultPwd = false
                disabled.value = false
                eleChlCountDisabled.value = false
                eleUserNameDisabled.value = false
                eleBtnTestDisabled.value = false
                loadNoRecoderData(formData.value.channelCount)
            }
        }

        return {
            formRef,
            formData,
            rules,
            tableRef,
            selNum,
            handleRowClick,
            handleSelectionChange,
            test,
            save,
            opened,
            disabled,
            eleChlCountDisabled,
            eleUserNameDisabled,
            eleBtnTestDisabled,
        }
    },
})
