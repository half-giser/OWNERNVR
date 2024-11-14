/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-05 17:19:32
 * @Description: 添加通道 - 设置协议弹窗
 */
import { ChannelProtocolManageDto, ChannelResourcesPathDto } from '@/types/apiType/channel'
import type { FormInstance, TableInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        manufacturerList: {
            type: Array as PropType<Record<string, string>[]>,
            required: true,
        },
    },
    emits: {
        close(isRefresh = false) {
            return typeof isRefresh === 'boolean'
        },
    },
    setup(props, { emit }) {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const formRef = ref<FormInstance>()
        const formData = ref(new ChannelProtocolManageDto())
        const protocolManageList = ref<ChannelProtocolManageDto[]>([])
        const currentProtocolLogo = ref('')
        const tableRef = ref<TableInstance>()

        let tempProtocolLogo: string = ''
        let manufacturerArray: string[] = []
        let displayNameList: string[] = []

        const handleProtocolLogoChange = async (val: string) => {
            if (formData.value.enabled) {
                if (!(await verification())) return
            }
            formData.value = protocolManageList.value.find((ele: ChannelProtocolManageDto) => ele.id === val) as ChannelProtocolManageDto
            tempProtocolLogo = val
        }

        const getData = () => {
            openLoading()
            queryRtspProtocolList().then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    protocolManageList.value = []
                    $('//content/item').forEach((ele) => {
                        let eleXml = queryXml(ele.element)
                        const newData = new ChannelProtocolManageDto()
                        newData.id = ele.attr('id')
                        newData.enabled = eleXml('enabled').text().bool()
                        newData.displayName = eleXml('displayName').text()
                        eleXml('resourcesPath/item').forEach((ele) => {
                            eleXml = queryXml(ele.element)
                            const resourcesPath = new ChannelResourcesPathDto()
                            resourcesPath.streamType = eleXml('streamType').text()
                            resourcesPath.protocol = eleXml('protocol').text()
                            resourcesPath.transportProtocol = eleXml('transportProtocol').text()
                            resourcesPath.port = eleXml('port').text().num()
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

        const rules = ref<FormRules>({
            displayName: [
                {
                    validator: (_rule, value: string, callback) => {
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
                        value = value.trim()
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
                    trigger: 'manual',
                },
            ],
        })

        const verification = async () => {
            displayNameList = []
            protocolManageList.value.forEach((ele: ChannelProtocolManageDto) => {
                if (ele.enabled && ele.id !== tempProtocolLogo) displayNameList.push(ele.displayName)
            })
            if (!formRef) return false
            const valid = await formRef.value!.validate()
            if (valid) {
                const mainPath = formData.value.resourcesPath[0].path.trim()
                const subPath = formData.value.resourcesPath[1].path.trim()
                if (!mainPath) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_MAIN_RESOURCE_PATH_EMPTY'),
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }

                if (!subPath) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SUB_RESOURCE_PATH_EMPTY'),
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }
                const reg = /[^A-z|\d!@#$%^&*(){}\|:"`<>?~_\\'./\-\s\[\];,=+]/g
                if (reg.test(mainPath)) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_MAIN_RESOURCE_PATH_ILLEGAL'),
                    })
                    currentProtocolLogo.value = tempProtocolLogo
                    return false
                }

                if (reg.test(subPath)) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SUB_RESOURCE_PATH_ILLEGAL'),
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
            openLoading()
            editRtspProtocolList(getSaveData()).then((res) => {
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    emit('close', true)
                } else {
                    const errorCdoe = $('errorCode').text().num()
                    let msg = ''
                    if (errorCdoe === ErrorCode.USER_ERROR_NO_AUTH) {
                        msg = Translate('IDCS_NO_AUTH')
                    } else {
                        msg = Translate('IDCS_SAVE_DATA_FAIL')
                    }
                    openMessageBox({
                        type: 'info',
                        message: msg,
                    }).then(() => {
                        emit('close', true)
                    })
                }
            })
        }

        const getSaveData = () => {
            return rawXml`
                <content type='list'>
                    ${protocolManageList.value
                        .map((ele) => {
                            return rawXml`
                                <item id='${ele.id}'>
                                    <enabled>${ele.enabled}</enabled>
                                    <displayName>${wrapCDATA(ele.displayName)}</displayName>
                                    <resourcesPath>
                                        ${ele.resourcesPath
                                            .map((ele) => {
                                                return rawXml`
                                                    <item>
                                                        <streamType>${ele.streamType}</streamType>
                                                        <protocol>${ele.protocol}</protocol>
                                                        <transportProtocol>${ele.transportProtocol}</transportProtocol>
                                                        <port>${ele.port}</port>
                                                        <path>${wrapCDATA(ele.path)}</path>
                                                    </item>
                                                `
                                            })
                                            .join('')}
                                    </resourcesPath>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
        }

        const handleDisplayNameInput = (val: string) => {
            return val.replace(/[^A-z|\d!@#$%^&*(){}\|:"`?~_\\'./\-\s\[\];,=+]/g, '')
        }

        const opened = () => {
            formRef.value?.clearValidate()
            manufacturerArray = props.manufacturerList.map((ele) => ele.text)
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
