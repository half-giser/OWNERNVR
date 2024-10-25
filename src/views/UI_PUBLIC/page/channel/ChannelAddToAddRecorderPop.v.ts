/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:39:11
 * @Description: 添加通道 - 添加录像机通道弹窗
 */
import { type ChannelAddRecorderDto, type DefaultPwdDto, QueryNodeListDto, RecorderAddDto, RecorderDto } from '@/types/apiType/channel'
import { type TableInstance, type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        editItem: {
            type: Object as PropType<ChannelAddRecorderDto>,
            required: true,
        },
        mapping: {
            type: Object as PropType<Record<string, DefaultPwdDto>>,
            required: true,
        },
        chlCountLimit: {
            type: Number,
            default: 128,
        },
        faceMatchLimitMaxChlNum: {
            type: Number,
            default: 0,
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
        const { openLoading, closeLoading } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const router = useRouter()
        const formRef = ref<FormInstance>()
        const formData = ref(new RecorderAddDto())
        const tableRef = ref<TableInstance>()
        const selNum = ref(0)
        const disabled = ref(true)
        const eleUserNameDisabled = ref(true)
        const eleChlCountDisabled = ref(true)
        const eleBtnTestDisabled = ref(true)

        const DEFAULT_RECORDER_IP = '0.0.0.0'
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

        const handleRowClick = (rowData: RecorderDto) => {
            tableRef.value!.clearSelection()
            tableRef.value!.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value!.getSelectionRows().length
        }

        const getData = (showSuccessTip?: boolean) => {
            openLoading()
            if ((props.mapping as Record<string, DefaultPwdDto>).RECORDER) {
                const data = rawXml`
                    <condition>
                        ${formData.value.chkDomain ? `<domain>${formData.value.domain}</domain>` : `<ip>${formData.value.ip}</ip>`}
                        <port>${formData.value.servePort.toString()}</port>
                        <version>${props.editItem.version || ''}</version>
                        <httpPort>${formData.value.httpPort.toString()}</httpPort>
                        <userName>${formData.value.userName}</userName>
                        ${formData.value.useDefaultPwd ? '' : '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(formData.value.password, userSessionStore.sesionKey) + ']]></password>'}
                    </condition>
                `
                queryRecorder(data).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() == 'success') {
                        if (showSuccessTip) {
                            openMessageTipBox({
                                type: 'success',
                                message: Translate('IDCS_TEST_SUCCESS'),
                            })
                        }
                        formData.value.ip = $('//content/ip').text() || DEFAULT_RECORDER_IP
                        formData.value.chkDomain = !!$('//content/ip').text()
                        if ($('//content/domain').text()) {
                            const isIp = checkIpV4($('//content/domain').text())
                            if (isIp) formData.value.ip = $('//content/domain').text()
                            formData.value.chkDomain = !isIp
                            formData.value.domain = isIp ? '' : $('//content/domain').text()
                        }
                        formData.value.servePort = Number($('//content/port').text())
                        const chlCount = Number($('//content/chlList').attr('total')!)
                        if (chlCount > 0) {
                            formData.value.channelCount = chlCount
                        } else {
                            eleChlCountDisabled.value = false
                        }
                        const productModel = $('//content/productModel').text() || props.editItem.productModel
                        formData.value.recorderList = []
                        $('//content/chlList/item').forEach((ele) => {
                            const eleXml = queryXml(ele.element)
                            const newData = new RecorderDto()
                            newData.index = ele.attr('index')!
                            newData.name = eleXml('name').text()
                            newData.isAdded = eleXml('isAdded').text() == 'true'
                            newData.bandWidth = eleXml('bandWidth').text()
                            newData.productModel = productModel
                            formData.value.recorderList.push(newData)
                        })
                        formData.value.recorderList.sort((a: RecorderDto, b: RecorderDto) => {
                            return Number(a.index) - Number(b.index)
                        })
                    } else {
                        const errorCode = Number($('errorCode').text())
                        openMessageTipBox({
                            type: 'info',
                            message: errorMap[errorCode] || Translate('IDCS_LOGIN_OVERTIME'),
                        }).then(() => {
                            formData.value.recorderList = []
                            const chlCount = formData.value.channelCount
                            for (let i = 0; i < Number(chlCount); i++) {
                                const newData = new RecorderDto()
                                newData.index = String(i + 1)
                                newData.productModel = props.editItem.productModel
                                formData.value.recorderList.push(newData)
                            }
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
                    validator: (_rule, _value, callback) => {
                        if (formData.value.chkDomain) {
                            const domain = formData.value.domain.trim()
                            if (!domain.length) {
                                callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                                return
                            }
                        } else {
                            const ip = formData.value.ip.trim()
                            if (!ip || ip == '0.0.0.0') {
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
            formData.value.recorderList = []
            for (let i = 0; i < chlCount; i++) {
                const newData = new RecorderDto()
                newData.index = String(i + 1)
                formData.value.recorderList.push(newData)
            }
        }

        const getTestData = () => {
            const sendXml = rawXml`
                <content>
                    ${ternary(formData.value.chkDomain, `<domain>${wrapCDATA(formData.value.domain)}</domain>`, `<ip>${formData.value.ip}</ip>`)}
                    <port>${formData.value.servePort ? formData.value.servePort.toString() : ''}</port>
                    <userName>${formData.value.userName}</userName>
                    ${ternary(!props.editItem.ip || (props.editItem.ip && !formData.value.useDefaultPwd), `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`)}
                </content>
            `
            return sendXml
        }

        const test = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    openLoading()
                    testRecorder(getTestData()).then((res) => {
                        closeLoading()
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            getData(true)
                        } else {
                            const errorCode = Number($('errorCode').text())
                            openMessageTipBox({
                                type: 'info',
                                message: errorMap[errorCode] || Translate('IDCS_LOGIN_OVERTIME'),
                            }).then(() => {
                                loadNoRecoderData(Number(formData.value.channelCount))
                            })
                        }
                    })
                }
            })
        }

        const save = () => {
            if (tableRef.value!.getSelectionRows().length === 0) return
            setData()
        }

        const setData = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    getChlList(new QueryNodeListDto()).then((res) => {
                        closeLoading()
                        commLoadResponseHandler(res, () => {
                            const $ = queryXml(res)
                            const addedChlNum = $('//content/item').length
                            if (addedChlNum + tableRef.value!.getSelectionRows().length > props.chlCountLimit) {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                                })
                                return
                            }
                            openLoading()
                            createDevList(getSaveData()).then((res) => {
                                closeLoading()
                                const $ = queryXml(res)
                                if ($('status').text() === 'success') {
                                    openMessageTipBox({
                                        type: 'success',
                                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                    }).then(() => {
                                        router.push('list')
                                    })
                                } else {
                                    const errorCdoe = Number($('errorCode').text())
                                    if (errorCdoe == ErrorCode.USER_ERROR_NODE_ID_EXISTS) {
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_CAMERA_EXISTED'),
                                        })
                                    } else if (errorCdoe === ErrorCode.USER_ERROR_OVER_LIMIT) {
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                                        }).then(() => {
                                            emit('close')
                                        })
                                    } else if (errorCdoe === ErrorCode.USER_ERROR_OVER_BANDWIDTH_LIMIT) {
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'),
                                        })
                                    } else if (errorCdoe === ErrorCode.USER_ERROR_SPECIAL_CHAR) {
                                        const poePort = $('poePort').text()
                                        // POE连接冲突提示
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang(poePort),
                                        })
                                    } else if (errorCdoe === ErrorCode.USER_ERROR_LIMITED_PLATFORM_TYPE_MISMATCH) {
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(props.faceMatchLimitMaxChlNum),
                                        })
                                    } else if (errorCdoe === ErrorCode.USER_ERROR_PC_LICENSE_MISMATCH) {
                                        const msg =
                                            Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(props.faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD'))
                                        openMessageTipBox({
                                            type: 'question',
                                            message: msg,
                                        }).then(() => {
                                            editBasicCfg(`<content><AISwitch>false</AISwitch></content>`)
                                        })
                                    } else {
                                        openMessageTipBox({
                                            type: 'info',
                                            message: Translate('IDCS_SAVE_DATA_FAIL'),
                                        })
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
            const selection = tableRef.value!.getSelectionRows() as RecorderDto[]

            const listXml = selection.map((ele) => {
                return rawXml`
                    <item>
                        <name>${ele.name || defalutNamePrefix + ele.index}</name>
                        ${ternary(formData.value.chkDomain, `<domain>${wrapCDATA(formData.value.domain)}</domain>`, `<ip>${formData.value.ip}</ip>`)}
                        <port>${formData.value.servePort.toString()}</port>
                        <userName>${formData.value.userName}</userName>
                        ${ternary(!props.editItem.ip || (props.editItem.ip && !formData.value.useDefaultPwd), `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`)}
                        <index>${(Number(ele.index) - 1).toString()}</index>
                        <manufacturer>RECORDER</manufacturer>
                        <protocolType>RECORDER</protocolType>
                        <productModel factoryName='Customer'>${ele.productModel}</productModel>
                        ${ternary(ele.bandWidth, `<bandWidth>${ele.bandWidth}</bandWidth>`)}
                        <rec per='5' post='10'/>
                        <snapSwitch>false</snapSwitch>
                        <buzzerSwitch>false</buzzerSwitch>
                        <popVideoSwitch>false</popVideoSwitch>
                        <frontEndOffline_popMsgSwitch>true</frontEndOffline_popMsgSwitch>
                    </item>
                `
            })

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
                    ${listXml.join('')}
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
            formData.value = new RecorderAddDto()
            formData.value.userName = (props.mapping as Record<string, DefaultPwdDto>).RECORDER.userName
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
                loadNoRecoderData(Number(formData.value.channelCount))
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
