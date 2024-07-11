/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:13:17
 * @Description: DDNS
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-10 14:57:32
 */
import { NetDDNSForm, NetDDNSServerTypeList } from '@/types/apiType/net'
import { type FormInstance, type FormRules } from 'element-plus'
import { formatInputUserName } from '@/utils/tools'
import { nameByteMaxLen } from '@/utils/constants'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetDDNSForm())
        const formRule = ref<FormRules>({
            serverAddr: [
                {
                    validator(rule, value: string, callback) {
                        if (!isParamEnable('serverAddr')) {
                            callback()
                            return
                        }
                        // 服务器地址可能是ipv4/ipv6/域名
                        if (!checkIpV4(value) && !checkIpV6(value) && !checkDomainName(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_SERVER')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            domainName: [
                {
                    validator(rule, value: string, callback) {
                        if (!isParamEnable('domainName')) {
                            callback()
                            return
                        }
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_DOMAIN_NAME_EMPTY')))
                            return
                        }
                        if (!checkDomainName(value)) {
                            callback(new Error(Translate('IDCS_TEST_DDNS_NOHOST')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            userName: [
                {
                    validator(rule, value: string, callback) {
                        if (!isParamEnable('userName')) {
                            callback()
                            return
                        }
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(rule, value: string, callback) {
                        if (!isParamEnable('userName')) {
                            callback()
                            return
                        }
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        let timer: NodeJS.Timeout | number = 0

        const pageData = ref({
            // DDNS类型选项
            serverTypeOptions: [] as NetDDNSServerTypeList[],
            // 连接状态
            connectState: '',
            // mac地址
            mac: '',
        })

        const getNetConfig = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)

            const find = $('response/content/nicConfigs/item').find((item) => {
                return item.attr('id') === 'eth0'
            })
            if (find) {
                pageData.value.mac = queryXml(find.element)('mac').text().slice(9).split(':').join('')
            }
        }

        const current = computed(() => {
            const find = pageData.value.serverTypeOptions.find((item) => item.serverType === formData.value.serverType)
            return find || new NetDDNSServerTypeList()
        })

        const isParamEnable = (param: string) => {
            return current.value.requireParam.includes(param) && !current.value.hideParam.includes(param)
        }

        const getData = async () => {
            const result = await queryDDNSCfg()
            commLoadResponseHandler(result, ($) => {
                formData.value.serverType = $('/response/content/serverType').text()
                formData.value.serverAddr = $('/response/content/serverAddr').text()
                formData.value.userName = $('/response/content/userName').text()
                formData.value.password = $('/response/content/password').text()
                formData.value.domainName = $('/response/content/domainName').text()
                formData.value.heartbeatTime = Number($('/response/content/heartbeatTime').text()) || null
                formData.value.switch = $('/response/content/switch').text().toBoolean()

                pageData.value.serverTypeOptions = $('/response/types/ddnsServerType/enum').map((item) => {
                    const serverType = item.attr('display') || item.text()
                    const serverTypeValue = item.text()
                    const isSelected = serverTypeValue === formData.value.serverType

                    const hideParam = []
                    let defaultDomainName = ''
                    let defaultServerAddr = item.attr('defaultServerAddr') || ''
                    let suffix = item.attr('suffix') || ''
                    let isRegisterBtn = false
                    let isTestBtn = true
                    switch (serverTypeValue) {
                        case 'www.autoddns.com':
                            isRegisterBtn = true
                            isTestBtn = false
                            break
                        case 'specoddns.net':
                            hideParam.push('userName', 'password', 'heartbeat')
                            defaultDomainName = 'speco' + pageData.value.mac
                            break
                        case 'innektdvr.com':
                            hideParam.push('userName', 'password')
                            suffix = 'innektdvr.com'
                            defaultDomainName = pageData.value.mac
                            break
                        case 'hifocuslive.com':
                            defaultServerAddr = 'hifocuslive.com'
                            break
                        case 'members.grasphere.net':
                            isTestBtn = false
                            break
                        default:
                            break
                    }

                    return {
                        display: serverType,
                        serverType: serverTypeValue,
                        serverAddr: isSelected ? formData.value.serverAddr : '',
                        userName: isSelected ? formData.value.userName : '',
                        password: isSelected ? formData.value.password : '',
                        domainName: isSelected ? formData.value.domainName : '',
                        heartbeatTime: isSelected ? formData.value.heartbeatTime : null,
                        suffix,
                        requireParam: item.attr('requireParam')!.split(','),
                        hideParam: hideParam,
                        defaultServerAddr,
                        defaultHeartBeatTime: Number(item.attr('defaultHeartBeatTime')) || null,
                        defaultDomainName,
                        isRegisterBtn,
                        isTestBtn,
                    }
                })

                if (!formData.value.serverType) {
                    formData.value.serverType = pageData.value.serverTypeOptions[0].serverType
                }

                pageData.value.connectState = $('/response/content/connectState').text() === 'success' ? Translate('IDCS_SUCCESS') : Translate('IDCS_FAILED')
                timer = setInterval(() => getConnectStatus(), 5000)
            })
        }

        const changeServerType = () => {
            formRef.value!.clearValidate()
            formData.value.serverAddr = current.value.serverAddr || current.value.defaultServerAddr
            formData.value.userName = current.value.userName
            formData.value.password = current.value.password
            formData.value.domainName = current.value.domainName || current.value.defaultDomainName
            formData.value.heartbeatTime = current.value.heartbeatTime || current.value.defaultHeartBeatTime
        }

        const getSetDataXml = () => {
            const password = AES_encrypt(formData.value.password, userSession.sesionKey)
            const enableXml = formData.value.switch
                ? rawXml`
                    <serverType>${wrapCDATA(formData.value.serverType)}</serverType>
                    <serverAddr>${wrapCDATA(formData.value.serverAddr)}</serverAddr>
                    <domainName>${wrapCDATA(formData.value.domainName)}</domainName>
                    <userName>${wrapCDATA(formData.value.userName)}</userName>
                    <password ${getSecurityVer()}>${wrapCDATA(password)}</password>
                `
                : ''
            const sendXml = rawXml`
                <content>
                    <switch>${formData.value.switch.toString()}</switch>
                    ${enableXml}
                    ${formData.value.heartbeatTime ? `<heartbeatTime>${formData.value.heartbeatTime}</heartbeatTime>` : ''}
                </content>
            `
            return sendXml
        }

        const setData = async () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading(LoadingTarget.FullScreen)

                const result = await editDDNSCfg(getSetDataXml())

                commSaveResponseHadler(result)
                closeLoading(LoadingTarget.FullScreen)
            })
        }

        const test = async () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading(LoadingTarget.FullScreen, current.value.isRegisterBtn ? Translate('IDCS_REGISTER_HOLD_ON') : '')

                const result = await testDDNSCfg(getSetDataXml())
                const $ = queryXml(result)

                if ($('/response/status').text() === 'success') {
                    openMessageTipBox({
                        type: 'success',
                        title: Translate('IDCS_SUCCESS_TIP'),
                        message: current.value.isRegisterBtn ? Translate('IDCS_REGISTER_SUCCESS') : Translate('IDCS_TEST_SUCCESS'),
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        title: Translate('IDCS_INFO_TIP'),
                        message: Translate($('/response/errorDescription').text()),
                    })
                }

                closeLoading(LoadingTarget.FullScreen)
            })
        }

        const getConnectStatus = async () => {
            const result = await queryDDNSCfg()
            pageData.value.connectState = queryXml(result)('/response/content/connectState').text() === 'success' ? Translate('IDCS_SUCCESS') : Translate('IDCS_FAILED')
        }

        const formatDomainName = (domainName: string) => {
            return domainName.replace(/[\u4E00-\u9FA5]/g, '')
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)

            await getNetConfig()
            await getData()

            closeLoading(LoadingTarget.FullScreen)
        })

        onBeforeUnmount(() => {
            clearInterval(timer)
        })

        return {
            formRef,
            formData,
            formRule,
            pageData,
            current,
            changeServerType,
            test,
            setData,
            formatDomainName,
            formatInputUserName,
            nameByteMaxLen,
        }
    },
})
