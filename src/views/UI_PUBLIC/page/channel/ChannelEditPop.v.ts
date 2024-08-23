/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:18:09
 * @Description:
 */
import { type FormInstance } from 'element-plus'
import { ChannelInfoDto } from '@/types/apiType/channel'
import { getXmlWrapData } from '../../../../api/api'
import { editDev, queryDev } from '../../../../api/channel'
import { queryXml } from '../../../../utils/xmlParse'
import { checkChlName, checkIpV4, checkIpV6, cutStringByByte, filterProperty, getSecurityVer } from '../../../../utils/tools'
import { errorCodeMap, nameByteMaxLen } from '../../../../utils/constants'
import { trim } from 'lodash'
import { useUserSessionStore } from '@/stores/userSession'
import { type SetupContext } from 'vue'
import { AES_encrypt } from '@/utils/encrypt'
import useMessageBox from '@/hooks/useMessageBox'
import { useLangStore } from '@/stores/lang'
import useLoading from '@/hooks/useLoading'

export default defineComponent({
    props: {
        rowData: ChannelInfoDto,
        protocolList: Array<String>,
        manufacturerMap: Object,
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
        nameMapping: Object,
        setDataCallBack: Function,
    },
    emits: ['updateNameMapping'],
    setup(props: any, { emit }: SetupContext) {
        const userSessionStore: any = useUserSessionStore()
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
            queryDev(data).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    editItem.value = new ChannelInfoDto()
                    editItem.value.name = res('//content/name').text()
                    editItem.value.port = res('//content/port').text()
                    // editItem.value.manufacturer = res('//content/manufacturer').text()
                    const filterPropertyList = filterProperty(props.protocolList, 'index')
                    const factoryName = res('//content/productModel').attr('factoryName')
                    const manufacturer = res('//content/manufacturer').text()
                    if (factoryName) {
                        editItem.value.manufacturer = factoryName
                    } else if (manufacturer.indexOf('RTSP') != -1) {
                        editItem.value.manufacturer = props.protocolList[filterPropertyList.indexOf(manufacturer.slice(5))]['displayName']
                    } else {
                        editItem.value.manufacturer = props.manufacturerMap[manufacturer]
                    }
                    editItem.value.productModel.innerText = res('//content/productModel').text()
                    editItem.value.userName = res('//content/userName').text()

                    if (res('//content/ip').length == 0 || res('//content/ip').text() == '') {
                        isAnolog.value = true
                        inputDisabled.value = true
                        ipDisabled.value = true
                        portDisabled.value = true
                    } else {
                        const ipdomain = res('//content/ip').text()
                        isIp = checkIpV4(ipdomain)
                        isIpv6 = checkIpV6(ipdomain)
                        isDomain = !isIp && !isIpv6

                        if (res('//content/protocolType').text() == 'RTSP') {
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

                        if (res('//content/addType').text() == 'poe') {
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
                    const isNotExit = res('errorCode').text() * 1 == errorCodeMap.resourceNotExist
                    if (isNotExit) errorInfo = Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL'))
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: errorInfo,
                        showCancelButton: false,
                    })
                        .then(() => {
                            if (isNotExit) {
                                props.close(true)
                            } else {
                                props.close()
                            }
                        })
                        .catch(() => {})
                }
            })
        }

        const validate = {
            validateName: (_rule: any, value: any, callback: any) => {
                value = trim(value)
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
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                        showCancelButton: false,
                    })
                    return
                }
                if (!notCheckNameFlag && checkIsNameExit(value, props.rowData.id)) {
                    openMessageTipBox({
                        type: 'question',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_NAME_EXISTED'),
                        confirmButtonText: Translate('IDCS_KEEP'),
                        cancelButtonText: Translate('IDCS_EDIT'),
                    })
                        .then(() => {
                            save(true)
                        })
                        .catch(() => {})
                    return
                }
                callback()
            },
            validateIp: (_rule: any, value: any, callback: any) => {
                if (!isAnolog.value) {
                    value = trim(value)
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
            validateUserName: (_rule: any, value: any, callback: any) => {
                if (!isAnolog.value) {
                    value = trim(value)
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
                        trim(editItem.value.name) +
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
                    editDev(getXmlWrapData(data)).then((res: any) => {
                        res = queryXml(res)
                        if (res('status').text() == 'success') {
                            emit('updateNameMapping', props.rowData.id, editItem.value.name)
                            openMessageTipBox({
                                type: 'success',
                                title: Translate('IDCS_SUCCESS_TIP'),
                                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                showCancelButton: false,
                            })
                                .then(() => {
                                    if (props.setDataCallBack) {
                                        if (editItem.value.ip == '0.0.0.0') {
                                            editItem.value.ip = ''
                                        }
                                        props.setDataCallBack(editItem.value)
                                    }
                                    props.close()
                                })
                                .catch(() => {})
                        } else {
                            if (res('errorCode').text() * 1 == errorCodeMap.nameExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST'),
                                    showCancelButton: false,
                                })
                            } else if (res('errorCode').text() * 1 == errorCodeMap.resourceNotExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_RESOURCE_NOT_EXIST').formatForLang(Translate('IDCS_CHANNEL')),
                                    showCancelButton: false,
                                })
                                    .then(() => {
                                        props.close(true)
                                    })
                                    .catch(() => {})
                            } else if (res('errorCode').text() * 1 == errorCodeMap.nodeExist) {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_PROMPT_CHANNEL_EXIST'),
                                    showCancelButton: false,
                                })
                            } else if (res('errorCode').text() * 1 == errorCodeMap.ipError) {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_ERROR_IP_ROUTE_INVALID'),
                                    showCancelButton: false,
                                })
                            } else {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                                    showCancelButton: false,
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
