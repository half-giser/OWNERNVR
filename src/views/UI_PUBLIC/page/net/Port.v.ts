/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:47:07
 * @Description: 网络端口
 */
import { NetPortForm, NetPortUPnPDto, NetPortApiServerForm, NetPortRtspServerForm } from '@/types/apiType/net'
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()

        // 认证方式与显示文本的映射
        const VERIFICATION_MAPPING: Record<string, string> = {
            Basic: Translate('IDCS_BASE64'),
            Digest: Translate('IDCS_MD5'),
        }

        const portFormRef = useFormRef()
        const portFormData = ref(new NetPortForm())
        const portFormRule = ref<FormRules>({
            httpPort: [
                {
                    validator(_rules, value: number, callback) {
                        const error = validatePort('httpPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            httpsPort: [
                {
                    validator(_rules, value: number, callback) {
                        const error = validatePort('httpsPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            netPort: [
                {
                    validator(_rules, value: number, callback) {
                        const error = validatePort('netPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            posPort: [
                {
                    validator(_rules, value: number, callback) {
                        const error = validatePort('posPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const apiServerFormData = ref(new NetPortApiServerForm())

        const rtspServerFormRef = useFormRef()
        const rtspServerFormData = ref(new NetPortRtspServerForm())
        const rtspServerFormRule = ref<FormRules>({
            rtspPort: [
                {
                    validator(_rules, value: number, callback) {
                        const error = validatePort('rtspPort', Number(value))
                        if (error) {
                            callback(new Error(error))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            // UI1-E客户定制，页面不显示apiserver
            isAppServer: import.meta.env.VITE_UI_TYPE === 'UI1-E',
            // 系统保留端口
            reservedPort: [] as number[],
            //poe switch功能保留端口范围
            reservedPortRange: [] as [number, number][],
            // upnp 数据
            upnp: new NetPortUPnPDto(),
            // P2P 无线
            wirelessSwitch: false,
            // 是否显示Pos端口选项
            isPosPort: systemCaps.supportPOS,
            // 是否显示启用虚拟主机选项
            isVirtualPortEnabled: systemCaps.poeChlMaxCount > 0,
            // 端口表单发生改变
            isPortFormChanged: false,
            // API服务表单发生改变
            isApiServerFormChanged: false,
            // RTSP服务表单发生改变
            isRtspServerFormChanged: false,
            // 是否请求数据借宿
            mounted: false,
            // API服务认证方式选项
            apiVerificationOptions: [] as SelectOption<string, string>[],
            // RTSP服务认证方式选项
            rtspAuthenticationOptions: [] as SelectOption<string, string>[],
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            await getPortData()
            await getWirelessNetworkData()
            await getUPnPData()
            await getApiServerData()
            await getRtspServerData()

            closeLoading()

            nextTick(() => {
                pageData.value.mounted = true
            })
        }

        /**
         * @description 验证端口表单
         */
        const validatePortForm = () => {
            return new Promise((resolve) => {
                portFormRef.value!.validate((valid) => {
                    resolve(valid)
                })
            })
        }

        /**
         * @description 验证RTSP服务表单
         */
        const validateRtspPortForm = () => {
            return new Promise((resolve) => {
                rtspServerFormRef.value!.validate((valid) => {
                    resolve(valid)
                })
            })
        }

        /**
         * @description 提交表单
         */
        const setData = async () => {
            const valid1 = await validatePortForm()
            const valid2 = await validateRtspPortForm()
            if (!valid1 || !valid2) {
                return
            }

            openLoading()

            const res1 = await setPortData()
            const res2 = await setApiServerData()
            const res3 = await setRtspServerData()
            const res4 = await setUPnPData()

            closeLoading()

            if (res1 && res2 && res3 && res4) {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }

            pageData.value.mounted = false
            pageData.value.isPortFormChanged = false
            pageData.value.isApiServerFormChanged = false
            pageData.value.isRtspServerFormChanged = false

            getData()
        }

        /**
         * @description 获取端口表单数据
         */
        const getPortData = async () => {
            const result = await queryNetPortCfg()
            commLoadResponseHandler(result, ($) => {
                portFormData.value.httpPort = $('content/httpPort').text().num()
                portFormData.value.httpsPort = $('content/httpsPort').text().num()
                portFormData.value.netPort = $('content/netPort').text().num()
                portFormData.value.posPort = $('content/posPort').text().num()
                // portFormData.value.rtspPort = $("//rtspPort").text().num()
                portFormData.value.virtualHostEnabled = $('content/virtualHostEnabled').text().bool()

                const reservedPort = $('content/reservedPort').text().split(',')
                pageData.value.reservedPort = []
                pageData.value.reservedPortRange = []
                reservedPort.forEach((item) => {
                    const regNum = /^\d+$/
                    const regRange = /^\d+-\d+$/
                    if (regNum.test(item)) {
                        pageData.value.reservedPort.push(Number(item))
                    }

                    if (regRange.test(item)) {
                        const temp = item.split('-')
                        pageData.value.reservedPortRange.push([Number(temp[0]), Number(temp[1])])
                    }
                })
            })
        }

        const PORT_ERROR_MAPPING: [string, string, string][] = [
            ['httpPort', 'netPort', 'IDCS_PROMPT_HTTP_DATA_THE_SAME_PORT'],
            ['httpPort', 'rtspPort', 'IDCS_PROMPT_HTTP_RTSP_THE_SAME_PORT'],
            ['netPort', 'rtspPort', 'IDCS_PROMPT_DATA_RTSP_THE_SAME_PORT'],
            ['httpPort', 'posPort', 'IDCS_POS_DATA_HTTP_THE_SAME_PORT'],
            ['httpsPort', 'posPort', 'IDCS_POS_DATA_HTTPS_THE_SAME_PORT'],
            ['netPort', 'posPort', 'IDCS_POS_DATA_PROMPT_THE_SAME_PORT'],
            ['rtspPort', 'posPort', 'IDCS_POS_DATA_RTSP_THE_SAME_PORT'],
            ['httpPort', 'httpsPort', 'IDCS_PROMPT_HTTPS_HTTP_THE_SAME_PORT'],
            ['httpsPort', 'netPort', 'IDCS_PROMPT_HTTPS_DATA_THE_SAME_PORT'],
            ['httpsPort', 'rtspPort', 'IDCS_PROMPT_HTTPS_RTSP_THE_SAME_PORT'],
        ]

        /**
         * @description 认证端口是否合法
         * @param {string} param 端口名
         * @param {number} value 端口值
         */
        const validatePort = (param: string, value: number) => {
            const portValue: [string, number][] = [
                ['httpPort', portFormData.value.httpPort],
                ['httpsPort', portFormData.value.httpsPort],
                ['netPort', portFormData.value.netPort],
                ['rtspPort', rtspServerFormData.value.rtspPort],
                ['posPort', portFormData.value.posPort],
            ]
            const findSamePort = portValue.find((port) => port[1] === value && port[0] !== param)
            if (findSamePort) {
                const errorText = PORT_ERROR_MAPPING.find((item) => {
                    return (item[0] === findSamePort[0] && item[1] === param) || (item[0] === param && item[1] === findSamePort[0])
                })
                if (errorText) {
                    return Translate(errorText[2])
                }
            }
            const isReservedPort = pageData.value.reservedPort.includes(value)
            if (isReservedPort) {
                return Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)
            }
            const isReservedPortRange = pageData.value.reservedPortRange.some((item) => value >= item[0] && value <= item[1])
            if (isReservedPortRange) {
                return Translate('IDCS_SYSTEM_RESERVED_PORT').formatForLang(value)
            }
            return ''
        }

        /**
         * @description 提交端口表单数据
         */
        const setPortData = async () => {
            if (!pageData.value.isPortFormChanged) {
                return true
            }
            const sendXml = rawXml`
                <content>
                    <httpPort>${portFormData.value.httpPort}</httpPort>
                    <httpsPort>${portFormData.value.httpsPort}</httpsPort>
                    <netPort>${portFormData.value.netPort}</netPort>
                    <posPort>${portFormData.value.posPort}</posPort>
                    <virtualHostEnabled>${portFormData.value.virtualHostEnabled}</virtualHostEnabled>
                </content>
            `
            const result = await editNetPortCfg(sendXml)
            const $ = queryXml(result)

            return $('status').text() === 'success'
        }

        /**
         * @description P2P获取无线网络数据
         */
        const getWirelessNetworkData = async () => {
            if (userSession.appType === 'P2P') {
                const result = await queryWirelessNetworkCfg()
                const $ = queryXml(result)
                pageData.value.wirelessSwitch = $('content/switch').text().bool()
            }
        }

        /**
         * @description 获取UPnP数据
         */
        const getUPnPData = async () => {
            const result = await queryUPnPCfg()
            const $ = queryXml(result)
            pageData.value.upnp = {
                switch: $('content/switch').text(),
                mappingType: $('content/mappingType').text(),
                portsType: $('content/ports').attr('type'),
                ports: $('content/ports/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        portType: $item('portType').text(),
                        externalPort: $item('externalPort').text(),
                        externalIP: $item('externalIP').text(),
                        localPort: $item('localPort').text(),
                        status: $item('status').text(),
                    }
                }),
            }
        }

        /**
         * @description 更新UPnP数据
         */
        const setUPnPData = async () => {
            if (!pageData.value.isPortFormChanged && !pageData.value.isApiServerFormChanged && !pageData.value.isRtspServerFormChanged) {
                return true
            }
            const portTypeMapping: Record<string, number> = {
                HTTP: portFormData.value.httpPort,
                HTTPS: portFormData.value.httpsPort,
                RTSP: rtspServerFormData.value.rtspPort,
                SERVICE: portFormData.value.netPort,
                POS: portFormData.value.posPort,
            }

            const sendXml = rawXml`
                <types>
                    <mappingType>${wrapEnums(['auto', 'manually'])}</mappingType>
                    <portType>${wrapEnums(['HTTP', 'HTTPS', 'RTSP', 'SERVICE', 'POS'])}</portType>
                    <statusType>${wrapEnums(['effective', 'ineffective'])}</statusType>
                </types>
                <content>
                    <switch>${pageData.value.upnp.switch}</switch>
                    <mappingType type='mappingType'>${pageData.value.upnp.mappingType}</mappingType>
                    <ports type='list'>
                        <itemType>
                            <portType type='portType'/>
                            <status type='statusType'/>
                        </itemType>
                        ${pageData.value.upnp.ports
                            .map((item) => {
                                const externalPort = pageData.value.upnp.mappingType === 'auto' ? portTypeMapping[item.portType] : item.externalPort
                                return rawXml`
                                    <item>
                                        <portType>${item.portType}</portType>
                                        <externalPort>${externalPort}</externalPort>
                                        ${item.externalIP ? `<externalIP>${item.externalIP}</externalIP>` : ''}
                                        <localPort>${item.localPort}</localPort>
                                        <status>${item.status}</status>
                                    </item>
                                `
                            })
                            .join('')}
                    </ports>
                </content>
            `
            const result = await editUPnPCfg(sendXml)
            const $ = queryXml(result)

            return $('status').text() === 'success'
        }

        /**
         * @description 获取API服务表单数据
         */
        const getApiServerData = async () => {
            const result = await queryApiServer()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.apiVerificationOptions = $('types/authenticationType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: VERIFICATION_MAPPING[item.text()],
                    }
                })
                apiServerFormData.value.apiserverSwitch = $('content/apiserverSwitch').text().bool()
                apiServerFormData.value.authenticationType = $('content/authenticationType').text()
            }
        }

        /**
         * @description 更新API服务表单数据
         */
        const setApiServerData = async () => {
            if (!pageData.value.isApiServerFormChanged) {
                return true
            }

            const sendXml = rawXml`
                <content>
                    <apiserverSwitch>${apiServerFormData.value.apiserverSwitch}</apiserverSwitch>
                    <authenticationType>${apiServerFormData.value.authenticationType}</authenticationType>
                </content>
            `
            const result = await editApiServer(sendXml)
            const $ = queryXml(result)

            return $('status').text() === 'success'
        }

        /**
         * @description 启用API服务时，提示启用RTSP服务
         */
        const changeApiServerSwitch = () => {
            if (apiServerFormData.value.apiserverSwitch && !rtspServerFormData.value.rtspServerSwitch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_ENABLE_API_AFTER_RTSP_TIP'),
                }).then(() => {
                    rtspServerFormData.value.rtspServerSwitch = true
                })
            }
        }

        /**
         * @description 获取RTSP服务表单数据
         */
        const getRtspServerData = async () => {
            const result = await queryRTSPServer()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.rtspAuthenticationOptions = $('types/authenticationType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: VERIFICATION_MAPPING[item.text()],
                    }
                })
                rtspServerFormData.value.rtspServerSwitch = $('content/rtspServerSwitch').text().bool()
                rtspServerFormData.value.rtspAuthType = $('content/rtspAuthType').text()
                rtspServerFormData.value.rtspPort = $('content/rtspPort').text().num()
                rtspServerFormData.value.anonymousAccess = $('content/anonymousAccess').text().bool()
            }
        }

        /**
         * @description 更新RTSP表单数据
         */
        const setRtspServerData = async () => {
            if (!pageData.value.isRtspServerFormChanged) {
                return true
            }

            const sendXml = rawXml`
                <content>
                    <rtspServerSwitch>${rtspServerFormData.value.rtspServerSwitch}</rtspServerSwitch>
                    <rtspAuthType>${rtspServerFormData.value.rtspAuthType}</rtspAuthType>
                    <rtspPort>${rtspServerFormData.value.rtspPort}</rtspPort>
                    <anonymousAccess>${rtspServerFormData.value.anonymousAccess}</anonymousAccess>
                </content>
            `
            const result = await editRTSPServer(sendXml)
            const $ = queryXml(result)

            return $('status').text() === 'success'
        }

        /**
         * @description RTSP服务启用时，打开提示
         */
        const changeRtspServerSwitch = () => {
            if (rtspServerFormData.value.rtspServerSwitch) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_RTSP_OR_FTP_ENABLE_REMIND'),
                })
            }
        }

        /**
         * @description 启用匿名登录观看视频时，打开提示
         */
        const changeAnonymous = () => {
            if (rtspServerFormData.value.anonymousAccess) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_ANONYMOUS_LOGIN_REMIND'),
                })
            }
        }

        watch(
            portFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isPortFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        watch(
            apiServerFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isApiServerFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        watch(
            rtspServerFormData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.isRtspServerFormChanged = true
                }
            },
            {
                deep: true,
            },
        )

        onMounted(() => {
            getData()
        })

        return {
            portFormData,
            portFormRef,
            portFormRule,
            pageData,
            apiServerFormData,
            rtspServerFormData,
            rtspServerFormRef,
            rtspServerFormRule,
            setData,
            changeApiServerSwitch,
            changeAnonymous,
            changeRtspServerSwitch,
        }
    },
})
