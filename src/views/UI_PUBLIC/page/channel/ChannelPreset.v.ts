/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 18:26:51
 * @Description: 云台-预置点
 */
import { type FormRules, type TableInstance } from 'element-plus'
import ChannelPtzCtrlPanel from './ChannelPtzCtrlPanel.vue'
import ChannelPresetAddPop from './ChannelPresetAddPop.vue'
import ChannelPtzTableExpandPanel from './ChannelPtzTableExpandPanel.vue'
import ChannelPtzTableExpandItem from './ChannelPtzTableExpandItem.vue'

export default defineComponent({
    components: {
        ChannelPtzCtrlPanel,
        ChannelPresetAddPop,
        ChannelPtzTableExpandPanel,
        ChannelPtzTableExpandItem,
    },
    setup() {
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()
        const auth = useUserChlAuth(false)

        const pageData = ref({
            // 当前表格选中索引
            tableIndex: 0,
            // 表格展开索引列表
            expandRowKey: [] as string[],
            // 是否显示新增弹窗
            isAddPop: false,
            // 通道ID
            addChlId: '',
            addData: new ChannelPtzPresetChlDto(),
            // 速度
            speed: 4,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzPresetChlDto[]>([])

        const chlOptions = computed(() => {
            return tableData.value.map((item, index) => {
                return {
                    label: item.chlName,
                    value: index,
                }
            })
        })

        const formRef = useFormRef()

        const formData = ref({
            // 预置点名称
            name: '',
            // 预置点索引
            presetIndex: '' as string | number,
        })

        const rules = ref<FormRules>({
            name: [
                {
                    validator(_rule, value: string, callback) {
                        if (tableData.value[pageData.value.tableIndex].presets.some((item) => item.name === value)) {
                            callback(new Error(Translate('IDCS_PROMPT_PRESET_NAME_EXIST')))
                            return
                        }

                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (!checkPresetName(value)) {
                            callback(new Error(Translate('IDCS_CAN_NOT_CONTAIN_SPECIAL_CHAR').formatForLang(PRESET_LIMIT_CHAR)))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
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
            }

            if (mode.value === 'ocx') {
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

            if ($('status').text() === 'success') {
                const item = tableData.value[index]
                item.presets = $('content/presets/item')
                    .map((item) => {
                        return {
                            index: item.attr('index').num(),
                            name: item.text(),
                        }
                    })
                    .sort((a, b) => a.index - b.index)
                item.presetCount = item.presets.length
                item.maxCount = $('content/presets').attr('maxCount').num() // 可配置的最大预置点数
                item.nameMaxByteLen = $('content/presets/itemType').attr('maxByteLen').num() || nameByteMaxLen
                item.disabled = false
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
                requireField: ['supportAZ', 'supportIris', 'supportPtz', 'supportIntegratedPtz'],
            })
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    if (auth.value.hasAll || auth.value.ptz[item.attr('id')]) {
                        // 云台权限控制
                        // supportAZ：新增；支持zoom控制（变倍、聚焦）；支持IPC：支持AZ的IPC，第三方协议添加的IPC;
                        // supportIris：新增；支持zoom控制（光圈）；支持IPC：支持AZ的IPC，第三方协议添加的IPC;
                        // supportPtz：修改；支持zoom控制（变倍），ptz云台转动，预置点，巡航线；支持IPC：鱼眼PTZ通道，第三方协议添加的IPC;
                        // supportIntegratedPtz：新增；支持ptz云台转动，zoom控制（变倍、聚焦、光圈），预置点，巡航线，巡航线组，轨迹，ptz任务，看守位;
                        const supportAZ = $item('supportAZ').text().bool()
                        const supportIris = $item('supportIris').text().bool()
                        const supportPtz = $item('supportPtz').text().bool()
                        const minSpeed = $item('supportPtz').attr('MinPtzCtrlSpeed').num()
                        const maxSpeed = $item('supportPtz').attr('MaxPtzCtrlSpeed').num()
                        const supportIntegratedPtz = $item('supportIntegratedPtz').text().bool()
                        if ($item('chlType').text() !== 'recorder' && (supportPtz || supportIntegratedPtz)) {
                            tableData.value.push({
                                chlId: item.attr('id'),
                                chlName: $item('name').text(),
                                presetCount: $item('presetCount').text().num(),
                                presets: [],
                                maxCount: Infinity,
                                nameMaxByteLen: 63,
                                disabled: true,
                                supportPtz,
                                supportAZ,
                                supportIris,
                                minSpeed,
                                maxSpeed,
                                supportIntegratedPtz,
                                status: '',
                                statusTip: '',
                            })
                        }
                    }
                })
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.tableIndex])
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
        const handleExpandChange = (row: ChannelPtzPresetChlDto, expanded: boolean) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            tableRef.value!.setCurrentRow(row)
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
            return (
                tableData.value[pageData.value.tableIndex]?.presets.map((item, value) => ({
                    ...item,
                    value,
                })) || []
            )
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
                openMessageBox(Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                return
            }
            pageData.value.addChlId = current.chlId
            pageData.value.addData = current
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
                            <item index="${preset.index}">${wrapCDATA(preset.name)}</item> 
                        </presetIndexes>
                    </condition>
                `
                const result = await delChlPreset(sendXml)

                closeLoading()
                commDelResponseHandler(result, () => {
                    tableData.value[chlIndex].presets.splice(presetIndex, 1)
                    tableData.value[chlIndex].presetCount--
                })
            })
        }

        /**
         * @description 修改预置点名称
         */
        const saveName = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXml = rawXml`
                        <content>
                            <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                            <index>${currentPreset.value.index}</index>
                            <name maxByteLen="63">${wrapCDATA(formData.value.name)}</name>
                        </content>
                    `
                    const result = await editChlPreset(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        }).finally(() => {
                            tableData.value[pageData.value.tableIndex].presets[formData.value.presetIndex as number].name = formData.value.name
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        if (errorCode === ErrorCode.USER_ERROR_NAME_EXISTED) {
                            openMessageBox(Translate('IDCS_PROMPT_PRESET_NAME_EXIST'))
                        } else {
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        }
                    }
                }
            })
        }

        /**
         * @description 保存预置点位置
         */
        const savePosition = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chlId>${tableData.value[pageData.value.tableIndex].chlId}</chlId>
                    <index>${currentPreset.value.index}</index>
                </content>  
            `
            const result = await editChlPresetPosition(sendXml)

            closeLoading()
            commSaveResponseHandler(result)
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
                    <index>${currentPreset.value.index}</index>
                    <speed>${pageData.value.speed}</speed>
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
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            formRef,
            rules,
            handlePlayerReady,
            pageData,
            tableData,
            chlOptions,
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
        }
    },
})
