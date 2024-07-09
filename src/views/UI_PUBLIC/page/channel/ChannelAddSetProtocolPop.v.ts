/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-05 17:19:32
 * @Description: 
import { queryRtspProtocolList } from '@/api/channel'
 */
import useLoading from '@/hooks/useLoading'
import { useLangStore } from '@/stores/lang'
import useMessageBox from '@/hooks/useMessageBox'
import { queryXml } from '../../../../utils/xmlParse'
import { getXmlWrapData } from '@/api/api'
import { editRtspProtocolList, queryRtspProtocolList } from '@/api/channel'
import { ProtocolManageDto, ResourcesPathDto } from '@/types/apiType/channel'
import { trim } from 'lodash'

export default defineComponent({
    props: {
        manufacturerList: Array<Object>,
        close: {
            type: Function,
            require: true,
            default: () => {},
        },
    },
    setup(props: any) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const formRef = ref()
        const formData = ref(new ProtocolManageDto())
        const protocolManageList = ref<ProtocolManageDto[]>([])
        const currentProtocolLogo = ref('')
        const tableRef = ref()

        let tempProtocolLogo: string = ''
        let manufacturerArray: string[] = []
        let displayNameList: string[] = []

        const handleProtocolLogoChange = async (val: string) => {
            if (formData.value.enabled) {
                if (!(await verification())) return
            }
            formData.value = protocolManageList.value.find((ele: ProtocolManageDto) => ele.id == val) as ProtocolManageDto
            tempProtocolLogo = val
        }

        const getData = () => {
            openLoading(LoadingTarget.FullScreen)
            queryRtspProtocolList(getXmlWrapData('')).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    protocolManageList.value = []
                    res('//content/item').forEach((ele: any) => {
                        let eleXml = queryXml(ele.element)
                        const newData = new ProtocolManageDto()
                        newData.id = ele.attr('id')
                        newData.enabled = eleXml('enabled').text() == 'true'
                        newData.displayName = eleXml('displayName').text()
                        eleXml('resourcesPath/item').forEach((ele: any) => {
                            eleXml = queryXml(ele.element)
                            const resourcesPath = new ResourcesPathDto()
                            resourcesPath.streamType = eleXml('streamType').text()
                            resourcesPath.protocol = eleXml('protocol').text()
                            resourcesPath.transportProtocol = eleXml('transportProtocol').text()
                            resourcesPath.port = eleXml('port').text()
                            resourcesPath.path = eleXml('path').text()
                            newData.resourcesPath.push(resourcesPath)
                        })
                        protocolManageList.value.push(newData)
                    })
                    formData.value = protocolManageList.value[0]
                    currentProtocolLogo.value = tempProtocolLogo = formData.value.id
                }
            })
        }

        const validate = {
            validateDisplayName: (_rule: any, value: any, callback: any) => {
                // if (formData.value.chkDomain) {
                //     let domain = trim(formData.value.domain)
                //     if (!domain.length) {
                //         callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                //         return
                //     }
                // } else {
                //     let ip = trim(formData.value.ip)
                //     if (!ip || ip == '0.0.0.0') {
                //         callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                //         return
                //     }
                // }
                value = trim(value)
                if (!value) {
                    callback(new Error(Translate('IDCS_SHOW_NAME_EMPTY')))
                    currentProtocolLogo.value = tempProtocolLogo
                    return
                }
                if (displayNameList.concat(manufacturerArray).includes(value)) {
                    callback(new Error(Translate('IDCS_SHOW_NAME_SAME')))
                    currentProtocolLogo.value = tempProtocolLogo
                    return
                }
                callback()
            },
        }

        const rules = ref({
            displayName: [{ validator: validate.validateDisplayName, trigger: 'manual' }],
        })

        const verification = async () => {
            displayNameList = []
            protocolManageList.value.forEach((ele: ProtocolManageDto) => {
                if (ele.enabled && ele.id != tempProtocolLogo) displayNameList.push(ele.displayName)
            })
            if (!formRef) return false
            const valid = await formRef.value.validate()
            if (valid) {
                const mainPath = trim(formData.value.resourcesPath[0].path)
                const subPath = trim(formData.value.resourcesPath[1].path)
                if (!mainPath) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_MAIN_RESOURCE_PATH_EMPTY'),
                        showCancelButton: false,
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }
                if (!subPath) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_SUB_RESOURCE_PATH_EMPTY'),
                        showCancelButton: false,
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }
                const reg = /[^A-z|\d!@#$%^&*(){}\|:"`<>?~_\\'./\-\s\[\];,=+]/g
                if (reg.test(mainPath)) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_MAIN_RESOURCE_PATH_ILLEGAL'),
                        showCancelButton: false,
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }
                if (reg.test(subPath)) {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate('IDCS_SUB_RESOURCE_PATH_ILLEGAL'),
                        showCancelButton: false,
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }
            }
            return valid
        }

        const save = async () => {
            if (formData.value.enabled) {
                if (!(await verification())) return
            }
            openLoading(LoadingTarget.FullScreen)
            editRtspProtocolList(getSaveData()).then((res: any) => {
                closeLoading(LoadingTarget.FullScreen)
                res = queryXml(res)
                if (res('status').text() == 'success') {
                    props.close(true)
                } else {
                    const errorCdoe = res('errorCode').text()
                    let msg = ''
                    if (errorCdoe == '536870953') {
                        msg = Translate('IDCS_NO_AUTH')
                    } else {
                        msg = Translate('IDCS_SAVE_DATA_FAIL')
                    }
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: msg,
                        showCancelButton: false,
                    })
                        .then(() => {
                            props.close(true)
                        })
                        .catch(() => {})
                }
            })
        }

        const getSaveData = () => {
            let data = `<content type='list'>`
            protocolManageList.value.forEach((ele: ProtocolManageDto) => {
                data += `
                    <item id='${ele.id}'>
                        <enabled>${ele.enabled}</enabled>
                        <displayName><![CDATA[${ele.displayName}]]></displayName>
                        <resourcesPath>`
                ele.resourcesPath.forEach((ele: ResourcesPathDto) => {
                    data += `
                        <item>
                            <streamType>${ele.streamType}</streamType>
                            <protocol>${ele.protocol}</protocol>
                            <transportProtocol>${ele.transportProtocol}</transportProtocol>
                            <port>${ele.port}</port>
                            <path><![CDATA[${ele.path}]]></path>
                        </item>`
                })
                data += `</resourcesPath></item>`
            })
            data += `</content>`
            return getXmlWrapData(data)
        }

        const handleDisplayNameInput = (val: string) => {
            const reg = /[^A-z|\d!@#$%^&*(){}\|:"`?~_\\'./\-\s\[\];,=+]/g
            if (reg.test(val)) formData.value.displayName = val.replace(reg, '')
        }

        const opened = () => {
            formRef.value.clearValidate()
            manufacturerArray = []
            props.manufacturerList.forEach((ele: Record<string, string>) => {
                manufacturerArray.push(ele['text'])
            })
            getData()
        }

        return {
            formRef,
            formData,
            protocolManageList,
            tableRef,
            handleProtocolLogoChange,
            rules,
            save,
            opened,
            currentProtocolLogo,
            handleDisplayNameInput,
        }
    },
})
