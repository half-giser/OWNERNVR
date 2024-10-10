/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 09:01:11
 * @Description: 云台-智能追踪
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-14 16:07:36
 */
import { cloneDeep } from 'lodash-es'
import { type TableInstance } from 'element-plus'
import { type ChannelPtzSmartTrackDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const playerRef = ref<PlayerInstance>()

        const pageData = ref({
            notification: [] as string[],
            // 追踪模式选项
            trackModeOptions: [
                {
                    label: Translate('IDCS_AUTO_TRACK_CONTROL_PRIORITY'),
                    value: 'auto',
                },
                {
                    label: Translate('IDCS_MANUAL_CONTROL_PRIORITY'),
                    value: 'manual',
                },
            ],
            // 目标静止后自动归位选项
            autoBackOptions: [
                {
                    label: Translate('IDCS_ENABLE'),
                    value: true,
                },
                {
                    label: Translate('IDCS_CLOSE'),
                    value: false,
                },
            ],
            // 选中行索引
            tableIndex: 0,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzSmartTrackDto[]>([])

        let cacheTableData: ChannelPtzSmartTrackDto[] = []

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
                    plugin.SetPluginNoResponse()
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
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
         * @description 修改所有行目标静止后归位
         * @param {Boolean} bool
         */
        const changeAllAutoBack = (bool: boolean) => {
            tableData.value.forEach((item) => {
                item.autoBackSwitch = bool
            })
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
            const result = await queryBallIPCATCfg(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                tableData.value[index].autoBackSwitch = $('//content/chl/param/backTime/switch').text().toBoolean()
                tableData.value[index].autoBackTime = Number($('//content/chl/param/backTime/timeValue').text())
                tableData.value[index].ptzControlMode = $('//content/chl/param/ptzControlMode').text()
            }
            tableData.value[index].status = ''
            cacheTableData.push({ ...tableData.value[index] })
        }

        /**
         * @description 提交编辑行的数据
         */
        const setData = async () => {
            const edits: ChannelPtzSmartTrackDto[] = []
            const editsIndex: number[] = []
            tableData.value.forEach((item, index) => {
                if (item.status === 'loading') {
                    return
                }
                const params = ['autoBackSwitch', 'autoBackTime', 'ptzControlMode']
                params.some((param) => {
                    if (!cacheTableData[index]) {
                        return false
                    }
                    if (item[param] !== cacheTableData[index][param]) {
                        edits.push(item)
                        editsIndex.push(index)
                        return true
                    }
                    return false
                })
            })

            openLoading()

            for (let i = 0; i < edits.length; i++) {
                const item = edits[i]
                const sendXml = rawXml`
                    <content>
                        <chl id="${item.chlId}">
                            <param>
                                <backTime>
                                    <switch>${item.autoBackSwitch.toString()}</switch>
                                    <timeValue>${item.autoBackTime.toString()}</timeValue>
                                </backTime>
                                <ptzControlMode>${item.ptzControlMode}</ptzControlMode>
                            </param>
                        </chl>
                    </content>
                `
                const result = await editBallIPCATCfg(sendXml)
                const $ = queryXml(result)
                if ($('//status').text() === 'success') {
                    tableData.value[editsIndex[i]].status = 'success'
                } else {
                    tableData.value[editsIndex[i]].status = 'error'
                }
            }

            cacheTableData = cloneDeep(tableData.value)
            closeLoading()
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                isSupportAutoTrack: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        chlId: item.attr('id')!,
                        chlName: $item('name').text(),
                        autoBackSwitch: false,
                        autoBackTime: 0,
                        ptzControlMode: 'manual',
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
         * @param {ChannelPtzSmartTrackDto} row
         */
        const handleRowClick = (row: ChannelPtzSmartTrackDto) => {
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
            changeAllAutoBack,
        }
    },
})
