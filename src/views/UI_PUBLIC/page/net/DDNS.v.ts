/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:13:17
 * @Description: DDNS
 */
import { NetDDNSForm, NetDDNSServerTypeList } from '@/types/apiType/net'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetDDNSForm())
        const formRule = ref<FormRules>({
            serverAddr: [
                {
                    validator(_rule, value: string, callback) {
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
                    validator(_rule, value: string, callback) {
                        if (!isParamEnable('domainName')) {
                            callback()
                            return
                        }

                        if (!value.trim()) {
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
                    validator(_rule, value: string, callback) {
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
                    validator(_rule, value: string, callback) {
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

        // 更新连接状态的定时器
        const timer = useRefreshTimer(() => {
            getConnectStatus()
        })

        const pageData = ref({
            // DDNS类型选项
            serverTypeOptions: [] as NetDDNSServerTypeList[],
            // 连接状态
            connectState: '',
            // mac地址
            mac: '',
        })

        /**
         * @description 获取网络配置mac地址
         */
        const getNetConfig = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)

            const find = $('//content/nicConfigs/item').find((item) => {
                return item.attr('id') === 'eth0'
            })
            if (find) {
                pageData.value.mac = queryXml(find.element)('mac').text().slice(9).split(':').join('')
            }
        }

        // 当前DDNS类型
        const current = computed(() => {
            const find = pageData.value.serverTypeOptions.find((item) => item.serverType === formData.value.serverType)
            return find || new NetDDNSServerTypeList()
        })

        /**
         * @description 当前输入框是否非禁用状态
         * @param {stirng} param 选项属性
         * @returns {boolean}
         */
        const isParamEnable = (param: string) => {
            if (!formData.value.switch) {
                return false
            }
            return current.value.requireParam.includes(param) && !current.value.hideParam.includes(param)
        }

        /**
         * @description 获取表单数据
         */
        const getData = async () => {
            const result = await queryDDNSCfg()
            commLoadResponseHandler(result, ($) => {
                formData.value.serverType = $('//content/serverType').text()
                formData.value.serverAddr = $('//content/serverAddr').text()
                formData.value.userName = $('//content/userName').text()
                formData.value.password = $('//content/password').text()
                formData.value.domainName = $('//content/domainName').text()
                formData.value.heartbeatTime = Number($('//content/heartbeatTime').text()) || undefined
                formData.value.switch = $('//content/switch').text().toBoolean()

                pageData.value.serverTypeOptions = $('//types/ddnsServerType/enum').map((item) => {
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
                            isTestBtn = false
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
                        case 'www.no-ip.com':
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
                        heartbeatTime: isSelected ? formData.value.heartbeatTime : undefined,
                        suffix,
                        requireParam: item.attr('requireParam')!.split(','),
                        hideParam: hideParam,
                        defaultServerAddr,
                        defaultHeartBeatTime: Number(item.attr('defaultHeartBeatTime')) || undefined,
                        defaultDomainName,
                        isRegisterBtn,
                        isTestBtn,
                    }
                })

                if (!formData.value.serverType) {
                    formData.value.serverType = pageData.value.serverTypeOptions[0].serverType
                }

                pageData.value.connectState = $('//content/connectState').text() === 'success' ? Translate('IDCS_SUCCESS') : Translate('IDCS_FAILED')
            })
        }

        /**
         * @description 处理DDNS类型改变
         */
        const changeServerType = () => {
            formRef.value!.clearValidate()
            formData.value.serverAddr = current.value.serverAddr || current.value.defaultServerAddr
            formData.value.userName = current.value.userName
            formData.value.password = current.value.password
            formData.value.domainName = current.value.domainName || current.value.defaultDomainName
            formData.value.heartbeatTime = current.value.heartbeatTime || current.value.defaultHeartBeatTime
        }

        /**
         * @description 获取更新数据的XML字符串
         * @returns {string}
         */
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
                    <switch>${formData.value.switch}</switch>
                    ${enableXml}
                    ${formData.value.heartbeatTime ? `<heartbeatTime>${formData.value.heartbeatTime}</heartbeatTime>` : ''}
                </content>
            `
            return sendXml
        }

        /**
         * @description 符合条件后，更新数据
         */
        const setData = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                if (formData.value.switch && ['specoddns.net', 'www.no-ip.com'].includes(current.value.serverType)) {
                    openLoading(LoadingTarget.FullScreen, current.value.isRegisterBtn ? Translate('IDCS_REGISTER_HOLD_ON') : undefined)
                    const result = await testDDNSCfg(getSetDataXml())
                    const $ = queryXml(result)

                    if ($('//status').text() === 'success') {
                        await confirmSetData()
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_SAVE_FAIL') + ', ' + Translate($('//errorDescription').text()),
                        })
                    }
                } else {
                    openLoading()
                    await confirmSetData()
                }
            })
        }

        /**
         * @description 更新数据
         */
        const confirmSetData = async () => {
            const result = await editDDNSCfg(getSetDataXml())

            closeLoading()
            commSaveResponseHadler(result)

            const findIndex = pageData.value.serverTypeOptions.findIndex((item) => item.serverType === formData.value.serverType)
            if (findIndex >= 0) {
                pageData.value.serverTypeOptions[findIndex].password = formData.value.password
            }
        }

        /**
         * @description 测试
         */
        const test = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading(LoadingTarget.FullScreen, current.value.isRegisterBtn ? Translate('IDCS_REGISTER_HOLD_ON') : undefined)

                const result = await testDDNSCfg(getSetDataXml())
                const $ = queryXml(result)

                if ($('//status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: current.value.isRegisterBtn ? Translate('IDCS_REGISTER_SUCCESS') : Translate('IDCS_TEST_SUCCESS'),
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate($('//errorDescription').text()),
                    })
                }

                closeLoading()
            })
        }

        /**
         * @description 获取连接状态
         */
        const getConnectStatus = async () => {
            const result = await queryDDNSCfg()
            pageData.value.connectState = queryXml(result)('//content/connectState').text() === 'success' ? Translate('IDCS_SUCCESS') : Translate('IDCS_FAILED')
            timer.repeat()
        }

        /**
         * @description 约束域名的输入
         * @param {string} domainName
         * @returns {string}
         */
        const formatDomainName = (domainName: string) => {
            return domainName.replace(/[\u4E00-\u9FA5]/g, '')
        }

        onMounted(async () => {
            openLoading()

            await getNetConfig()
            await getData()
            timer.repeat()

            closeLoading()
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
