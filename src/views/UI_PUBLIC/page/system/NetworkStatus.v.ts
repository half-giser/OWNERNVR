/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 16:31:50
 * @Description: 网络状态
 */
export default defineComponent({
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 状态值与显示文案的映射
        const DEFAULT_LANG_MAPPING: Record<string, string> = {
            online: Translate('IDCS_NIC_STATE_ONLINE'),
            offline: Translate('IDCS_NIC_STATE_OFFLINE'),
            disabled: Translate('IDCS_DISABLE'),
            success: Translate('IDCS_SUCCEED'),
            fail: Translate('IDCS_FAILED'),
            connected: Translate('IDCS_CONNECTED'),
            disconnected: Translate('IDCS_DISCONNECT'),
            enable: Translate('IDCS_ENABLE'),
            disable: Translate('IDCS_DISABLE'),
        }

        // 状态值与显示文案的映射
        const DEFAULT_PHONE_LANG_MAPPING: Record<string, string> = {
            disabled: Translate('IDCS_DISABLE'),
            success: Translate('IDCS_WIRELESS_3G4G_SUCCESS'),
            fail: Translate('IDCS_WIRELESS_3G4G_FAIL'),
        }

        const tableData = ref<SystemNetStatusList[]>([])

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            const port = await queryNetPortCfg()
            const $port = queryXml(queryXml(port)('content')[0].element)
            const net = await queryNetStatus()
            const $ = queryXml(queryXml(net)('content')[0].element)
            const array: SystemNetStatusList[] = []

            const supportPOS = systemCaps.supportPOS
            const netStatusContentNicPoe = $('nic').attr('poe')
            const poeCount = netStatusContentNicPoe ? 1 : 0
            const ipGroupSwitch = $('ipGroup/switch').text().bool()
            const toleranceAndPoe = ipGroupSwitch && netStatusContentNicPoe // 3535A:即支持网络容错又存在poe网卡

            if (ipGroupSwitch) {
                $('ipGroup/bonds/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    array.push({
                        i: 1,
                        k: Translate('IDCS_GROUP_IP'),
                        v: '',
                    })
                    if (toleranceAndPoe) {
                        array.push({
                            i: 1,
                            k: Translate('IDCS_FAULT_ETH_NAME'),
                            v: DEFAULT_LANG_MAPPING[$item('nicStatus').text()],
                        })
                    }
                    array.push(
                        {
                            i: 2,
                            k: 'IPv4 ' + Translate('IDCS_DHCP_STATE'),
                            v: DEFAULT_LANG_MAPPING[$item('dhcpStatus').text()],
                        },
                        {
                            i: 2,
                            k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                            v: $item('ip').text(),
                        },
                        {
                            i: 2,
                            k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                            v: $item('mask').text(),
                        },
                        {
                            i: 2,
                            k: 'IPv4 ' + Translate('IDCS_GATEWAY'),
                            v: $item('gateway').text(),
                        },
                        {
                            i: 2,
                            k: Translate('IDCS_FIRST_DNS'),
                            v: $item('dns1').text(),
                        },
                        {
                            i: 2,
                            k: Translate('IDCS_SECOND_DNS'),
                            v: $item('dns2').text(),
                        },
                        {
                            i: 2,
                            k: 'IPv6 ' + Translate('IDCS_COMMON_STATE'),
                            v: DEFAULT_LANG_MAPPING[$item('ipv6Status').text()],
                        },
                    )
                    if ($item('ipv6Status').text() === 'enable') {
                        array.push(
                            {
                                i: 2,
                                k: 'IPv6 ' + Translate('IDCS_DHCP_STATE'),
                                v: DEFAULT_LANG_MAPPING[$item('dhcpStatusV6').text()],
                            },
                            {
                                i: 2,
                                k: 'IPv6 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ipV6').text(),
                            },
                            {
                                i: 2,
                                k: Translate('IDCS_IPV6_ADDR_SLAAC'),
                                v: $item('ipV6Slaac').text(),
                            },
                            {
                                i: 2,
                                k: 'IPv6 ' + Translate('IDCS_SUBNET_MASK_LENGTH'),
                                v: $item('subLengthV6').text(),
                            },
                            {
                                i: 2,
                                k: 'IPv6 ' + Translate('IDCS_GATEWAY'),
                                v: $item('gatewayV6').text(),
                            },
                            {
                                i: 2,
                                k: Translate('IDCS_IPV6_FIRST_DNS'),
                                v: $item('ipv6Dns1').text(),
                            },
                            {
                                i: 2,
                                k: Translate('IDCS_IPV6_SECOND_DNS'),
                                v: $item('ipv6Dns2').text(),
                            },
                        )
                    }
                    $('nic/item').forEach((nicItem, index) => {
                        if (nicItem.attr('id') === $item('primaryNIC').text()) {
                            array.push({
                                i: 1,
                                k: Translate('IDCS_PRIMARY_NETWORK_CARD'),
                                v: netStatusContentNicPoe === item.attr('id') ? Translate('IDCS_POE_ETH_NAME') : Translate('IDCS_ETH_NAME').formatForLang(index + 1),
                            })
                        }
                    })
                })
            }

            if ($('nic/item').length) {
                $('nic/item').forEach((item, index) => {
                    const $item = queryXml(item.element)
                    array.push({
                        i: 1,
                        k: netStatusContentNicPoe === item.attr('id') ? Translate('IDCS_POE_ETH_NAME') : Translate('IDCS_ETH_NAME').formatForLang(index + 1),
                        v: DEFAULT_LANG_MAPPING[$item('nicStatus').text()],
                    })
                    if (!ipGroupSwitch) {
                        if ($item('nicStatus').text() !== 'disabled') {
                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 2,
                                    k: 'IPv4 ' + Translate('IDCS_DHCP_STATE'),
                                    v: DEFAULT_LANG_MAPPING[$item('dhcpStatus').text()],
                                })
                            }
                            array.push({
                                i: 2,
                                k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ip').text(),
                            })
                            array.push({
                                i: 2,
                                k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                                v: $item('mask').text(),
                            })
                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 2,
                                    k: 'IPv4 ' + Translate('IDCS_GATEWAY'),
                                    v: $item('gateway').text(),
                                })
                                array.push({
                                    i: 2,
                                    k: Translate('IDCS_FIRST_DNS'),
                                    v: $item('dns1').text(),
                                })
                                array.push({
                                    i: 2,
                                    k: Translate('IDCS_SECOND_DNS'),
                                    v: $item('dns2').text(),
                                })
                            }

                            if (netStatusContentNicPoe !== item.attr('id')) {
                                array.push({
                                    i: 2,
                                    k: 'IPv6 ' + Translate('IDCS_COMMON_STATE'),
                                    v: DEFAULT_LANG_MAPPING[$item('ipv6Status').text()],
                                })
                                if ($item('ipv6Status').text() === 'enable') {
                                    array.push({
                                        i: 2,
                                        k: 'IPv6 ' + Translate('IDCS_DHCP_STATE'),
                                        v: DEFAULT_LANG_MAPPING[$item('dhcpStatusV6').text()],
                                    })
                                    array.push({
                                        i: 2,
                                        k: 'IPv6 ' + Translate('IDCS_IP_ADDRESS'),
                                        v: $item('ipV6').text(),
                                    })
                                    array.push({
                                        i: 2,
                                        k: Translate('IDCS_IPV6_ADDR_SLAAC'),
                                        v: $item('ipV6Slaac').text(),
                                    })
                                    array.push({
                                        i: 2,
                                        k: 'IPv6 ' + Translate('IDCS_SUBNET_MASK_LENGTH'),
                                        v: $item('subLengthV6').text(),
                                    })
                                    array.push({
                                        i: 2,
                                        k: 'IPv6 ' + Translate('IDCS_GATEWAY'),
                                        v: $item('gatewayV6').text(),
                                    })
                                    array.push({
                                        i: 2,
                                        k: Translate('IDCS_IPV6_FIRST_DNS'),
                                        v: $item('ipv6Dns1').text(),
                                    })
                                    array.push({
                                        i: 2,
                                        k: Translate('IDCS_IPV6_SECOND_DNS'),
                                        v: $item('ipv6Dns2').text(),
                                    })
                                }
                                array.push({
                                    i: 2,
                                    k: Translate('IDCS_MAC_ADDRESS'),
                                    v: $item('mac').text(),
                                })
                            }
                        }
                    } else {
                        // 网络容错模式显示
                        if (netStatusContentNicPoe === item.attr('id')) {
                            array.push({
                                i: 2,
                                k: 'IPv4 ' + Translate('IDCS_IP_ADDRESS'),
                                v: $item('ip').text(),
                            })
                            array.push({
                                i: 2,
                                k: 'IPv4 ' + Translate('IDCS_SUBNET_MASK'),
                                v: $item('mask').text(),
                            })
                        } else {
                            array.push({
                                i: 2,
                                k: Translate('IDCS_MAC_ADDRESS'),
                                v: $item('mac').text(),
                            })
                        }
                    }
                })
            }

            const pppoeStatus = $('pppoe/pppoeStatus').text()
            array.push({
                i: 1,
                k: Translate('IDCS_PPPOE_STATE'),
                v: DEFAULT_LANG_MAPPING[pppoeStatus],
            })

            if (pppoeStatus === 'connected') {
                array.push({
                    i: 1,
                    k: Translate('IDCS_PPOE_ADDRESS'),
                    v: $('pppoe/ip').text(),
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_PPOE_SUBNET_MASK'),
                    v: $('pppoe/mask').text(),
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_PPOE_GATEWAY'),
                    v: $('pppoe/gateway').text(),
                })
            }

            array.push({
                i: 1,
                k: Translate('IDCS_PORT'),
                v: '',
            })
            array.push({
                i: 2,
                k: Translate('IDCS_HTTP_PORT'),
                v: $port('httpPort').text(),
            })
            array.push({
                i: 2,
                k: Translate('IDCS_HTTPS_PORT'),
                v: $port('httpsPort').text(),
            })
            array.push({
                i: 2,
                k: Translate('IDCS_SERVE_PORT'),
                v: $port('netPort').text(),
            })
            array.push({
                i: 2,
                k: Translate('IDCS_RTSP_PORT'),
                v: $port('rtspPort').text(),
            })

            if (supportPOS) {
                array.push({
                    i: 2,
                    k: Translate('IDCS_POS_PORT'),
                    v: $port('posPort').text(),
                })
            }

            if ($('bandwidth/totalBandwidth').text()) {
                array.push({
                    i: 1,
                    k: Translate('IDCS_TOTAL_BANDWIDTH'),
                    v: $('bandwidth/totalBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_REMAIN_BANDWIDTH'),
                    v: $('bandwidth/remainBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_SEND_TOTAL_BANDWIDTH'),
                    v: $('bandwidth/sendTotalBandwidth').text() + 'Mb',
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_SEND_REMAIN_BANDWIDTH'),
                    v: $('bandwidth/sendRemainBandwidth').text() + 'Mb',
                })
            }

            array.push({
                i: 1,
                k: Translate('IDCS_NAT_STATUS'),
                v: $('natStatus').text().bool() ? Translate('IDCS_ENABLE') : Translate('IDCS_DISABLE'),
            })
            if ($('reportStatus').text()) {
                array.push({
                    i: 1,
                    k: Translate('IDCS_AUTO_REPORT_STATUS'),
                    v: DEFAULT_LANG_MAPPING[$('reportStatus').text()],
                })
            }

            if ($('threeOrFourG').text()) {
                array.push({
                    i: 1,
                    k: Translate('IDCS_WIRELESS_3G4G_STATE'),
                    v: DEFAULT_PHONE_LANG_MAPPING[$('threeOrFourG/threeOrFourGStatus').text()],
                })
                array.push({
                    i: 1,
                    k: Translate('IDCS_WIRELESS_3G4G_IP'),
                    v: $('threeOrFourG/ip').text(),
                })
            }

            if ($('nic/item').length - poeCount > 1) {
                if (ipGroupSwitch) {
                    array.shift()
                }
                array.unshift({
                    i: 1,
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
        const handleToolBarEvent = (event: ConfigToolBarEvent<any>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        onMounted(() => {
            getData()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableData,
        }
    },
})
