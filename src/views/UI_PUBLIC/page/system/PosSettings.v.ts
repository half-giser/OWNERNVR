/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 09:08:32
 * @Description: POS配置
 */
import PosConnectionSettingsPop from './PosConnectionSettingsPop.vue'
import PosHayleyTriggerChannelPop from './PosHayleyTriggerChannelPop.vue'
import PosDisplaySettingPop from './PosDisplaySettingPop.vue'

export default defineComponent({
    components: {
        PosConnectionSettingsPop,
        PosHayleyTriggerChannelPop,
        PosDisplaySettingPop,
    },
    setup() {
        const { Translate } = useLangStore()

        // 连接类型与显示文本的映射
        const CONNECTION_TYPE_MAPPING: Record<string, string> = {
            'TCP-Listen': Translate('IDCS_CONNECT_TYPE'),
            'TCP-Client': Translate('IDCS_TCP_CLIENT'),
            UDP: Translate('IDCS_UDP'),
            Multicast: Translate('IDCS_MULTICAST'),
        }

        const pageData = ref({
            // 连接类型选项列表
            connectionTypeList: [] as SelectOption<string, string>[],
            // 开关选项列表
            switchOption: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 协议选项列表
            manufacturersList: [] as SelectOption<string, string>[],
            // 编码选项列表
            encodeList: [] as SelectOption<string, string>[],
            // 显示模式数据列表
            colorData: [] as SystemPostColorData[],
            // 显示位置的限制值
            displaysetList: new SystemPostDisplaySet(),
            // 连接设置弹窗
            isConnectionDialog: false,
            // 连接设置选中的索引
            connectionDialogIndex: 0,
            // 显示设置弹窗
            isDisplayDialog: false,
            // 显示设置选中的索引。-1为全局设置
            displayDialogIndex: -1,
            // 联动通道设置弹窗
            isTriggerChannelDialog: false,
            // 联动通道设置选中的索引
            triggerChannelDialogIndex: 0,
            // 联动通道设置已选的通道
            triggerChannels: [] as string[],
            // hayley联动通道设置till序号的最大值
            tillNumberMax: Infinity,
            // hayley联动通道设置弹窗
            isHayleyTriggerChannleDialog: false,
            // 通道列表
            chlList: [] as SelectOption<string, string>[],
            networkPortList: [] as number[],
        })

        // 表格数据
        const tableData = ref<SystemPosList[]>([])
        const watchEdit = useWatchEditData(tableData)

        // 已经选择的联动通道的通道ID
        const linkChls = computed(() => {
            return tableData.value
                .filter((item) => item.triggerChl.switch)
                .map((item) => item.triggerChl.chls)
                .flat()
                .map((item) => item.value)
        })

        // 联通通道可供穿梭框选择的通道列表
        const filterChlList = computed(() => {
            return pageData.value.chlList.map((item) => {
                return {
                    label: item.label,
                    value: item.value,
                    disabled: !pageData.value.triggerChannels.includes(item.value) && linkChls.value.includes(item.value),
                }
            })
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryPosList()

            closeLoading()

            commLoadResponseHandler(result, ($) => {
                pageData.value.tillNumberMax = $('types/tillNumber').attr('max').num()

                pageData.value.connectionTypeList = $('types/connectionType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: CONNECTION_TYPE_MAPPING[item.text()],
                    }
                })

                pageData.value.colorData = $('channel/chl').map((item, index) => {
                    const $item = queryXml(item.element)

                    return {
                        index,
                        chlId: item.attr('id'),
                        name: item.attr('name'),
                        colorList: $item('color/item').map((color) => color.text()),
                        printMode: $item('printMode').text(),
                        previewDisplay: $item('previewDisplay').text().bool(),
                    }
                })

                const $position = queryXml($('content/itemType/param/displaySetting/displayPosition')[0].element)
                const displaysetList = pageData.value.displaysetList
                displaysetList.xmin = $position('coordinateSystem/X').attr('min').num()
                displaysetList.xmax = $position('coordinateSystem/X').attr('max').num()
                displaysetList.ymin = $position('coordinateSystem/Y').attr('min').num()
                displaysetList.ymax = $position('coordinateSystem/Y').attr('max').num()
                displaysetList.wmin = $position('width').attr('min').num()
                displaysetList.hmin = $position('height').attr('min').num()

                pageData.value.manufacturersList = $('types/manufacturers/enum').map((item) => {
                    const value = item.text()
                    return {
                        value,
                        label: value === 'General' ? Translate('IDCS_PROTOCOL_TYPE') : value,
                    }
                })

                pageData.value.networkPortList = $('existedPortList/item').map((item) => item.text().num())

                pageData.value.encodeList = $('types/encodeFormat/enum').map((item) => ({
                    value: item.text(),
                    label: item.text(),
                }))

                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)

                    return {
                        id: item.attr('id'),
                        name: $item('param/name').text(),
                        switch: $item('param/switch').text(),
                        connectionType: $item('param/connectionType').text(),
                        manufacturers: $item('param/manufacturers').text(),
                        connectionSetting: {
                            posIp: $item('param/connectionSetting/posIp').text(),
                            filterDstIpSwitch: $item('param/connectionSetting/filterDstIpSwitch').text().bool(),
                            dstIp: $item('param/connectionSetting/dstIp').text(),
                            filterPostPortSwitch: $item('param/connectionSetting/filterPostPortSwitch').text().bool(),
                            posPort: $item('param/connectionSetting/posPort').text().num(),
                            filterDstPortSwitch: $item('param/connectionSetting/filterDstPortSwitch').text().bool(),
                            dstPort: $item('param/connectionSetting/dstPort').text().num(),
                            posPortType: $item('param/connectionSetting/posPortType').text(),
                        },
                        encodeFormat: $item('param/encodeFormat').text(),
                        displaySetting: {
                            common: {
                                startEndChar: $item('param/displaySetting/common/startAndEndList/item')
                                    .map((child) => {
                                        const $child = queryXml(child.element)
                                        return {
                                            startChar: $child('startChar').text(),
                                            endChar: $child('endChar').text(),
                                        }
                                    })
                                    .filter((child) => child.startChar && child.endChar),
                                lineBreak: $item('param/displaySetting/common/lineBreak/item')
                                    .map((child) => child.text())
                                    .filter((child) => !!child),
                                ignoreChar: $item('param/displaySetting/common/ignoreChar/item')
                                    .map((child) => child.text())
                                    .filter((child) => !!child),
                                ignoreCase: $item('param/displaySetting/common/ignoreCase').text().bool(),
                                timeOut: $item('param/displaySetting/common/timeOut').text().num(),
                            },
                            displayPosition: {
                                width: $item('param/displaySetting/displayPosition/width').text().num(),
                                height: $item('param/displaySetting/displayPosition/height').text().num(),
                                X: $item('param/displaySetting/displayPosition/X').text().num(),
                                Y: $item('param/displaySetting/displayPosition/Y').text().num(),
                            },
                        },
                        triggerChl: {
                            switch: $item('trigger/triggerChl/switch').text().bool(),
                            chls: $item('trigger/triggerChl/chls/item').map((chl) => ({
                                value: chl.attr('id'),
                                label: chl.text(),
                                till: chl.attr('till'),
                            })),
                        },
                    }
                })

                watchEdit.listen()
            })
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            if (!verify()) return

            openLoading()

            const sendXml = rawXml`
                <content>
                    ${tableData.value
                        .map((item) => {
                            return rawXml`
                                <item id="${item.id}">
                                    <trigger>
                                        <triggerChl>
                                            <switch>${item.triggerChl.switch}</switch>
                                            <chls>
                                                ${
                                                    item.triggerChl.switch
                                                        ? item.triggerChl.chls
                                                              .map((chl) => {
                                                                  return `<item id="${chl.value}" ${chl.till && Number(chl.till) > 0 ? ` till="${chl.till}"` : ''}>${wrapCDATA(chl.label)}</item>`
                                                              })
                                                              .join('')
                                                        : ''
                                                }
                                            </chls>
                                        </triggerChl>
                                    </trigger>
                                    <param>
                                        <name>${wrapCDATA(item.name)}</name>
                                        <switch>${item.switch}</switch>
                                        <connectionType>${item.connectionType}</connectionType>
                                        <manufacturers>${item.manufacturers}</manufacturers>
                                        <encodeFormat>${item.encodeFormat}</encodeFormat>
                                        <connectionSetting>
                                            <posIp>${item.connectionSetting.posIp}</posIp>
                                            <filterDstIpSwitch>${item.connectionSetting.filterDstIpSwitch}</filterDstIpSwitch>
                                            <dstIp>${item.connectionSetting.dstIp}</dstIp>
                                            <filterPostPortSwitch>${item.connectionSetting.filterPostPortSwitch}</filterPostPortSwitch>
                                            <posPort>${item.connectionSetting.posPort}</posPort>
                                            <filterDstPortSwitch>${item.connectionSetting.filterDstPortSwitch}</filterDstPortSwitch>
                                            <posPortType>${item.connectionSetting.posPortType}</posPortType>
                                        </connectionSetting>
                                        <displaySetting>
                                            <common>
                                                <startAndEndList>
                                                    ${item.displaySetting.common.startEndChar
                                                        .filter((child) => child.startChar && child.endChar)
                                                        .map((child) => {
                                                            return rawXml`
                                                                <item>
                                                                    <startChar>${wrapCDATA(child.startChar)}</startChar>
                                                                    <endChar>${wrapCDATA(child.endChar)}</endChar>
                                                                </item>
                                                            `
                                                        })
                                                        .join('')}
                                                </startAndEndList>
                                                <lineBreak>
                                                    ${item.displaySetting.common.lineBreak
                                                        .filter((child) => !!child)
                                                        .map((child) => `<item>${wrapCDATA(child)}</item>`)
                                                        .join('')}
                                                </lineBreak>
                                                <ignoreChar>
                                                    ${item.displaySetting.common.ignoreChar
                                                        .filter((child) => !!child)
                                                        .map((child) => `<item>${wrapCDATA(child)}</item>`)
                                                        .join('')}
                                                </ignoreChar>
                                                <ignoreCase>${item.displaySetting.common.ignoreCase}</ignoreCase>
                                                <timeOut unit="s">${item.displaySetting.common.timeOut}</timeOut>
                                            </common>
                                            <displayPosition>
                                                <width>${item.displaySetting.displayPosition.width}</width>
                                                <height>${item.displaySetting.displayPosition.height}</height>
                                                <X>${item.displaySetting.displayPosition.X}</X>
                                                <Y>${item.displaySetting.displayPosition.Y}</Y>
                                            </displayPosition>
                                        </displaySetting>
                                    </param>
                                </item>
                            `
                        })
                        .join('')}
                </content>
                <channel>
                    ${pageData.value.colorData
                        .map((item) => {
                            return rawXml`
                                <chl id="${item.chlId}">
                                    <color>${item.colorList.map((color) => `<item>${color}</item>`).join('')}</color>
                                    <printMode>${item.printMode}</printMode>
                                    <previewDisplay>${item.previewDisplay}</previewDisplay>
                                </chl>
                            `
                        })
                        .join('')}
                </channel>
            `

            const result = await editPosList(sendXml)
            const $ = queryXml(result)

            closeLoading()
            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536870943) {
                    openMessageBox(Translate('IDCS_USER_ERROR_INVALID_PARAM'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            }
        }

        /**
         * @description 表单校验
         */
        const verify = () => {
            let isEmptyIp = false // IP地址是否为空
            let isEmptyPort = false // 端口是否为空
            let isValidMulIp = false // 连接方式为组播时, 组播网段：IP >= 224 && IP <= 239
            let isValidNonMulIp = false // 连接方式为非组播时, IP地址不能为组播网段
            const hasUseLocalPort: number[] = []
            let isSameLocalPort = false // 连接方式为UDP时, 多个POS配置的本地接收端口不可相同
            const hasUseIPAndPort: string[] = []
            let isSameIPAndPort = false // ip、端口是否指向同一个地址, 如10.10.1.1:9000

            tableData.value.forEach((item) => {
                const posSwitch = item.switch
                const connectionType = item.connectionType
                const connectionSetting = item.connectionSetting
                const posIp = connectionSetting.posIp.split('.').map((item) => Number(item))
                const isValidIp = posIp && posIp.length > 0 && posIp[0]
                const posPort = connectionSetting.posPort
                const isValidPort = posPort && posPort * 1 >= 10
                const posPortType = connectionSetting.posPortType

                // IP地址为空
                if (posSwitch === 'true' && !isValidIp) {
                    isEmptyIp = true
                    return false
                }
                // 端口为空
                else if (posSwitch === 'true' && connectionType !== 'TCP-Listen' && !isValidPort) {
                    // TCP-Listen TCP服务器端
                    isEmptyPort = true
                    return false
                }

                // IP地址的有效性
                if (isValidIp) {
                    const d1 = posIp[0]
                    const d2 = posIp[1]
                    const d3 = posIp[2]
                    const d4 = posIp[3]
                    const firstPart = d1 >= 224 && d1 <= 239
                    const otherPart = d2 >= 0 && d2 <= 255 && d3 >= 0 && d3 <= 255 && d4 >= 0 && d4 <= 255
                    const isMulticast = connectionType === 'Multicast'
                    if (isMulticast && !(firstPart && otherPart)) {
                        // 组播的IP地址网段错误
                        isValidMulIp = true
                        return false
                    } else if (!isMulticast && firstPart && otherPart) {
                        // 非组播的IP地址不能包含组播网段
                        isValidNonMulIp = true
                        return false
                    }
                }

                // 多个配置, 本地接收端口不能相同
                if (posSwitch === 'true' && posPortType === 'local' && isValidPort) {
                    if (hasUseLocalPort.includes(posPort)) {
                        isSameLocalPort = true
                        return false
                    } else {
                        hasUseLocalPort.push(posPort)
                    }
                }

                // 多个配置, IP和端口不能相同
                if (posSwitch === 'true' && connectionSetting.posIp) {
                    const ipPort = connectionSetting.posIp + ':' + (posPort || 0)
                    if (hasUseIPAndPort.includes(ipPort)) {
                        isSameIPAndPort = true
                        return false
                    } else {
                        hasUseIPAndPort.push(ipPort)
                    }
                }
            })

            let msg = ''
            if (isEmptyIp) {
                msg = Translate('IDCS_POS_IP_EMPTY')
            } else if (isEmptyPort) {
                msg = Translate('IDCS_POS_PORT_EMPTY')
            } else if (isValidMulIp) {
                msg = Translate('IDCS_PROMPT_MULTICAST_IPADDRESS_INVALID')
            } else if (isValidNonMulIp) {
                msg = Translate('IDCS_PROMPT_PROTOCOL_IPADDRESS_INVALID')
            } else if (isSameLocalPort) {
                msg = Translate('IDCS_NETWORK_PORT_CONFLICT')
            } else if (isSameIPAndPort) {
                msg = Translate('IDCS_POS_IP_SAME')
            }

            if (msg) {
                openMessageBox(Translate(msg))
                return false
            }

            return true
        }

        /**
         * @description 一键全部开启/关闭
         * @param {string} bool
         */
        const changeAllSwitch = (bool: string) => {
            tableData.value.forEach((item) => {
                item.switch = bool
            })
        }

        /**
         * @description 一键修改所有连接方式
         * @param {string} type
         */
        const changeAllConnectionType = (type: string) => {
            tableData.value.forEach((item) => {
                item.connectionType = type
            })
        }

        /**
         * @description 打开连接设置弹窗
         * @param {number} index
         */
        const setConnection = (index: number) => {
            pageData.value.connectionDialogIndex = index
            nextTick(() => {
                pageData.value.isConnectionDialog = true
            })
        }

        /**
         * @description 确认修改连接设置数据
         * @param {SystemPosConnectionForm} e
         */
        const confirmSetConnection = (e: SystemPosConnectionForm) => {
            tableData.value[pageData.value.connectionDialogIndex].connectionSetting.posIp = e.ip
            tableData.value[pageData.value.connectionDialogIndex].connectionSetting.posPort = e.port ? e.port : 0
            tableData.value[pageData.value.connectionDialogIndex].connectionSetting.filterPostPortSwitch = e.switch
            pageData.value.isConnectionDialog = false
        }

        /**
         * @description 一键修改所有协议
         * @param {string} type
         */
        const changeAllManufacturers = (type: string) => {
            tableData.value.forEach((item) => {
                item.manufacturers = type
            })
        }

        /**
         * @description 打开联动通道弹窗
         * @param {number} index
         */
        const setTriggerChannel = (index: number) => {
            const item = tableData.value[index]
            pageData.value.triggerChannelDialogIndex = index
            pageData.value.triggerChannels = item.triggerChl.chls.map((item) => item.value)
            nextTick(() => {
                if (item.manufacturers === 'Hayley' && item.connectionType === 'Multicast') {
                    pageData.value.isHayleyTriggerChannleDialog = true
                } else {
                    pageData.value.isTriggerChannelDialog = true
                }
            })
        }

        /**
         * @description 勾选开启联动通道时，打开联动通道弹窗
         * @param {number} index
         */
        const changeTriggerChannel = (index: number) => {
            if (tableData.value[index].triggerChl.switch === true) {
                setTriggerChannel(index)
            }
        }

        /**
         * @description 确认修改联动通道设置数据 若无联动通道，按钮置灰
         * @param {SystemPosConnectionForm} e
         */
        const confirmSetTriggerChannel = (e: SystemPosListChls[]) => {
            if (e.length) {
                tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.chls = cloneDeep(e)
            } else {
                tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.switch = false
                tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.chls = []
            }
            pageData.value.isTriggerChannelDialog = false
            pageData.value.isHayleyTriggerChannleDialog = false
        }

        /**
         * @description 关闭联动通道弹窗 若无联动通道，按钮置灰
         */
        const closeTriggerChannel = () => {
            if (!tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.chls.length) {
                tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.switch = false
                tableData.value[pageData.value.triggerChannelDialogIndex].triggerChl.chls = []
            }
            pageData.value.isTriggerChannelDialog = false
            pageData.value.isHayleyTriggerChannleDialog = false
        }

        /**
         * @description 打开显示设置弹窗，设置所有项的显示设置
         */
        const setAllDisplay = () => {
            setDisplay(-1)
        }

        /**
         * @description 打开显示设置弹窗, 设置选中项的显示设置
         * @param {number} index
         */
        const setDisplay = (index: number) => {
            pageData.value.displayDialogIndex = index
            nextTick(() => {
                pageData.value.isDisplayDialog = true
            })
        }

        /**
         * @description 确认修改显示设置数据
         * @param {SystemPosDisplaySetting} setting
         * @param {SystemPostColorData} colorData
         */
        const confirmSetDisplay = (setting: SystemPosDisplaySetting, colorData: SystemPostColorData[]) => {
            pageData.value.isDisplayDialog = false
            pageData.value.colorData = colorData
            if (pageData.value.displayDialogIndex === -1) {
                tableData.value.forEach((item) => {
                    item.displaySetting = cloneDeep(setting)
                })
            } else {
                tableData.value[pageData.value.displayDialogIndex].displaySetting = cloneDeep(setting)
            }
        }

        /**
         * @description 一键修改所有项的编码格式
         * @param {string} format
         */
        const changeAllEncodeFormat = (format: string) => {
            tableData.value.forEach((item) => {
                item.encodeFormat = format
            })
        }

        /**
         * @description 获取联动通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                requireField: ['device'],
            })
            commLoadResponseHandler(result, ($) => {
                pageData.value.chlList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id'),
                        label: $item('name').text(),
                    }
                })
            })
        }

        onMounted(() => {
            getData()
            getChannelList()
        })

        return {
            pageData,
            tableData,
            watchEdit,
            linkChls,
            filterChlList,
            changeAllSwitch,
            changeAllConnectionType,
            changeAllEncodeFormat,
            setConnection,
            confirmSetConnection,
            changeAllManufacturers,
            setData,
            setAllDisplay,
            setDisplay,
            changeTriggerChannel,
            closeTriggerChannel,
            setTriggerChannel,
            confirmSetTriggerChannel,
            confirmSetDisplay,
        }
    },
})
