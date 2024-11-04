/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 18:26:51
 * @Description: 云台-预置点
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 14:07:25
 */
import { type TableInstance } from 'element-plus'
import ChannelPtzCtrlPanel from './ChannelPtzCtrlPanel.vue'
import ChannelPresetAddPop from './ChannelPresetAddPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'
import { type ChannelPtzPresetChlDto, ChannelPtzPresetDto } from '@/types/apiType/channel'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        ChannelPresetAddPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()
        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        const pageData = ref({
            // 通知列表
            notification: [] as string[],
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            // 最大预置点数
            addPresetMax: 128,
            // 预置点列表
            addPresets: [] as ChannelPtzPresetDto[],
            // 通道ID
            addChlId: '',
            // 速度
            speed: 4,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzPresetChlDto[]>([])

        const formData = ref({
            // 预置点名称
            name: '',
            // 预置点索引
            presetIndex: '' as string | number,
        })

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
         * @description 获取通道的预置点
         */
        const getPreset = async (chlId: string) => {
            openLoading()

            const index = tableData.value.findIndex((item) => item.chlId === chlId)
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value[index].presets = $('//content/presets/item').map((item) => {
                    // const $item = queryXml(item.element)
                    return {
                        index: Number(item.attr('index')!),
                        name: item.text(),
                    }
                })
                tableData.value[index].presetCount = tableData.value[index].presets.length
                tableData.value[index].maxCount = Number($('//content/presets').attr('maxCount'))
            }
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                requireField: ['presetCount'],
                isSupportPtz: true,
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/item')
                    .filter((item) => {
                        const $item = queryXml(item.element)
                        return (auth.value.hasAll || auth.value.ptz[item.attr('id')!]) && $item('chlType').text() !== 'recorder'
                    })
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            chlId: item.attr('id')!,
                            chlName: $item('name').text(),
                            presetCount: Number($item('presetCount').text()),
                            presets: [],
                            maxCount: Infinity,
                        }
                    })
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
            getPreset(tableData.value[pageData.value.tableIndex].chlId)
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzPresetChlDto} row
         */
        const handleRowClick = (row: ChannelPtzPresetChlDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getPreset(tableData.value[pageData.value.tableIndex].chlId)
            }
        }

        /**
         * @description 表格项展开回调
         * @param {ChannelPtzPresetChlDto} row
         * @param {boolean} expanded
         */
        const handleExpandChange = async (row: ChannelPtzPresetChlDto, expanded: boolean) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            tableRef.value?.setCurrentRow(row)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
                getPreset(tableData.value[pageData.value.tableIndex].chlId)
            }

            if (expanded) {
                if (!pageData.value.expandRowKey.includes(row.chlId)) {
                    pageData.value.expandRowKey.push(row.chlId)
                }
            } else {
                const index = pageData.value.expandRowKey.indexOf(row.chlId)
                if (index > -1) {
                    pageData.value.expandRowKey.splice(index, 1)
                }
            }
        }

        const getRowKey = (row: ChannelPtzPresetChlDto) => {
            return row.chlId
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        // 当前预置点选项
        const presetOptions = computed(() => {
            return tableData.value[pageData.value.tableIndex]?.presets || []
        })

        const defaultPreset = new ChannelPtzPresetDto()

        // 当前预置点
        const currentPreset = computed(() => {
            if (typeof formData.value.presetIndex === 'string') {
                return defaultPreset
            }
            return presetOptions.value[formData.value.presetIndex] || defaultPreset
        })

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        watch(presetOptions, (option) => {
            if (option.length) {
                formData.value.presetIndex = 0
            } else {
                formData.value.presetIndex = ''
            }
        })

        watch(currentPreset, (preset) => {
            formData.value.name = preset.name
            callPreset()
        })

        /**
         * @description 打开新增预置点弹窗
         * @param {Number} index
         */
        const addPreset = (index: number) => {
            const current = tableData.value[index]
            if (current.presets.length >= current.maxCount) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                })
                return
            }
            pageData.value.addPresetMax = current.maxCount
            pageData.value.addPresets = current.presets
            pageData.value.addChlId = current.chlId
            pageData.value.isAddPop = true
        }

        /**
         * @description 确认新增预置点
         */
        const confirmAddPreset = () => {
            pageData.value.isAddPop = false
            const findIndex = tableData.value.findIndex((item) => item.chlId === pageData.value.addChlId)
            if (findIndex > -1) {
                getPreset(tableData.value[findIndex].chlId)
            }
        }

        /**
         * @description 删除预置点
         * @param {number} chlIndex 索引值
         * @param {number} presetIndex 索引值
         */
        const deletePreset = (chlIndex: number, presetIndex: number) => {
            const chlId = tableData.value[chlIndex].chlId
            const chlName = tableData.value[chlIndex].chlName
            const preset = tableData.value[chlIndex].presets[presetIndex]
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_PRESET_S').formatForLang(Translate('IDCS_CHANNEL'), getShortString(chlName, 10), getShortString(preset.name, 10)),
            }).then(async () => {
                openLoading()

                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                        <presetIndexes type="list">
                            <item index="${preset.index.toString()}">${wrapCDATA(preset.name)}</item> 
                        </presetIndexes>
                    </condition>
                `
                const result = await delChlPreset(sendXml)

                closeLoading()
                commSaveResponseHadler(result, () => {
                    tableData.value[chlIndex].presets.splice(presetIndex, 1)
                    tableData.value[chlIndex].presetCount--
                })
            })
        }

        /**
         * @description 修改预置点名称
         */
        const saveName = async () => {
            if (!formData.value.name || !presetOptions.value.length) {
                return
            }

            openLoading()

            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentPreset.value.index.toString()}</index>
                    <name maxByteLen="63">${wrapCDATA(formData.value.name)}</name>
                </content>
            `
            const result = await editChlPreset(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    tableData.value[pageData.value.tableIndex].presets[formData.value.presetIndex as number].name = formData.value.name
                })
            } else {
                const errorCode = Number($('//errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_PRESET_NAME_EXIST'),
                    })
                } else {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_SAVE_DATA_FAIL'),
                    })
                }
            }
        }

        /**
         * @description 保存预置点位置
         */
        const savePosition = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentPreset.value.index.toString()}</index>
                </content>  
            `
            const result = await editChlPresetPosition(sendXml)

            closeLoading()
            commSaveResponseHadler(result)
        }

        /**
         * @description 执行预置点
         * @param {Number} value
         * @param {Number} index
         */
        const callPreset = () => {
            if (!presetOptions.value.length) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentPreset.value.index.toString()}</index>
                    <speed>${pageData.value.speed.toString()}</speed>
                </content>
            `
            goToPtzPreset(sendXml)
        }

        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setSpeed = (speed: number) => {
            pageData.value.speed = speed
        }

        onMounted(async () => {
            await auth.value.update()
            await getData()
            if (tableData.value.length) {
                tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
                getPreset(tableData.value[pageData.value.tableIndex].chlId)
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            handlePlayerReady,
            pageData,
            tableData,
            formData,
            changeChl,
            handleRowClick,
            presetOptions,
            handleExpandChange,
            getRowKey,
            addPreset,
            confirmAddPreset,
            saveName,
            savePosition,
            deletePreset,
            setSpeed,
            nameByteMaxLen,
            formatInputMaxLength,
            ChannelPtzCtrlPanel,
            ChannelPresetAddPop,
            ChannelPtzTableExpandPanel,
            ChannelPtzTableExpandItem,
        }
    },
})
