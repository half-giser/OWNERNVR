/*
 * @Date: 2025-05-10 13:20:36
 * @Description: IP Speaker - 编辑弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        data: {
            type: Object as PropType<ChannelIpSpeakerDto>,
            required: true,
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            protocolTypeOptions: [
                {
                    label: Translate('IDCS_ONVIF_SERVER'),
                    value: 'ONVIF',
                },
            ],
            devList: [] as SelectOption<string, string>[],
        })

        const formRef = useFormRef()
        const formData = ref(new ChannelIpSpeakerAddDto())
        const rules = ref<FormRules>({
            ip: [
                {
                    validator(_rule, value: string, callback) {
                        if (!checkIpV4(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_IPADDRESS_INVALID')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            port: [
                {
                    validator(_rule, value: number, callback) {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_DATA_PORT_EMPTY')))
                            return
                        }

                        if (value < 10 || value > 65535) {
                            callback(new Error(Translate('IDCS_PROMPT_DATA_PORT_INVALID')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const setData = async () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const associatedType = formData.value.associatedDeviceID === '' ? 'NONE' : formData.value.associatedDeviceID === DEFAULT_EMPTY_ID ? 'LOCAL' : 'CHANNEL'
                    const associatedDeviceID = associatedType === 'CHANNEL' ? formData.value.associatedDeviceID : ''
                    const sendXml = rawXml`
                            <types>
                                <protocolType>
                                    <enum>ONVIF</enum>
                                </protocolType>
                                <associatedType>
                                    <enum>NONE</enum>
                                    <enum>LOCAL</enum>
                                    <enum>CHANNEL</enum>
                                </associatedType>
                            </types>
                            <content type="list">
                                <itemType>
                                    <protocolType type="protocolType" />
                                </itemType>
                                <item>
                                    ${formData.value.devName ? `<name>${wrapCDATA(formData.value.devName)}</name>` : ''}
                                    <ip>${formData.value.ip}</ip>
                                    <port>${formData.value.port}</port>
                                    <userName>${formData.value.userName.trim()}</userName>
                                    ${!formData.value.defaultPwd ? '' : `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>`}
                                    <protocolType>${formData.value.protocolType}</protocolType>
                                    <associatedType id="${associatedDeviceID}">${associatedType}</associatedType>
                                </item>
                            </content>
                        `
                    const result = await editVoiceDev(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        }).then(() => {
                            ctx.emit('confirm')
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let msg = Translate('IDCS_SAVE_FAIL')
                        switch (errorCode) {
                            // 不支持的协议
                            case 536870992:
                                msg = Translate('IDCS_PROMPT_IPADDRESS_INVALID')
                                break
                            // 不支持的协议
                            case 536871073:
                                msg = errorCode + ''
                                break
                            // 语音设备已经存在
                            case 536870913:
                                msg = Translate('IDCS_VOICE_DEVICE_ALREADY_EXISTS')
                                break
                            // 语音设备达到数量上限
                            case 536871004:
                                msg = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                                break
                            // 已关联语音设备
                            case 536870945:
                                msg = Translate('IDCS_ASSOCIATIOP_TIPS')
                                break
                            // 无效参数
                            case 536870943:
                                msg = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                                break
                            case 536871059:
                                msg = Translate('IDCS_CHANNEL_NOTEXIST')
                                break
                        }
                        openMessageBox(msg)
                    }
                }
            })
        }

        const close = () => {
            ctx.emit('close')
        }

        const getAddedDevList = async () => {
            const devIdList: string[] = []
            const result = await getChlList({
                nodeType: 'voices',
            })
            const $ = queryXml(result)
            const ids = $('content/item').map((item) => {
                return item.attr('id')
            })
            for (const id in ids) {
                const sendXml = rawXml`
                    <condition>
                        <alarmInId>${id}</alarmInId>
                    </condition>
                `
                const result = await queryVoiceDev(sendXml)
                const $item = queryXml(result)
                const associatedType = $item('content/associatedType').text()
                const associatedDeviceID = associatedType === 'LOCAL' ? DEFAULT_EMPTY_ID : $item('content/associatedType').attr('id')
                devIdList.push(associatedDeviceID)
            }
            return devIdList
        }

        const getUnaddedDevList = async () => {
            const addedDevList = await getAddedDevList()

            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <chlIndex/>
                    <index/>
                    <chlNum/>
                    <chlType/>
                </requireField>
            `
            const result = await queryDevList(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const devList = $('content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            value: item.attr('id'),
                            label: $item('name').text(),
                            chlNum: $item('chlNum').text().num(),
                        }
                    })
                    .sort((a, b) => a.chlNum - b.chlNum)
                devList.push(
                    {
                        value: DEFAULT_EMPTY_ID,
                        label: Translate('NVR'),
                        chlNum: 0,
                    },
                    {
                        value: '',
                        label: `<${Translate('IDCS_NULL')}>`,
                        chlNum: 0,
                    },
                )
                pageData.value.devList = devList.filter((item) => item.value === prop.data.associatedDeviceID || !addedDevList.includes(item.value))
            }
        }

        const open = async () => {
            openLoading()
            await getUnaddedDevList()
            formData.value.devName = prop.data.name
            formData.value.port = prop.data.port
            formData.value.ip = prop.data.ip
            formData.value.associatedDeviceID = prop.data.associatedDeviceID
            formData.value.protocolType = prop.data.protocolType
            closeLoading()
        }

        return {
            formRef,
            formData,
            rules,
            open,
            close,
            setData,
            pageData,
        }
    },
})
