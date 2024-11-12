/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 18:56:58
 * @Description: TCP/IP配置页
 */
import { NetTcpIpForm, NetTcpIpDhcpList, NetTcpIpBondsList, type NetTcpIpNicConfigList, type NetTcpIpAdvanceForm } from '@/types/apiType/net'
import { type CheckboxValueType } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import TcpIpAdvancePop from './TcpIpAdvancePop.vue'

export default defineComponent({
    components: {
        TcpIpAdvancePop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // POE模式选项
            poeModeOptions: [
                {
                    label: Translate('IDCS_LONG_MODE'),
                    value: 10,
                },
                {
                    label: Translate('IDCS_NO_LONG_MODE'),
                    value: 100,
                },
            ],
            // 工作模式选项
            workModeOptions: [
                {
                    label: Translate('IDCS_MULTIPLE_ADDRESS_SETTING'),
                    value: 'multiple_address_setting',
                },
                {
                    label: Translate('IDCS_NETWORK_FAULT_TOLERANCE'),
                    value: 'network_fault_tolerance',
                },
            ],
            // 当前网络容错索引
            bondIndex: 0,
            // 当前多址设定索引
            nicIndex: 0,
            // 是否Poe
            isPoe: false,
            // 是否开启PPPoE
            pppoeSwitch: false,
            // 3535A:即支持网络容错又存在poe网卡切换到网络容错需要显示ethList
            toleranceAndPoe: false,
            hasPoeNic: false,
            // 是否显示高级配置弹窗
            isAdvancePop: false,
        })

        // DHCP数据
        const dhcpData = ref({
            bonds: [] as NetTcpIpDhcpList[],
            nicConfigs: [] as NetTcpIpDhcpList[],
        })

        const formData = ref(new NetTcpIpForm())

        let cacheData: NetTcpIpForm

        /**
         * @description 获取工作模式选项是否显示
         * @param {string} mode
         */
        const getWorkModeVisible = (mode: string) => {
            return (
                (mode === 'multiple_address_setting' && formData.value.netConfig.supportNetworkMultiAddrSetting) ||
                (mode === 'network_fault_tolerance' && formData.value.netConfig.supportNetworkFaultTolerance)
            )
        }

        /**
         * @description 显示多址设定名称
         * @param {NetTcpIpNicConfigList} item
         * @returns {string}
         */
        const displayNicName = (item: NetTcpIpNicConfigList) => {
            return item.isPoe ? Translate('IDCS_POE_ETH_NAME') : Translate('IDCS_ETH_NAME').formatForLang(item.index + 1)
        }

        /**
         * @description 网口状态文本显示
         * @param {NetTcpIpNicConfigList} item
         * @returns {String}
         */
        const displayNicStatus = (item: NetTcpIpNicConfigList) => {
            return item.isOnline ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE')
        }

        /**
         * @description 获取DHCP
         */
        const getNetStatus = async () => {
            const result = await queryNetStatus()
            const $ = queryXml(result)

            const DEFAULT_DATA = new NetTcpIpDhcpList()

            if (!formData.value.ipGroupSwitch) {
                dhcpData.value.bonds.push({ ...DEFAULT_DATA })
            } else {
                formData.value.bonds.forEach((bond) => {
                    const data = { ...DEFAULT_DATA }
                    const item = $(`//content/bonds/item[@id="${bond.id}"]`)
                    if (!item.length) {
                        return
                    }
                    const $item = queryXml(item[0].element)
                    if (bond.dhcpSwitch) {
                        data.ip = $item('ip').text()
                        data.gateway = $item('gateway').text()
                        data.mask = $item('mask').text()
                        if (bond.ipv4DnsDhcpSwitch) {
                            data.dns1 = $item('dns1').text()
                            data.dns2 = $item('dns2').text()
                        }

                        if (bond.ipV6Switch) {
                            data.ipV6 = $item('ipV6').text()
                            data.gatewayV6 = $item('gatewayV6').text()
                            data.subLengthV6 = Number($item('subLengthV6').text())
                            if (bond.ipv6DnsDhcpSwitch) {
                                data.ipv6Dns1 = $item('ipv6Dns1').text()
                                data.ipv6Dns2 = $item('ipv6Dns2').text()
                            }
                        }
                    }
                    dhcpData.value.bonds.push(data)
                })
            }

            formData.value.nicConfigs.forEach((config) => {
                if (config.isPoe) {
                    return
                }
                const data = { ...DEFAULT_DATA }
                const item = $(`//content/nic/item[@id="${config.id}"]`)
                if (!item.length) {
                    return
                }
                const $item = queryXml(item[0].element)
                if (config.dhcpSwitch) {
                    data.ip = $item('ip').text()
                    data.gateway = $item('gateway').text()
                    data.mask = $item('mask').text()
                    if (config.ipv4DnsDhcpSwitch) {
                        data.dns1 = $item('dns1').text()
                        data.dns2 = $item('dns2').text()
                    }

                    if (config.ipV6Switch) {
                        data.ipV6 = $item('ipV6').text()
                        data.gatewayV6 = $item('gatewayV6').text()
                        data.subLengthV6 = Number($item('subLengthV6').text())
                        if (config.ipv6DnsDhcpSwitch) {
                            data.ipv6Dns1 = $item('ipv6Dns1').text()
                            data.ipv6Dns2 = $item('ipv6Dns2').text()
                        }
                    }
                }
                dhcpData.value.nicConfigs.push(data)
            })
        }

        /**
         * @description 获取配置数据
         */
        const getNetConfigV3 = async () => {
            const result = await queryNetCfgV3()
            const $ = queryXml(result)
            const $content = queryXml($('//content')[0].element)
            formData.value.netConfig.defaultNic = $content('defaultNic').text()
            formData.value.netConfig.poeMode = Number($content('poeMode').text())
            formData.value.netConfig.supportNetworkFaultTolerance = $content('supportNetworkFaultTolerance').text().toBoolean()
            formData.value.netConfig.supportNetworkMultiAddrSetting = $content('supportNetworkMultiAddrSetting').text().toBoolean()
            formData.value.netConfig.toeEnable = $content('toeEnable').text().toBoolean()
            formData.value.netConfig.curWorkMode = $content('curWorkMode').text()
            formData.value.ipGroupSwitch = $content('ipGroupConfig/switch').text().toBoolean()
            formData.value.ipGroupMode = $content('ipGroupConfig/mode').text()
            formData.value.ipDefaultBond = $content('ipGroupConfig/defaultBond').text()
            formData.value.bonds = $content('ipGroupConfig/bonds/item').map((item, index) => {
                const $item = queryXml(item.element)
                return {
                    index: index,
                    id: item.attr('id')!,
                    dhcpSwitch: $item('dhcpSwitch').text().toBoolean(),
                    primaryNIC: $item('primaryNIC').text(),
                    NICs: $item('NICs').text(),
                    ip: $item('ip').text(),
                    gateway: $item('gateway').text(),
                    mask: $item('mask').text(),
                    mtu: Number($item('mtu').text()),
                    ipV6Switch: $item('ipV6Switch').text().toBoolean(),
                    ipV6: $item('ipV6').text(),
                    gatewayV6: $item('gatewayV6').text(),
                    subLengthV6: Number($item('subLengthV6').text()),
                    ipv4DnsDhcpSwitch: $item('dhcpSwitch').text().toBoolean() ? $item('ipv4DnsDhcpSwitch').text().toBoolean() : false,
                    dns1: $item('dns1').text(),
                    dns2: $item('dns2').text() || '0.0.0.0',
                    ipv6DnsDhcpSwitch: $item('dhcpSwitch').text().toBoolean() ? $item('ipv6DnsDhcpSwitch').text().toBoolean() : false,
                    ipv6Dns1: $item('ipv6Dns1').text(),
                    ipv6Dns2: $item('ipv6Dns2').text(),
                    isPoe: false, // 手动加一个属性ipGroupConfig走的逻辑也是非poe类型
                }
            })
            formData.value.nicConfigs = $content('nicConfigs/item').map((item, index) => {
                const $item = queryXml(item.element)
                if (item.attr('isPoe')!.toBoolean()) {
                    pageData.value.hasPoeNic = true
                    pageData.value.nicIndex = index
                }
                return {
                    index: index,
                    id: item.attr('id')!,
                    isPoe: item.attr('isPoe')!.toBoolean(),
                    isSupSecondIP: item.attr('isSupSecondIP')!.toBoolean(),
                    isSupMultiWorkMode: item.attr('isSupMultiWorkMode')!.toBoolean(),
                    dhcpSwitch: $item('dhcpSwitch').text().toBoolean(),
                    ip: $item('ip').text(),
                    gateway: $item('gateway').text(),
                    mask: $item('mask').text(),
                    mac: $item('mac').text(),
                    mtu: Number($item('mtu').text()),
                    ipV6Switch: $item('ipV6Switch').text().toBoolean(),
                    ipV6: $item('ipV6').text(),
                    gatewayV6: $item('gatewayV6').text(),
                    subLengthV6: Number($item('subLengthV6').text()),
                    isOnline: $item('isOnline').text().toBoolean(),
                    ipv4DnsDhcpSwitch: $item('dhcpSwitch').text().toBoolean() ? $item('ipv4DnsDhcpSwitch').text().toBoolean() : false,
                    dns1: $item('dns1').text(),
                    dns2: $item('dns2').text() || '0.0.0.0',
                    ipv6DnsDhcpSwitch: $item('ipv6DnsDhcpSwitch').text().toBoolean(),
                    ipv6Dns1: $item('ipv6Dns1').text(),
                    ipv6Dns2: $item('ipv6Dns2').text(),
                    secondIpSwitch: $item('dhcpSwitch').text().toBoolean() ? $item('secondIpSwitch').text().toBoolean() : false,
                    secondIp: $item('secondIp').text(),
                    secondMask: $item('secondMask').text(),
                }
            })

            cacheData = cloneDeep(formData.value)
            pageData.value.toleranceAndPoe = pageData.value.hasPoeNic && formData.value.netConfig.supportNetworkFaultTolerance
        }

        /**
         * @description 当前表单显示数据
         */
        const current = computed(() => {
            const mode = formData.value.netConfig.curWorkMode
            let item, dhcp
            if (mode === 'multiple_address_setting' && formData.value.nicConfigs.length) {
                item = { ...formData.value.nicConfigs[pageData.value.nicIndex] }
                dhcp = dhcpData.value.nicConfigs[item.index]
            } else if (mode === 'network_fault_tolerance') {
                if (pageData.value.toleranceAndPoe) {
                    item = { ...formData.value.nicConfigs[pageData.value.nicIndex] }
                    dhcp = dhcpData.value.nicConfigs[item.index]
                } else if (formData.value.bonds.length) {
                    item = { ...formData.value.bonds[pageData.value.bondIndex] }
                    dhcp = dhcpData.value.bonds[item.index]
                } else {
                    return new NetTcpIpBondsList()
                }
            } else {
                return new NetTcpIpBondsList()
            }

            if (item.dhcpSwitch) {
                item.ip = dhcp.ip
                item.mask = dhcp.mask
                item.gateway = dhcp.gateway
                item.ipV6 = dhcp.ipV6
                item.subLengthV6 = dhcp.subLengthV6
                item.gatewayV6 = dhcp.gatewayV6

                if (item.ipv4DnsDhcpSwitch) {
                    item.dns1 = dhcp.dns1
                    item.dns2 = dhcp.dns2
                }

                if (item.ipv4DnsDhcpSwitch) {
                    item.ipv6Dns1 = dhcp.ipv6Dns1
                    item.ipv6Dns2 = dhcp.ipv6Dns2
                }
            }

            if (!item.ipV6Switch) {
                item.ipV6 = ''
                item.subLengthV6 = 0
                item.gatewayV6 = ''
            }
            return item
        })

        /**
         * @description 更改表单数据
         * @param {String | Number} value
         * @param {String} key
         */
        const changeData = (value: string | number | undefined, key: keyof NetTcpIpDhcpList) => {
            if (formData.value.netConfig.curWorkMode === 'multiple_address_setting') {
                formData.value.nicConfigs[pageData.value.nicIndex][key] = value
            } else {
                if (pageData.value.toleranceAndPoe) {
                    formData.value.nicConfigs[pageData.value.nicIndex][key] = value
                } else {
                    formData.value.bonds[pageData.value.bondIndex][key] = value
                }
            }
        }

        /**
         * @description 更改表单数据
         * @param {Boolean} value
         * @param {String} key
         */
        const changeSwitch = (value: CheckboxValueType, key: 'dhcpSwitch' | 'ipv4DnsDhcpSwitch' | 'ipv6DnsDhcpSwitch' | 'ipV6Switch') => {
            if (formData.value.netConfig.curWorkMode === 'multiple_address_setting') {
                formData.value.nicConfigs[pageData.value.nicIndex][key] = !!value
                if (key === 'dhcpSwitch' && !value) {
                    formData.value.nicConfigs[pageData.value.nicIndex].ipv4DnsDhcpSwitch = false
                    formData.value.nicConfigs[pageData.value.nicIndex].ipv6DnsDhcpSwitch = false
                }
            } else {
                formData.value.bonds[pageData.value.bondIndex][key] = !!value
                if (key === 'dhcpSwitch' && !value) {
                    formData.value.bonds[pageData.value.bondIndex].ipv4DnsDhcpSwitch = false
                    formData.value.bonds[pageData.value.bondIndex].ipv6DnsDhcpSwitch = false
                }
            }
        }

        /**
         * @description 关闭IPV6，显示提示弹窗
         */
        const handleChangeIpV6Switch = () => {
            if (!current.value.ipV6Switch) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_IPV6_NETWORK_CLOSE_TIP').formatForLang('IPv6'),
                }).catch(() => {
                    changeSwitch(!current.value.ipV6Switch, 'ipV6Switch')
                })
            }
        }

        /**
         * @description POE模式切换，显示弹窗
         */
        const handleChangePoeMode = () => {
            openMessageBox({
                type: 'info',
                message: Translate('IDCS_POE_MODE_VALUE').formatForLang(formData.value.netConfig.poeMode),
            })
        }

        // 是否POE
        const isPoe = computed(() => {
            return systemCaps.supportModifyPoeMode && current.value.isPoe
        })

        // 是否支持POE
        const poeEnabled = computed(() => {
            return !pageData.value.pppoeSwitch || isPoe.value
        })

        /**
         * @description 获取PPPoE状态
         */
        const getPPPoeSwitch = async () => {
            const result = await queryPPPoECfg()
            const $ = queryXml(result)
            pageData.value.pppoeSwitch = $('//content/switch').text().toBoolean()
        }

        /**
         * @description 验证提示需要重启
         */
        const verifyRebootParam = async () => {
            const rule = [
                {
                    message: Translate('IDCS_WORK_PATTERN_EDIT_AFTER_REBOOT'),
                    check: () => formData.value.netConfig.curWorkMode !== cacheData.netConfig.curWorkMode,
                    cancel: () => {
                        formData.value.netConfig.curWorkMode = cacheData.netConfig.curWorkMode
                    },
                },
                {
                    message: Translate('IDCS_MTU_EDIT_AFTER_REBOOT'),
                    check: () => {
                        if (formData.value.netConfig.curWorkMode === 'network_fault_tolerance') {
                            return formData.value.bonds.some((item, index) => {
                                return item.mtu !== cacheData.bonds[index].mtu
                            })
                        } else {
                            return formData.value.nicConfigs.some((item, index) => {
                                return item.mtu !== cacheData.nicConfigs[index].mtu
                            })
                        }
                    },
                    cancel: () => {},
                },
            ]

            for (let i = 0; i < rule.length; i++) {
                if (rule[i].check()) {
                    try {
                        await openMessageBox({
                            type: 'question',
                            message: rule[i].message,
                        })
                    } catch {
                        rule[i].cancel()
                        return false
                    }
                }
            }

            return true
        }

        /**
         * @description 验证参数合法性
         */
        const verifyParams = () => {
            // 网络容错和多址模式的参数分开发送，分开校验
            if (formData.value.netConfig.curWorkMode === 'network_fault_tolerance') {
                const flag = formData.value.bonds.every((item) => {
                    // 开启ipv6且未勾选自动获取校验ipv6相关地址
                    if (item.ipV6Switch && !item.dhcpSwitch) {
                        if (!item.ipV6.trim().length) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_IPV6_ADDRESS_EMPTY'),
                            })
                            return false
                        }

                        if (!checkIpV6(item.ipV6)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                            })
                            return false
                        }

                        if (item.gatewayV6 && !checkIpV6(item.gatewayV6)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                            })
                            return false
                        }
                    }

                    // 开启ipv6且dns自动获取未开启
                    if (item.ipV6Switch && !item.ipv6DnsDhcpSwitch) {
                        if (item.ipv6Dns1 && !checkIpV6(item.ipv6Dns1)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                            })
                            return false
                        }

                        if (item.ipv6Dns2 && !checkIpV6(item.ipv6Dns2)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                            })
                            return false
                        }
                    }

                    if (pageData.value.toleranceAndPoe) {
                        if (isEqualIPAddress(item.ip, item.mask, item.ip, item.mask)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_ERROR_IP_SAME_NETWORK_SEGMAENT'),
                            })
                            return false
                        }
                    }

                    return true
                })
                if (!flag) {
                    return false
                }
            } else {
                const ipv4Arr: string[] = []
                const ipv6Arr: string[] = []
                const flag = formData.value.nicConfigs.every((item) => {
                    // poe网口不能配置ipv6,无需校验
                    if (!item.isPoe) {
                        // 未勾选自动获取开关时，判断ipv4地址是否相同
                        if (!item.dhcpSwitch) {
                            if (ipv4Arr.includes(item.ip)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_THE_SAME_IP_ADDRESS').formatForLang('IPv4'),
                                })
                                return false
                            }
                            ipv4Arr.push(item.ip)
                        }

                        // 开启ipv6且未勾选自动获取校验ipv6相关地址
                        if (item.ipV6Switch && !item.dhcpSwitch) {
                            if (!item.ipV6.trim().length) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_IPV6_ADDRESS_EMPTY'),
                                })
                                return false
                            }

                            if (!checkIpV6(item.ipV6)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                                })
                                return false
                            }

                            if (item.gatewayV6 && !checkIpV6(item.gatewayV6)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                                })
                                return false
                            }

                            if (ipv6Arr.includes(item.ipV6)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_THE_SAME_IP_ADDRESS'),
                                })
                                return false
                            }
                            ipv6Arr.push(item.ipV6)
                        }

                        // 开启ipv6且dns自动获取未开启
                        if (item.ipV6Switch && !item.ipv6DnsDhcpSwitch) {
                            if (item.ipv6Dns1 && !checkIpV6(item.ipv6Dns1)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                                })
                                return false
                            }

                            if (item.ipv6Dns2 && !checkIpV6(item.ipv6Dns2)) {
                                openMessageBox({
                                    type: 'info',
                                    message: Translate('IDCS_PROMPT_IPADDRESS_V6_INVALID'),
                                })
                                return false
                            }
                        }
                    } else {
                        // poe地址最后一位不能大于100
                        if (Number(item.ip.split('')[3]) >= 100) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_ERROR_IP_LAST_FIELD_NEED_LESSTHAN100'),
                            })
                            return false
                        }
                    }

                    if (item.isSupSecondIP) {
                        if (item.secondIp === item.ip) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_PROMPT_THE_SAME_IPADDRESS').formatForLang(Translate('IDCS_ETH0_NAME')),
                            })
                            return false
                        }
                    }
                    return true
                })
                if (!flag) {
                    return false
                }
                const ethIpAndMask = formData.value.nicConfigs.filter((item) => !item.isPoe)
                const poeIpAndMask = formData.value.nicConfigs.find((item) => item.isPoe)
                if (poeIpAndMask) {
                    const flag = ethIpAndMask.every((item) => {
                        if (isEqualIPAddress(item.ip, item.mask, poeIpAndMask.ip, poeIpAndMask.mask)) {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_ERROR_IP_SAME_NETWORK_SEGMAENT'),
                            })
                            return false
                        }
                        return true
                    })
                    if (!flag) {
                        return false
                    }
                }
            }
            return true
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            if (!verifyParams()) {
                return
            }
            const flag = await verifyRebootParam()
            if (!flag) {
                return
            }

            openLoading()

            let sendXml = ''
            if (formData.value.netConfig.curWorkMode === 'network_fault_tolerance') {
                if (!pageData.value.pppoeSwitch) {
                    const bonds = formData.value.bonds
                        .map((item) => {
                            return rawXml`
                                <item id="${item.id}">
                                    <dhcpSwitch>${item.dhcpSwitch}</dhcpSwitch>
                                    <primaryNIC>${item.primaryNIC}</primaryNIC>
                                    <NICs>${item.NICs}</NICs>
                                    <ip>${item.ip}</ip>
                                    <gateway>${item.gateway}</gateway>
                                    <mask>${item.mask}</mask>
                                    <mtu>${item.mtu}</mtu>
                                    <ipV6Switch>${item.ipV6Switch}</ipV6Switch>
                                    <ipV6>${item.ipV6}</ipV6>
                                    <gatewayV6>${item.gatewayV6}</gatewayV6>
                                    <subLengthV6>${item.subLengthV6}</subLengthV6>
                                    <ipv4DnsDhcpSwitch>${item.ipv4DnsDhcpSwitch}</ipv4DnsDhcpSwitch>
                                    <dns1>${item.dns1}</dns1>
                                    <dns2>${item.dns2}</dns2>
                                    <ipv6DnsDhcpSwitch>${item.ipv6DnsDhcpSwitch}</ipv6DnsDhcpSwitch>
                                    <ipv6Dns1>${item.ipv6Dns1}</ipv6Dns1>
                                    <ipv6Dns2>${item.ipv6Dns2}</ipv6Dns2>
                                </item>
                            `
                        })
                        .join('')
                    sendXml = rawXml`
                        <ipGroupConfig>
                            <switch>true</switch>
                            <mode>${formData.value.netConfig.curWorkMode}</mode>
                            <defaultBond>${formData.value.ipDefaultBond}</defaultBond>
                            <bonds type="list">${bonds}</bonds>
                        </ipGroupConfig>
                    `
                }

                if (pageData.value.toleranceAndPoe) {
                    const nic = formData.value.nicConfigs
                        .map((item) => {
                            // 开启pppoe开关后只发送poe网口的数据
                            if (!item.isPoe) {
                                return ''
                            }
                            return rawXml`
                                <item id="${item.id}">
                                    <dhcpSwitch>${item.dhcpSwitch}</dhcpSwitch>
                                    <ip>${item.ip}</ip>
                                    <gateway>${item.gateway}</gateway>
                                    <mask>${item.mask}</mask>
                                    <mac>${item.mac}</mac>
                                    <mtu>${item.mtu}</mtu>
                                    <ipV6Switch>${item.ipV6Switch}</ipV6Switch>
                                    <ipV6>${item.ipV6}</ipV6>
                                    <gatewayV6>${item.gatewayV6}</gatewayV6>
                                    <subLengthV6>${item.subLengthV6}</subLengthV6>
                                    <ipv4DnsDhcpSwitch>${item.ipv4DnsDhcpSwitch}</ipv4DnsDhcpSwitch>
                                    <dns1>${item.dns1}</dns1>
                                    <dns2>${item.dns2}</dns2>
                                    <ipv6DnsDhcpSwitch>${item.ipv6DnsDhcpSwitch}</ipv6DnsDhcpSwitch>
                                    <ipv6Dns1>${item.ipv6Dns1}</ipv6Dns1>
                                    <ipv6Dns2>${item.ipv6Dns2}</ipv6Dns2>
                                </item>
                            `
                        })
                        .join('')
                    sendXml = `<nicConfigs>${nic}</nicConfigs>`
                }
            } else {
                const nic = formData.value.nicConfigs
                    .map((item) => {
                        if (pageData.value.pppoeSwitch && !item.isPoe) {
                            return ''
                        }
                        return rawXml`
                            <item id="${item.id}">
                                <dhcpSwitch>${item.dhcpSwitch}</dhcpSwitch>
                                <ip>${item.ip}</ip>
                                <gateway>${item.gateway}</gateway>
                                <mask>${item.mask}</mask>
                                <mac>${item.mac}</mac>
                                <mtu>${item.mtu}</mtu>
                                <ipV6Switch>${item.ipV6Switch}</ipV6Switch>
                                <ipV6>${item.ipV6}</ipV6>
                                <gatewayV6>${item.gatewayV6}</gatewayV6>
                                <subLengthV6>${item.subLengthV6}</subLengthV6>
                                <ipv4DnsDhcpSwitch>${item.ipv4DnsDhcpSwitch}</ipv4DnsDhcpSwitch>
                                <dns1>${item.dns1}</dns1>
                                <dns2>${item.dns2 === '0.0.0.0' ? '' : item.dns2}</dns2>
                                <ipv6DnsDhcpSwitch>${item.ipv6DnsDhcpSwitch}</ipv6DnsDhcpSwitch>
                                <ipv6Dns1>${item.ipv6Dns1}</ipv6Dns1>
                                <ipv6Dns2>${item.ipv6Dns2}</ipv6Dns2>
                                ${ternary(item.isSupSecondIP, `<secondIpSwitch>${item.dhcpSwitch ? false : item.secondIpSwitch}</secondIpSwitch>`)}
                                ${ternary(item.isSupSecondIP, `<secondIp>${item.secondIp}</secondIp>`)}
                                ${ternary(item.isSupSecondIP, `<secondMask>${item.secondMask}</secondMask>`)}
                            </item>
                        `
                    })
                    .join('')
                sendXml = rawXml`
                    <nicConfigs>${nic}</nicConfigs>
                    ${ternary(!pageData.value.pppoeSwitch, `<defaultNic>${formData.value.netConfig.defaultNic}</defaultNic>`)}
                `
            }
            sendXml = rawXml`
                <content>
                    ${sendXml}
                    ${ternary(pageData.value.hasPoeNic, `<poeMode>${formData.value.netConfig.poeMode}</poeMode>`)}
                    ${ternary(formData.value.netConfig.toeEnable, `<toeEnable>true</toeEnable>`)}
                    ${ternary(!pageData.value.pppoeSwitch, `<curWorkMode>${formData.value.netConfig.curWorkMode}</curWorkMode>`)}
                </content>
            `

            const result = await editNetCfgV3(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                commSaveResponseHadler(result)
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_INVALID_IP:
                    case ErrorCode.USER_ERROR_IP_ROUTE_INVALID:
                    case ErrorCode.USER_ERROR_INVALID_GATEWAY:
                        errorInfo = Translate('IDCS_ERROR_IP_ROUTE_INVALID')
                        break
                    case ErrorCode.USER_ERROR_INVALID_SUBMASK:
                    case ErrorCode.USER_ERROR_MASK_NOT_CONTINE:
                        errorInfo = Translate('IDCS_ERROR_MASK_NOT_CONTINE')
                        break
                    case ErrorCode.USER_ERROR_IP_MASK_ALL1:
                        errorInfo = Translate('IDCS_ERROR_IP_MASK_ALL1')
                        break
                    case ErrorCode.USER_ERROR_IP_MASK_ALL0:
                        errorInfo = Translate('IDCS_ERROR_IP_MASK_ALL0')
                        break
                    case ErrorCode.USER_ERROR_ROUTE_MASK_ALL1:
                        errorInfo = Translate('IDCS_ERROR_ROUTE_MASK_ALL1')
                        break
                    case ErrorCode.USER_ERROR_ROUTE_MASK_ALL0:
                        errorInfo = Translate('IDCS_ERROR_ROUTE_MASK_ALL0')
                        break
                    case ErrorCode.USER_ERROR_USE_LOOPBACK:
                        errorInfo = Translate('IDCS_ERROR_USE_LOOPBACK')
                        break
                    case ErrorCode.USER_ERROR_DIFFERENT_SEGMENT:
                        errorInfo = Translate('IDCS_ERROR_DIFFERENT_SEGMENT')
                        break
                    case ErrorCode.USER_ERROR_AREA_EXISTED_CHILD_NODE:
                        errorInfo = Translate('IDCS_ERROR_IP_SAME_NETWORK_SEGMAENT')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description [isEqualIPAddress 判断两个IP地址是否在同一个网段]
         * @param {[String]} addr1 [地址一]
         * @param {[String]} addr2 [地址二]
         * @param {[String]} mask1 [子网掩码]
         * @param {[String]} mask2 [子网掩码]
         * @return {Boolean}
         */
        const isEqualIPAddress = (addr1: string, mask1: string, addr2: string, mask2: string) => {
            if (!addr1 || !addr2 || !mask1 || !mask2) {
                return false
            }
            const res1: number[] = []
            const res2: number[] = []
            const addr1s = addr1.split('.')
            const addr2s = addr2.split('.')
            const mask1s = mask1.split('.')
            const mask2s = mask2.split('.')
            for (let i = 0, ilen = addr1s.length; i < ilen; i++) {
                res1.push(parseInt(addr1s[i]) & parseInt(mask1s[i]))
                res2.push(parseInt(addr2s[i]) & parseInt(mask2s[i]))
            }

            if (res1.join('.') === res2.join('.')) {
                //同一网段
                return true
            } else {
                return false
            }
        }

        /**
         * @description 打开高级弹窗
         */
        const setAdvanceData = () => {
            pageData.value.isAdvancePop = true
        }

        /**
         * @description 关闭高级弹窗 更新表单数据
         * @param {NetTcpIpAdvanceForm} data
         * @param {number} index
         */
        const confirmSetAdvanceData = (data: NetTcpIpAdvanceForm, index: number) => {
            pageData.value.isAdvancePop = false
            if (formData.value.netConfig.curWorkMode === 'multiple_address_setting') {
                data.mtu.forEach((mtu, index) => {
                    formData.value.nicConfigs[index].mtu = mtu
                })
                if (index > -1) {
                    formData.value.nicConfigs[index].secondIpSwitch = data.secondIpSwitch
                    formData.value.nicConfigs[index].secondIp = data.secondIp
                    formData.value.nicConfigs[index].secondMask = data.secondMask
                }
            } else {
                data.mtu.forEach((mtu, index) => {
                    formData.value.bonds[index].mtu = mtu
                })
            }
        }

        onMounted(async () => {
            openLoading()

            await getPPPoeSwitch()
            await getNetConfigV3()
            await getNetStatus()

            closeLoading()
        })

        return {
            setAdvanceData,
            confirmSetAdvanceData,
            formData,
            pageData,
            current,
            getWorkModeVisible,
            changeData,
            changeSwitch,
            displayNicName,
            displayNicStatus,
            handleChangeIpV6Switch,
            isPoe,
            poeEnabled,
            handleChangePoeMode,
            setData,
            TcpIpAdvancePop,
        }
    },
})
