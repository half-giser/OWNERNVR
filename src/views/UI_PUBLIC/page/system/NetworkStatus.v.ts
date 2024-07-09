/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 16:31:50
 * @Description: 网络状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-27 19:41:49
 */
import { type SystemNetStatusList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 状态值与显示文案的映射
        const DEFAULT_LANG_MAPPING: Record<string, string> = {
            online: 'IDCS_NIC_STATE_ONLINE',
            offline: 'IDCS_NIC_STATE_OFFLINE',
            disabled: 'IDCS_DISABLE',
            success: 'IDCS_SUCCEED',
            fail: 'IDCS_FAILED',
            connected: 'IDCS_CONNECTED',
            disconnected: 'IDCS_DISCONNECT',
            enable: 'IDCS_ENABLE',
            disable: 'IDCS_DISABLE',
        }

        // 状态值与显示文案的映射
        const DEFAULT_PHONE_LANG_MAPPING: Record<string, string> = {
            disabled: 'IDCS_DISABLE',
            success: 'IDCS_WIRELESS_3G4G_SUCCESS',
            fail: 'IDCS_WIRELESS_3G4G_FAIL',
        }

        const tableData = ref<SystemNetStatusList[]>([])

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            const port = await queryNetPortCfg()
            const $port = queryXml(port)
            const net = await queryNetStatus()
            const $ = queryXml(net)
            const array: SystemNetStatusList[] = []

            const supportPOS = systemCaps.supportPOS
            const netStatusContentNicPoe = $('/response/content/nic').attr('poe')
            const poeCount = netStatusContentNicPoe ? 1 : 0
            const ipGroupSwitch = $('/response/content/ipGroup/switch').text() === 'true'
            const toleranceAndPoe = ipGroupSwitch && netStatusContentNicPoe // 3535A:即支持网络容错又存在poe网卡

            if (ipGroupSwitch) {
                // TODO ipGroup未有真实数据测试
                $('/response/content/ipGroup/bonds/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    array.push({
                        i: 0,
                        k: Translate('IDCS_GROUP_IP'),
                        v: '',
                    })
                    if (toleranceAndPoe) {
                        array.push({
                            i: 0,
                            k: Translate('IDCS_FAULT_ETH_NAME'),
                            v: Translate(DEFAULT_LANG_MAPPING[$item('nicStatus').text()]),
                        })
                    }
                    array.push(
                        {
                            i: 1,
                            k: 'IPv4 ' + Translate('IDCS_DHCP_STATE'),
                            v: Translate(DEFAULT_LANG_MAPPING[$item('dhcpStatus').text()]),
                        },
                        {
                            i: 1,
                            k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                            v: $item('ip').text(),
                        },
                        {
                            i: 1,
                            k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                            v: $item('mask').text(),
                        },
                        {
                            i: 1,
                            k: 'IPv4 ' + Translate('IDCS_GATEWAY'),
                            v: $item('gateway').text(),
                        },
                        {
                            i: 1,
                            k: Translate('IDCS_FIRST_DNS'),
                            v: $item('dns1').text(),
                        },
                        {
                            i: 1,
                            k: Translate('IDCS_SECOND_DNS'),
                            v: $item('dns2').text(),
                        },
                        {
                            i: 1,
                            k: Translate('IDCS_COMMON_STATE'),
                            v: Translate(DEFAULT_LANG_MAPPING[$item('ipv6Status').text()]),
                        },
                    )
                    if ($item('ipv6Status').text() === 'enable') {
                        array.push(
                            {
                                i: 1,
                                k: 'IPv6 ' + Translate('IDCS_DHCP_STATE'),
                                v: Translate(DEFAULT_LANG_MAPPING[$item('dhcpStatusV6').text()]),
                            },
                            {
                                i: 1,
                                k: 'IPv6 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ipV6').text(),
                            },
                            {
                                i: 1,
                                k: Translate('IDCS_IPV6_ADDR_SLAAC'),
                                v: $item('ipV6Slaac').text(),
                            },
                            {
                                i: 1,
                                k: 'IPv6 ' + Translate('IDCS_SUBNET_MASK_LENGTH'),
                                v: $item('subLengthV6').text(),
                            },
                            {
                                i: 1,
                                k: 'IPv6 ' + Translate('IDCS_GATEWAY'),
                                v: $item('gatewayV6').text(),
                            },
                            {
                                i: 1,
                                k: Translate('IDCS_IPV6_FIRST_DNS'),
                                v: $item('ipv6Dns1').text(),
                            },
                            {
                                i: 1,
                                k: Translate('IDCS_IPV6_SECOND_DNS'),
                                v: $item('ipv6Dns2').text(),
                            },
                        )
                    }
                    $('/response/content/nic/item').forEach((nicItem, index) => {
                        if (nicItem.attr('id') === $('primaryNIC').text()) {
                            array.push({
                                i: 1,
                                k: Translate('IDCS_PRIMARY_NETWORK_CARD'),
                                v: netStatusContentNicPoe === item.attr('id') ? Translate('IDCS_POE_ETH_NAME') : Translate('IDCS_ETH_NAME').formatForLang(String(index + 1)),
                            })
                        }
                    })
                })
            }
            if ($('/response/content/nic/item').text()) {
                $('/response/content/nic/item').forEach((item, index) => {
                    const $item = queryXml(item.element)
                    array.push({
                        i: 0,
                        k: netStatusContentNicPoe === item.attr('id') ? Translate('IDCS_POE_ETH_NAME') : Translate('IDCS_ETH_NAME').formatForLang(String(index + 1)),
                        v: Translate(DEFAULT_LANG_MAPPING[$item('nicStatus').text()]),
                    })
                    if (!ipGroupSwitch) {
                        if ($item('nicStatus').text() !== 'disabled') {
                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 1,
                                    k: 'IPv4 ' + Translate('IDCS_DHCP_STATE'),
                                    v: Translate(DEFAULT_LANG_MAPPING[$item('dhcpStatus').text()]),
                                })
                            }
                            array.push({
                                i: 1,
                                k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ip').text(),
                            })
                            array.push({
                                i: 1,
                                k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                                v: $item('mask').text(),
                            })
                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 1,
                                    k: 'IPv4 ' + Translate('IDCS_GATEWAY'),
                                    v: $item('gateway').text(),
                                })
                                array.push({
                                    i: 1,
                                    k: Translate('IDCS_FIRST_DNS'),
                                    v: $item('dns1').text(),
                                })
                                array.push({
                                    i: 1,
                                    k: Translate('IDCS_SECOND_DNS'),
                                    v: $item('dns2').text(),
                                })
                            }
                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 1,
                                    k: 'IPv6 ' + Translate('IDCS_COMMON_STATE'),
                                    v: Translate(DEFAULT_LANG_MAPPING[$item('ipv6Status').text()]),
                                })
                                if ($item('ipv6Status').text() === 'enable') {
                                    array.push({
                                        i: 1,
                                        k: 'IPv6 ' + Translate('IDCS_DHCP_STATE'),
                                        v: Translate(DEFAULT_LANG_MAPPING[$item('dhcpStatusV6').text()]),
                                    })
                                    array.push({
                                        i: 1,
                                        k: 'IPv6 ' + Translate('IDCS_IP_ADDRESS'),
                                        v: $item('ipV6').text(),
                                    })
                                    array.push({
                                        i: 1,
                                        k: Translate('IDCS_IPV6_ADDR_SLAAC'),
                                        v: $item('ipV6Slaac').text(),
                                    })
                                    array.push({
                                        i: 1,
                                        k: 'IPv6 ' + Translate('IDCS_SUBNET_MASK_LENGTH'),
                                        v: $item('subLengthV6').text(),
                                    })
                                    array.push({
                                        i: 1,
                                        k: 'IPv6 ' + Translate('IDCS_GATEWAY'),
                                        v: $item('gatewayV6').text(),
                                    })
                                    array.push({
                                        i: 1,
                                        k: Translate('IDCS_IPV6_FIRST_DNS'),
                                        v: $item('ipv6Dns1').text(),
                                    })
                                    array.push({
                                        i: 1,
                                        k: Translate('IDCS_IPV6_SECOND_DNS'),
                                        v: $item('ipv6Dns2').text(),
                                    })
                                }
                                array.push({
                                    i: 1,
                                    k: Translate('IDCS_MAC_ADDRESS'),
                                    v: $item('mac').text(),
                                })
                            }
                        }
                    } else {
                        // 网络容错模式显示
                        if (netStatusContentNicPoe !== item.attr('id')) {
                            array.push({
                                i: 1,
                                k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ip').text(),
                            })
                            array.push({
                                i: 1,
                                k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                                v: $item('mask').text(),
                            })
                        } else {
                            array.push({
                                i: 1,
                                k: Translate('IDCS_MAC_ADDRESS'),
                                v: $item('mac').text(),
                            })
                        }
                    }
                })
            }

            const pppoeStatus = $('/response/content/pppoe/pppoeStatus').text()
            array.push({
                i: 0,
                k: Translate('IDCS_PPPOE_STATE'),
                v: Translate(DEFAULT_LANG_MAPPING[pppoeStatus]),
            })

            if (pppoeStatus === 'connected') {
                array.push({
                    i: 0,
                    k: Translate('IDCS_PPOE_ADDRESS'),
                    v: $('/response/content/pppoe/ip').text(),
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_PPOE_SUBNET_MASK'),
                    v: $('/response/content/pppoe/mask').text(),
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_PPOE_GATEWAY'),
                    v: $('/response/content/pppoe/gateway').text(),
                })
            }

            array.push({
                i: 0,
                k: Translate('IDCS_PORT'),
                v: '',
            })
            array.push({
                i: 1,
                k: Translate('IDCS_HTTP_PORT'),
                v: $port('/response/content/httpPort').text(),
            })
            array.push({
                i: 1,
                k: Translate('IDCS_HTTPS_PORT'),
                v: $port('/response/content/httpsPort').text(),
            })
            array.push({
                i: 1,
                k: Translate('IDCS_SERVE_PORT'),
                v: $port('/response/content/netPort').text(),
            })
            array.push({
                i: 1,
                k: Translate('IDCS_RTSP_PORT'),
                v: $port('/response/content/rtspPort').text(),
            })

            if (supportPOS) {
                array.push({
                    i: 1,
                    k: Translate('IDCS_POS_PORT'),
                    v: $port('/response/content/posPort').text(),
                })
            }

            if ($('/response/content/bandwidth/totalBandwidth').text()) {
                array.push({
                    i: 0,
                    k: Translate('IDCS_TOTAL_BANDWIDTH'),
                    v: $('/response/content/bandwidth/totalBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_REMAIN_BANDWIDTH'),
                    v: $('/response/content/bandwidth/remainBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_SEND_TOTAL_BANDWIDTH'),
                    v: $('/response/content/bandwidth/sendTotalBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_SEND_REMAIN_BANDWIDTH'),
                    v: $('/response/content/bandwidth/sendRemainBandwidth').text() + 'Mb',
                })
            }

            array.push({
                i: 0,
                k: Translate('IDCS_NAT_STATUS'),
                v: $('/response/content/natStatus').text().toBoolean() ? Translate('IDCS_ENABLE') : Translate('IDCS_DISABLE'),
            })
            if ($('/response/content/reportStatus').text()) {
                array.push({
                    i: 0,
                    k: Translate('IDCS_AUTO_REPORT_STATUS'),
                    v: Translate(DEFAULT_LANG_MAPPING[$('/response/content/reportStatus').text()]),
                })
            }

            if ($('/response/content/threeOrFourG').text()) {
                array.push({
                    i: 0,
                    k: Translate('IDCS_WIRELESS_3G4G_STATE'),
                    v: Translate(DEFAULT_PHONE_LANG_MAPPING[$('/response/content/threeOrFourG/threeOrFourGStatus').text()]),
                })
                array.push({
                    i: 0,
                    k: Translate('IDCS_WIRELESS_3G4G_IP'),
                    v: $('/response/content/threeOrFourG/ip').text(),
                })
            }

            if ($('/response/content/nic/item').length - poeCount > 1) {
                if (ipGroupSwitch) {
                    array.shift()
                }
                array.unshift({
                    i: 0,
                    k: Translate('IDCS_WORK_PATTERN'),
                    v: Translate(ipGroupSwitch ? 'IDCS_NETWORK_FAULT_TOLERANCE' : 'IDCS_MULTIPLE_ADDRESS_SETTING'),
                })
            }

            tableData.value = [...array]
        }

        /**
         * 处理右上侧按钮点击刷新
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<ChannelToolBarEvent>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            handleToolBarEvent,
            tableData,
        }
    },
})
