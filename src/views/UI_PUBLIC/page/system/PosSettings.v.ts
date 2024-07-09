/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 09:08:32
 * @Description: POS配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-03 15:24:59
 */
import { cloneDeep } from 'lodash'
import type { SystemPosList, SystemPosListChls, SystemPostColorData, SystemPosConnectionForm, SystemPosDisplaySetting } from '@/types/apiType/system'
import { SystemPostDisplaySet } from '@/types/apiType/system'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import PosConnectionSettingsPop from './PosConnectionSettingsPop.vue'
import PosTriggerChannelPop from './PosTriggerChannelPop.vue'
import PosHayleyTriggerChannelPop from './PosHayleyTriggerChannelPop.vue'
import PosDisplaySettingPop from './PosDisplaySettingPop.vue'

export default defineComponent({
    components: {
        PosConnectionSettingsPop,
        PosTriggerChannelPop,
        PosHayleyTriggerChannelPop,
        PosDisplaySettingPop,
        BaseImgSprite,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const CONNECTION_TYPE_MAPPING: Record<string, string> = {
            'TCP-Listen': Translate('IDCS_CONNECT_TYPE'),
            'TCP-Client': Translate('IDCS_TCP_CLIENT'),
            UDP: Translate('IDCS_UDP'),
            Multicast: Translate('IDCS_MULTICAST'),
        }

        const pageData = ref({
            // 连接类型选项列表
            connectionTypeList: [] as { name: string; value: string }[],
            // 开关选项列表
            switchOption: DEFAULT_SWITCH_OPTIONS,
            // 协议选项列表
            manufacturersList: [] as { name: string; value: string }[],
            // 编码选项列表
            encodeList: [] as { name: string; value: string }[],
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
            // hayley联动通道设置till序号的最大值
            tillNumberMax: Infinity,
            // hayley联动通道设置弹窗
            isHayleyTriggerChannleDialog: false,
            mounted: false,
            // 是否禁用提交
            submitDisabled: true,
        })

        // 表格数据
        const tableData = ref<SystemPosList[]>([])

        // 已经选择的联动通道的通道ID
        const linkChls = computed(() => {
            return tableData.value
                .filter((item) => item.triggerChl.switch)
                .map((item) => item.triggerChl.chls)
                .flat()
                .map((item) => item.id)
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryPosList()
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                pageData.value.tillNumberMax = Number($('/response/types/tillNumber').attr('max'))

                pageData.value.connectionTypeList = $('/response/types/connectionType/enum').map((item) => {
                    return {
                        value: item.text(),
                        name: CONNECTION_TYPE_MAPPING[item.text()],
                    }
                })

                pageData.value.colorData = $('/response/channel/chl').map((item) => {
                    const $item = queryXml(item.element)

                    return {
                        chlId: item.attr('id')!,
                        name: item.attr('name')!,
                        colorList: $item('color/item').map((color) => color.text()),
                        printMode: $item('printMode').text(),
                        previewDisplay: $item('previewDisplay').text().toBoolean(),
                    }
                })

                const displaysetString = '/response/content/itemType/param/displaySetting/displayPosition/'
                pageData.value.displaysetList.xmin = Number($(`${displaysetString}coordinateSystem/X`).attr('min'))
                pageData.value.displaysetList.xmax = Number($(`${displaysetString}coordinateSystem/X`).attr('max'))
                pageData.value.displaysetList.ymin = Number($(`${displaysetString}coordinateSystem/Y`).attr('min'))
                pageData.value.displaysetList.ymax = Number($(`${displaysetString}coordinateSystem/Y`).attr('max'))
                pageData.value.displaysetList.wmin = Number($(`${displaysetString}width`).attr('min'))
                pageData.value.displaysetList.hmin = Number($(`${displaysetString}height`).attr('min'))

                pageData.value.manufacturersList = $('/response/types/manufacturers/enum').map((item) => {
                    const value = item.text()
                    return {
                        value,
                        name: value === 'General' ? Translate('IDCS_PROTOCOL_TYPE') : value,
                    }
                })

                pageData.value.encodeList = $('/response/types/encodeFormat/enum').map((item) => ({
                    value: item.text(),
                    name: item.text(),
                }))

                const data: SystemPosList[] = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const manufacturers = $item('param/manufacturers').text()
                    const connectionType = $item('param/connectionType').text()
                    return {
                        id: item.attr('id')!,
                        name: $item('param/name').text(),
                        switch: $item('param/switch').text(),
                        connectionType,
                        manufacturers,
                        connectionSetting: {
                            posIp: $item('param/connectionSetting/posIp').text(),
                            filterDstIpSwitch: $item('param/connectionSetting/filterDstIpSwitch').text().toBoolean(),
                            dstIp: $item('param/connectionSetting/dstIp').text(),
                            filterPostPortSwitch: $item('param/connectionSetting/filterPostPortSwitch').text().toBoolean(),
                            posPort: Number($item('param/connectionSetting/posPort').text()),
                            filterDstPortSwitch: $item('param/connectionSetting/filterDstPortSwitch').text().toBoolean(),
                            dstPort: Number($item('param/connectionSetting/dstPort').text()),
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
                                ignoreCase: $item('param/displaySetting/common/ignoreCase').text().toBoolean(),
                                timeOut: Number($item('param/displaySetting/common/timeOut').text()),
                            },
                            displayPosition: {
                                width: Number($item('param/displaySetting/displayPosition/width').text()),
                                height: Number($item('param/displaySetting/displayPosition/height').text()),
                                X: Number($item('param/displaySetting/displayPosition/X').text()),
                                Y: Number($item('param/displaySetting/displayPosition/Y').text()),
                            },
                        },
                        triggerChl: {
                            switch: $item('trigger/triggerChl/switch').text().toBoolean(),
                            chls: $item('triggerChl/chls/item').map((chl) => ({
                                id: chl.attr('id')!,
                                text: chl.text(),
                                till: chl.attr('till'),
                            })),
                        },
                    }
                })
                tableData.value = data

                nextTick(() => {
                    pageData.value.mounted = true
                })
            }
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            if (!verify) return

            openLoading(LoadingTarget.FullScreen)

            const listXml = tableData.value
                .map((item) => {
                    const chls = item.triggerChl.chls
                        .map((chl) => {
                            return `<item id="${chl.id}" ${chl.till && Number(chl.till) > 0 ? `till="${chl.till}"` : ''}>${wrapCDATA(chl.text)}</item>`
                        })
                        .join('')
                    const startEndChar = item.displaySetting.common.startEndChar
                        .filter((child) => child.startChar && child.endChar)
                        .map((child) => {
                            return rawXml`
                                <item>
                                    <startChar>${wrapCDATA(child.startChar)}</startChar>
                                    <endChar>${wrapCDATA(child.endChar)}</endChar>
                                </item>
                            `
                        })
                        .join('')
                    const lineBreak = item.displaySetting.common.lineBreak
                        .filter((child) => !!child)
                        .map((child) => `<item>${wrapCDATA(child)}</item>`)
                        .join('')
                    const ignoreChar = item.displaySetting.common.ignoreChar
                        .filter((child) => !!child)
                        .map((child) => `<item>${wrapCDATA(child)}</item>`)
                        .join('')

                    return rawXml`
                        <item id="${item.id}">
                            <trigger>
                                <triggerChl>
                                    <switch>${String(item.triggerChl.switch)}</switch>
                                    <chls>${item.triggerChl.switch ? chls : ''}</chls>
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
                                    <filterDstIpSwitch>${String(item.connectionSetting.filterDstIpSwitch)}</filterDstIpSwitch>
                                    <dstIp>${item.connectionSetting.dstIp}</dstIp>
                                    <filterPostPortSwitch>${String(item.connectionSetting.filterPostPortSwitch)}</filterPostPortSwitch>
                                    <posPort>${String(item.connectionSetting.posPort)}</posPort>
                                    <filterDstPortSwitch>${String(item.connectionSetting.filterDstPortSwitch)}</filterDstPortSwitch>
                                </connectionSetting>
                                <displaySetting>
                                    <common>
                                        <startAndEndList>${startEndChar}</startAndEndList>
                                        <lineBreak>${lineBreak}</lineBreak>
                                        <ignoreChar>${ignoreChar}</ignoreChar>
                                        <ignoreCase>${String(item.displaySetting.common.ignoreCase)}</ignoreCase>
                                        <timeOut unit="s">${String(item.displaySetting.common.timeOut)}</timeOut>
                                    </common>
                                    <displayPosition>
                                        <width>${String(item.displaySetting.displayPosition.width)}</width>
                                        <height>${String(item.displaySetting.displayPosition.height)}</height>
                                        <X>${String(item.displaySetting.displayPosition.X)}</X>
                                        <Y>${String(item.displaySetting.displayPosition.Y)}</Y>
                                    </displayPosition>
                                </displaySetting>
                            </param>
                        </item>
                    `
                })
                .join('')

            const channelXml = pageData.value.colorData
                .map((item) => {
                    return rawXml`
                        <chl id="${item.chlId}">
                            <color>${item.colorList.map((color) => `<item>${color}</item>`).join('')}</color>
                            <printMode>${item.printMode}</printMode>
                            <previewDisplay>${String(item.previewDisplay)}</previewDisplay>
                        </chl>
                    `
                })
                .join('')

            const sendXml = rawXml`
                <content>${listXml}</content>
                <channel>${channelXml}</channel>
            `

            const result = await editPosList(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    title: Translate('IDCS_SUCCESS_TIP'),
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 表单校验
         */
        const verify = () => {
            // pos开启时,IP组播的有效地址是 >=224 <=239
            const isValidAddress = tableData.value.every((item) => {
                const connectionType = item.connectionType
                const connectionSettingIp = item.connectionSetting.posIp.split('.')
                if (item.switch.toBoolean() && connectionSettingIp.length) {
                    const d1 = Number(connectionSettingIp[0])
                    const d2 = Number(connectionSettingIp[1])
                    const d3 = Number(connectionSettingIp[2])
                    const d4 = Number(connectionSettingIp[3])
                    const firstPart = connectionType == 'Multicast' ? d1 >= 224 && d1 <= 239 : d1 >= 1 && d1 <= 223
                    if (!(firstPart && d2 >= 0 && d2 <= 255 && d3 >= 0 && d3 <= 255 && d4 >= 0 && d4 <= 255)) {
                        return false
                    }
                }
                return true
            })
            if (!isValidAddress) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PROMPT_IPADDRESS_INVALID'),
                })
                return false
            }

            // pos开启时,ip不能为空
            const isNoEmptyIp = tableData.value.every((item) => {
                const connectionSetting = item.connectionSetting
                if (item.switch.toBoolean() && connectionSetting.posIp === '') {
                    return false
                }
                return true
            })
            if (!isNoEmptyIp) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_POS_IP_EMPTY'),
                })
                return false
            }

            // 连接方式为UDP/组播时端口号不能为空
            const isNoEmptyPort = tableData.value.every((item) => {
                const connectionSetting = item.connectionSetting
                if (item.switch.toBoolean() && item.connectionType !== 'TCP-Listen') {
                    if (connectionSetting.posPort === 0 || connectionSetting.posPort < 10) {
                        return false
                    }
                }
                return true
            })
            if (!isNoEmptyPort) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_POS_PORT_EMPTY'),
                })
                return false
            }

            // 启用pos时，ip+端口不能指向同一个地址 10.10.1.1:9000
            const useIPAndPort = tableData.value
                .filter((item) => {
                    const connectionSetting = item.connectionSetting
                    if (item.switch.toBoolean() && connectionSetting.posIp) {
                        return true
                    }
                    return false
                })
                .map((item) => {
                    const connectionSetting = item.connectionSetting
                    return `${connectionSetting.posIp}:${connectionSetting.posPort || 0}`
                })
            const isSameIPAndPort = useIPAndPort.length && useIPAndPort.length !== Array.from(new Set(useIPAndPort)).length
            if (isSameIPAndPort) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_POS_IP_SAME'),
                })
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
            tableData.value[pageData.value.connectionDialogIndex].connectionSetting.posPort = e.port
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

        const stopWatchTableData = watch(
            tableData,
            () => {
                if (pageData.value.mounted) {
                    pageData.value.submitDisabled = false
                    stopWatchTableData()
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
            pageData,
            tableData,
            linkChls,
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

            PosConnectionSettingsPop,
            PosTriggerChannelPop,
            PosHayleyTriggerChannelPop,
            PosDisplaySettingPop,
            BaseImgSprite,
        }
    },
})
