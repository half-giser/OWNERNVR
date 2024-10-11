/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:39:11
 * @Description: 添加通道 - 添加录像机通道弹窗
 */
import { ChannelAddRecorderDto, type DefaultPwdDto, QueryNodeListDto, RecorderAddDto, RecorderDto } from '@/types/apiType/channel'
import { type TableInstance, type FormInstance } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { type RuleItem } from 'async-validator'

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
        const total = ref(0)
        const eleChkDomainDisabled = ref(true)
        const eleServePortDisabled = ref(true)
        const eleIpDisabled = ref(true)
        const eleUserNameDisabled = ref(true)
        const eleChlCountDisabled = ref(true)
        const eleBtnTestDisabled = ref(true)
        const showDefaultPwdRow = ref(true)

        let editItemBak: ChannelAddRecorderDto | undefined
        const defaultRecorderData = new RecorderAddDto()
        defaultRecorderData.ip = '0.0.0.0'
        defaultRecorderData.servePort = 6036
        defaultRecorderData.httpPort = 80
        defaultRecorderData.channelCount = 8

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
            if ((props.mapping as Record<string, DefaultPwdDto>)['RECORDER']) {
                const data = rawXml`<condition>
                                ${formData.value.chkDomain ? '<domain><![CDATA[' + formData.value.domain + ']]></domain>' : '<ip>' + formData.value.ip + '</ip>'}
                                <port>${formData.value.servePort.toString()}</port>
                                <version>${editItemBak?.version || ''}</version>
                                <httpPort>${formData.value.httpPort.toString()}</httpPort>
                                <userName>${formData.value.userName}</userName>
                                ${formData.value.useDefaultPwd ? '' : '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(formData.value.password, userSessionStore.sesionKey) + ']]></password>'}
                            </condition>`
                queryRecorder(getXmlWrapData(data), undefined, false).then((res) => {
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() == 'success') {
                        if (showSuccessTip) {
                            openMessageTipBox({
                                type: 'success',
                                message: Translate('IDCS_TEST_SUCCESS'),
                            })
                        }
                        formData.value.ip = $('//content/ip').text() || defaultRecorderData.ip
                        formData.value.chkDomain = !$('//content/ip').text().toBoolean()
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
                        const productModel = $('//content/productModel').text() || editItemBak!.productModel
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
                        total.value = formData.value.recorderList.length
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
                                newData.productModel = editItemBak?.productModel as string
                                formData.value.recorderList.push(newData)
                            }
                            total.value = formData.value.recorderList.length
                            eleUserNameDisabled.value = false
                            eleBtnTestDisabled.value = false
                            eleChlCountDisabled.value = false
                        })
                    }
                })
            }
        }

        const validate: Record<string, RuleItem['validator']> = {
            validateIp: (_rule, _value, callback) => {
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
        }

        const rules = ref({
            ip: [{ validator: validate.validateIp, trigger: 'manual' }],
        })

        const loadNoRecoderData = (chlCount: number) => {
            formData.value.recorderList = []
            for (let i = 0; i < chlCount; i++) {
                const newData = new RecorderDto()
                newData.index = String(i + 1)
                formData.value.recorderList.push(newData)
            }
            total.value = formData.value.recorderList.length
        }

        const getTestData = () => {
            let data = '<content>'
            if (formData.value.chkDomain) {
                data += `<domain><![CDATA[${formData.value.domain}]]></domain>`
            } else {
                data += `<ip>${formData.value.ip}</ip>`
            }
            data += `<port>${formData.value.servePort}</port>
                    <userName>${formData.value.userName}</userName>`
            if (showDefaultPwdRow) {
                if (!formData.value.useDefaultPwd) {
                    data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
                }
            } else {
                // 手动添加没有使用默认密码的选项
                data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
            }
            data += '</content>'
            return getXmlWrapData(data)
        }

        const test = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    openLoading()
                    testRecorder(getTestData(), undefined, false).then((res) => {
                        closeLoading()
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            if (!editItemBak) editItemBak = new ChannelAddRecorderDto()
                            editItemBak.ip = formData.value.ip
                            editItemBak.port = formData.value.servePort
                            editItemBak.httpPort = defaultRecorderData.httpPort
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
            if (!formRef) return false
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
                                            editBasicCfg(getXmlWrapData(`<content><AISwitch>false</AISwitch></content>`))
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
            let data = rawXml`
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
                        </itemType>`
            tableRef.value!.getSelectionRows().forEach((ele: RecorderDto) => {
                data += rawXml`
                    <item>
                        <name>${ele.name || defalutNamePrefix + ele.index}</name>`
                if (formData.value.chkDomain) {
                    data += `<domain><![CDATA[${formData.value.domain}]]></domain>`
                } else {
                    data += `<ip>${formData.value.ip}</ip>`
                }
                data += rawXml`
                    <port>${formData.value.servePort.toString()}</port>
                    <userName>${formData.value.userName}</userName>`
                if (editItemBak) {
                    if (!formData.value.useDefaultPwd) {
                        data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
                    }
                } else {
                    // 手动添加没有使用默认密码的选项
                    data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
                }
                data += rawXml`
                    <index>${(Number(ele.index) - 1).toString()}</index>
                    <manufacturer>RECORDER</manufacturer>
                    <protocolType>RECORDER</protocolType>
                    <productModel factoryName='Customer'>${ele.productModel}</productModel>`
                if (ele.bandWidth) data += `<bandWidth>${ele.bandWidth}</bandWidth>`
                data += rawXml`
                    <rec per='5' post='10'/>
                    <snapSwitch>false</snapSwitch>
                    <buzzerSwitch>false</buzzerSwitch>
                    <popVideoSwitch>false</popVideoSwitch>
                    <frontEndOffline_popMsgSwitch>true</frontEndOffline_popMsgSwitch>
                    </item>`
            })
            data += '</content>'
            return getXmlWrapData(data)
        }

        const opened = () => {
            editItemBak = cloneDeep(props.editItem)
            selNum.value = 0
            total.value = 0
            eleChkDomainDisabled.value = true
            eleServePortDisabled.value = true
            eleIpDisabled.value = true
            eleChlCountDisabled.value = true
            eleUserNameDisabled.value = true
            eleBtnTestDisabled.value = true
            showDefaultPwdRow.value = true
            formData.value = new RecorderAddDto()
            formData.value.userName = (props.mapping as Record<string, DefaultPwdDto>)['RECORDER'].userName
            if (editItemBak) {
                formData.value.ip = editItemBak?.ip
                formData.value.servePort = editItemBak?.port
                formData.value.channelCount = Number(editItemBak?.chlTotalCount) * 1 ? editItemBak?.chlTotalCount : defaultRecorderData.channelCount
                formData.value.httpPort = editItemBak?.httpPort
                formData.value.useDefaultPwd = true
                getData()
            } else {
                formData.value.ip = defaultRecorderData.ip
                formData.value.servePort = defaultRecorderData.servePort
                formData.value.channelCount = defaultRecorderData.channelCount
                formData.value.httpPort = defaultRecorderData.httpPort
                formData.value.useDefaultPwd = false
                eleIpDisabled.value = false
                eleChkDomainDisabled.value = false
                eleServePortDisabled.value = false
                eleChlCountDisabled.value = false
                eleUserNameDisabled.value = false
                eleBtnTestDisabled.value = false
                showDefaultPwdRow.value = false
                loadNoRecoderData(Number(formData.value.channelCount))
            }
        }

        return {
            formRef,
            formData,
            rules,
            tableRef,
            selNum,
            total,
            handleRowClick,
            handleSelectionChange,
            test,
            save,
            opened,
            eleChkDomainDisabled,
            eleServePortDisabled,
            eleIpDisabled,
            showDefaultPwdRow,
            eleChlCountDisabled,
            eleUserNameDisabled,
            eleBtnTestDisabled,
        }
    },
})
