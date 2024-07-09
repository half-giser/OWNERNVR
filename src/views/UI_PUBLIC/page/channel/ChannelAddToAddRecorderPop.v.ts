/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-29 20:39:11
 * @Description:
 */
import { ChannelAddRecorderDto, type DefaultPwdDto, QueryNodeListDto, RecorderAddDto, RecorderDto } from '@/types/apiType/channel'
import { type FormInstance } from 'element-plus'
import useMessageBox from '@/hooks/useMessageBox'
import useLoading from '@/hooks/useLoading'
import { useLangStore } from '@/stores/lang'
import { checkIpV4, commLoadResponseHandler, getChlList, getSecurityVer } from '@/utils/tools'
import { AES_encrypt } from '@/utils/encrypt'
import { useUserSessionStore } from '@/stores/userSession'
import { createDevList, queryRecorder, testRecorder } from '@/api/channel'
import { getXmlWrapData } from '@/api/api'
import { queryXml } from '@/utils/xmlParse'
import { trim, cloneDeep } from 'lodash'
import { useRouter } from 'vue-router'
import { errorCodeMap } from '@/utils/constants'
import BaseIpInput from '../../components/form/BaseIpInput.vue'
import { editBasicCfg } from '@/api/system'

export default defineComponent({
    components: { BaseIpInput },
    props: {
        editItem: ChannelAddRecorderDto,
        mapping: Object,
        chlCountLimit: {
            type: Number,
            default: 128,
        },
        faceMatchLimitMaxChlNum: {
            type: Number,
            default: 0,
        },
        callBack: Function,
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSessionStore = useUserSessionStore()
        const { openMessageTipBox } = useMessageBox()
        const router = useRouter()
        const formRef = ref<FormInstance>()
        const formData = ref(new RecorderAddDto())
        const tableRef = ref()
        const tableData = ref()
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
        defaultRecorderData.servePort = '6036'
        defaultRecorderData.httpPort = '80'
        defaultRecorderData.channelCount = '8'

        const errorMap: Record<string, Record<string, string>> = {
            '536870947': {
                errorCode: '536870947',
                errorDescription: Translate('IDCS_DEVICE_PWD_ERROR'),
            },
            '536870948': {
                errorCode: '536870948',
                errorDescription: Translate('IDCS_DEVICE_PWD_ERROR'),
            },
            '536870951': {
                errorCode: '536870951',
                errorDescription: Translate('IDCS_REMOTE_USER_LOCKED'),
            },
            '536870953': {
                errorCode: '536870953',
                errorDescription: Translate('IDCS_NO_PERMISSION'),
            },
            '536871009': {
                errorCode: '536871009',
                errorDescription: Translate('IDCS_RECORDER_HTTPPORT_ERR'),
            },
        }

        const handleRowClick = (rowData: RecorderDto) => {
            tableRef.value.clearSelection()
            tableRef.value.toggleRowSelection(rowData, true)
        }

        const handleSelectionChange = () => {
            selNum.value = tableRef.value.getSelectionRows().length
        }

        const getData = (showSuccessTip?: boolean) => {
            openLoading(LoadingTarget.FullScreen)
            if ((props.mapping as Record<string, DefaultPwdDto>)['RECORDER']) {
                const data = `<condition>
                                ${formData.value.chkDomain ? '<domain><![CDATA[' + formData.value.domain + ']]></domain>' : '<ip>' + formData.value.ip + '</ip>'}
                                <port>${formData.value.servePort}</port>
                                <version>${editItemBak?.version}</version>
                                <httpPort>${formData.value.httpPort}</httpPort>
                                <userName>${formData.value.userName}</userName>
                                ${formData.value.useDefaultPwd ? '' : '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(formData.value.password, userSessionStore.sesionKey) + ']]></password>'}
                            </condition>`
                queryRecorder(getXmlWrapData(data), undefined, false).then((res: any) => {
                    closeLoading(LoadingTarget.FullScreen)
                    res = queryXml(res)
                    if (res('status').text() == 'success') {
                        if (showSuccessTip) {
                            openMessageTipBox({
                                type: 'success',
                                title: Translate('IDCS_SUCCESS_TIP'),
                                message: Translate('IDCS_TEST_SUCCESS'),
                                showCancelButton: false,
                            })
                        }
                        formData.value.ip = res('//content/ip').text() || defaultRecorderData.ip
                        formData.value.chkDomain = !res('//content/ip').text()
                        if (res('//content/domain').text()) {
                            const isIp = checkIpV4(res('//content/domain').text())
                            if (isIp) formData.value.ip = res('//content/domain').text()
                            formData.value.chkDomain = !isIp
                            formData.value.domain = isIp ? '' : res('//content/domain').text()
                        }
                        formData.value.servePort = res('//content/port').text()
                        const chlCount = res('//content/chlList').attr('total')
                        if (chlCount * 1 > 0) {
                            formData.value.channelCount = chlCount
                        } else {
                            eleChlCountDisabled.value = false
                        }
                        const productModel = res('//content/productModel').text() || editItemBak?.productModel
                        formData.value.recorderList = []
                        res('//content/chlList/item').forEach((ele: any) => {
                            const eleXml = queryXml(ele.element)
                            const newData = new RecorderDto()
                            newData.index = ele.attr('index')
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
                        const errorCode = res('errorCode').text()
                        openMessageTipBox({
                            type: 'info',
                            title: Translate('IDCS_INFO_TIP'),
                            message: errorMap[errorCode] ? errorMap[errorCode]['errorDescription'] : Translate('IDCS_LOGIN_OVERTIME'),
                            showCancelButton: false,
                        })
                            .then(() => {
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
                            .catch(() => {})
                    }
                })
            }
        }

        const validate = {
            validateIp: (_rule: any, _value: any, callback: any) => {
                if (formData.value.chkDomain) {
                    const domain = trim(formData.value.domain)
                    if (!domain.length) {
                        callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                        return
                    }
                } else {
                    const ip = trim(formData.value.ip)
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
                    openLoading(LoadingTarget.FullScreen)
                    testRecorder(getTestData(), undefined, false).then((res: any) => {
                        closeLoading(LoadingTarget.FullScreen)
                        res = queryXml(res)
                        if (res('status').text() == 'success') {
                            if (!editItemBak) editItemBak = new ChannelAddRecorderDto()
                            editItemBak.ip = formData.value.ip
                            editItemBak.port = formData.value.servePort
                            editItemBak.httpPort = defaultRecorderData.httpPort
                            getData(true)
                        } else {
                            const errorCode = res('errorCode').text()
                            openMessageTipBox({
                                type: 'info',
                                title: Translate('IDCS_INFO_TIP'),
                                message: errorMap[errorCode] ? errorMap[errorCode]['errorDescription'] : Translate('IDCS_LOGIN_OVERTIME'),
                                showCancelButton: false,
                            })
                                .then(() => {
                                    loadNoRecoderData(Number(formData.value.channelCount))
                                })
                                .catch(() => {})
                        }
                    })
                }
            })
        }

        const save = () => {
            if (tableRef.value.getSelectionRows().length == 0) return
            setData()
        }

        const setData = () => {
            if (!formRef) return false
            formRef.value?.validate((valid) => {
                if (valid) {
                    getChlList(new QueryNodeListDto()).then((res: any) => {
                        closeLoading(LoadingTarget.FullScreen)
                        commLoadResponseHandler(res, () => {
                            res = queryXml(res)
                            const addedChlNum = res('//content/item').length
                            if (addedChlNum + tableRef.value.getSelectionRows().length > props.chlCountLimit) {
                                openMessageTipBox({
                                    type: 'info',
                                    title: Translate('IDCS_INFO_TIP'),
                                    message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                                    showCancelButton: false,
                                })
                                return
                            }
                            openLoading(LoadingTarget.FullScreen)
                            createDevList(getSaveData()).then((res: any) => {
                                closeLoading(LoadingTarget.FullScreen)
                                res = queryXml(res)
                                if (res('status').text() == 'success') {
                                    openMessageTipBox({
                                        type: 'success',
                                        title: Translate('IDCS_SUCCESS_TIP'),
                                        message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                        showCancelButton: false,
                                    })
                                        .then(() => {
                                            router.push('list')
                                        })
                                        .catch(() => {})
                                } else {
                                    const errorCdoe = res('errorCode').text()
                                    if (errorCdoe == errorCodeMap.nodeExist) {
                                        openMessageTipBox({
                                            type: 'info',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_CAMERA_EXISTED'),
                                            showCancelButton: false,
                                        })
                                    } else if (errorCdoe == '536871004') {
                                        openMessageTipBox({
                                            type: 'info',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                                            showCancelButton: false,
                                        })
                                            .then(() => {
                                                props.close()
                                            })
                                            .catch(() => {})
                                    } else if (errorCdoe == '536871005') {
                                        openMessageTipBox({
                                            type: 'info',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_BANDWIDTH_LIMIT'),
                                            showCancelButton: false,
                                        })
                                    } else if (errorCdoe == '536871007') {
                                        const poePort = res('poePort').text()
                                        // POE连接冲突提示
                                        openMessageTipBox({
                                            type: 'info',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: Translate('IDCS_POE_RESOURCE_CONFLICT_TIP').formatForLang(poePort),
                                            showCancelButton: false,
                                        })
                                    } else if (errorCdoe == '536871050') {
                                        openMessageTipBox({
                                            type: 'info',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(props.faceMatchLimitMaxChlNum),
                                            showCancelButton: false,
                                        })
                                    } else if (errorCdoe == '536871052') {
                                        const msg =
                                            Translate('IDCS_ADD_CHANNEL_FAIL').formatForLang(props.faceMatchLimitMaxChlNum) + Translate('IDCS_REBOOT_DEVICE').formatForLang(Translate('IDCS_KEEP_ADD'))
                                        openMessageTipBox({
                                            type: 'question',
                                            title: Translate('IDCS_INFO_TIP'),
                                            message: msg,
                                        })
                                            .then(() => {
                                                editBasicCfg(getXmlWrapData(`<content><AISwitch>false</AISwitch></content>`))
                                            })
                                            .catch(() => {})
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
                        })
                    })
                }
            })
        }

        const getSaveData = () => {
            const defalutNamePrefix = 'Recorder_'
            let data = `
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
            tableRef.value.getSelectionRows().forEach((ele: RecorderDto) => {
                data += `
                    <item>
                        <name>${ele.name || defalutNamePrefix + ele.index}</name>`
                if (formData.value.chkDomain) {
                    data += `<domain><![CDATA[${formData.value.domain}]]></domain>`
                } else {
                    data += `<ip>${formData.value.ip}</ip>`
                }
                data += `
                    <port>${formData.value.servePort}</port>
                    <userName>${formData.value.userName}</userName>`
                if (editItemBak) {
                    if (!formData.value.useDefaultPwd) {
                        data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
                    }
                } else {
                    // 手动添加没有使用默认密码的选项
                    data += `<password${getSecurityVer()}><![CDATA[${AES_encrypt(formData.value.password, userSessionStore.sesionKey)}]]></password>`
                }
                data += `
                    <index>${Number(ele.index) - 1}</index>
                    <manufacturer>RECORDER</manufacturer>
                    <protocolType>RECORDER</protocolType>
                    <productModel factoryName='Customer'>${ele.productModel}</productModel>`
                if (ele.bandWidth) data += `<bandWidth>${ele.bandWidth}</bandWidth>`
                data += `
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
            tableData,
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
