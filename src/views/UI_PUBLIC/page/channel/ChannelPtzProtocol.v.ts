/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:12
 * @Description: 云台-协议
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-27 09:11:19
 */
import { cloneDeep } from 'lodash-es'
import { type TableInstance } from 'element-plus'
import { type ChannelPtzProtocolDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()

        const pageData = ref({
            notification: [] as string[],
            // 云台选项
            ptzOptions: [
                {
                    label: Translate('IDCS_ON'),
                    value: true,
                },
                {
                    label: Translate('IDCS_OFF'),
                    value: false,
                },
            ],
            // 云台索引
            tableIndex: 0,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzProtocolDto[]>([])

        let cacheTableData: ChannelPtzProtocolDto[] = []

        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }
            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 修改所有行云台选项
         * @param {boolean} bool
         */
        const changeAllPtz = (bool: boolean) => {
            tableData.value.forEach((item) => {
                item.ptz = bool
            })
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const { chlId, chlName } = tableData.value[pageData.value.tableIndex]
            if (mode.value === 'h5') {
                player.play({
                    chlID: chlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        /**
         * @description 获取行数据
         * @param {string} chlId
         * @param {number} index
         */
        const getConfig = async (chlId: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryPtzProtocol(sendXml)
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                tableData.value[index].baudRate = $('/response/content/chl/baudRate').text()
                tableData.value[index].protocol = $('/response/content/chl/protocol').text()
                tableData.value[index].address = Number($('/response/content/chl/address').text())
                tableData.value[index].addressMin = Number($('/response/content/chl/address').attr('min')!)
                tableData.value[index].addressMax = Number($('/response/content/chl/address').attr('max')!)
                tableData.value[index].ptz = $('/response/content/chl/ptz').text().toBoolean()
                tableData.value[index].baudRateOptions = $('/response/types/baudRate/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })
                tableData.value[index].protocolOptions = $('/response/types/protocol/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })
                tableData.value[index].status = 'success'
            } else {
                tableData.value[index].status === 'fail'
            }
            cacheTableData.push({ ...tableData.value[index] })
        }

        /**
         * @description 保存编辑行数据
         */
        const setData = async () => {
            const edits: ChannelPtzProtocolDto[] = []
            tableData.value.forEach((item, index) => {
                if (item.status !== 'success') {
                    return
                }
                const params = ['address', 'baudRate', 'protocol', 'ptz']
                params.some((param) => {
                    if (!cacheTableData[index]) {
                        return false
                    }
                    if (item[param] !== cacheTableData[index][param]) {
                        edits.push(item)
                        return true
                    }
                    return false
                })
            })

            openLoading(LoadingTarget.FullScreen)

            for (let i = 0; i < edits.length; i++) {
                const item = edits[i]
                const sendXml = rawXml`
                    <types>
                        <baudRate>${wrapEnums(item.baudRateOptions)}</baudRate>
                        <protocol>${wrapEnums(item.protocolOptions)}</protocol>
                    </types>
                    <content>
                        <chl id="${item.chlId}">
                            <baudRate type="baudRate">${item.baudRate}</baudRate>
                            <protocol type="protocol">${item.protocol}</protocol>
                            <address min="${item.addressMin.toString()}" max="${item.addressMax.toString()}">${item.address.toString()}</address>
                            <ptz>${item.ptz.toString()}</ptz>
                        </chl>
                    </content>
                `
                await editPtzProtocol(sendXml)
            }

            cacheTableData = cloneDeep(tableData.value)
            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                chlType: 'analog',
            })
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                tableData.value = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        chlId: item.attr('id')!,
                        chlName: $item('name').text(),
                        baudRate: '',
                        protocol: '',
                        address: 1,
                        addressMin: 1,
                        addressMax: 1,
                        ptz: false,
                        baudRateOptions: [],
                        protocolOptions: [],
                        status: 'loading',
                    }
                })
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzProtocolDto} row
         */
        const handleRowClick = (row: ChannelPtzProtocolDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        onMounted(async () => {
            await getData()
            for (let i = 0; i < tableData.value.length; i++) {
                await getConfig(tableData.value[i].chlId, i)
            }
        })

        return {
            playerRef,
            handlePlayerReady,
            pageData,
            tableData,
            changeChl,
            setData,
            handleRowClick,
            changeAllPtz,
        }
    },
})
