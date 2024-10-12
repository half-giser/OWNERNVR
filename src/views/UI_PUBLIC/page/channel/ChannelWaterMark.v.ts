/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:59
 * @Description: 水印设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 16:23:05
 */
import { type ChannelWaterMarkDto } from '@/types/apiType/channel'
import { type DropdownInstance, type TableInstance } from 'element-plus'
import { cloneDeep } from 'lodash-es'
export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()
        const { Translate } = useLangStore()
        // const systemCaps = useCababilityStore()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()
        const osType = getSystemInfo().platform
        // 用于控制下拉菜单的打开关闭
        const dropdownRef = ref<DropdownInstance>()
        const tableRef = ref<TableInstance>()
        const pageData = ref({
            currChlId: '',
            switchDisabled: true,
            // 当前选择通道数据
            chlData: {} as ChannelWaterMarkDto,
            // 通道列表
            chlList: [] as ChannelWaterMarkDto[],
            customTextSetAll: '',
            notification: [] as string[],
            initComplete: false,
            options: [
                {
                    label: Translate('IDCS_ON'),
                    value: 'true',
                },
                {
                    label: Translate('IDCS_OFF'),
                    value: 'false',
                },
            ],
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            editRows: [] as ChannelWaterMarkDto[],
            applyDisabled: true,
        })
        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']
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
                plugin.AddPluginMoveEvent(document.getElementById('player')!)
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.DisplayOCX(true)
            }
        }
        //播放视频
        const play = () => {
            const { chlName } = pageData.value.chlData
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.currChlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [pageData.value.chlData['chlId']],
                        chlNameList: [pageData.value.chlData['chlName']],
                        streamType: 'sub',
                        chlIndexList: ['1'],
                        chlTypeList: [pageData.value.chlData['chlType']],
                    })
                    plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    plugin.RetryStartChlView(pageData.value.currChlId, chlName)
                }
            }
        }
        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && pageData.value.initComplete) {
                nextTick(() => {
                    play()
                })
                stopWatchFirstPlay()
            }
        })
        const handleChlChange = (value: string) => {
            const chlData = pageData.value.chlList.filter((item) => item.chlId == value)[0] as ChannelWaterMarkDto
            pageData.value.chlData = cloneDeep(chlData)
            if (pageData.value.chlData.disabled) {
                pageData.value.switchDisabled = true
            } else {
                pageData.value.switchDisabled = false
            }
            tableRef.value?.setCurrentRow(getRowById(value))
            play()
        }
        const handleSwitchChange = (value: string) => {
            addEditRow(pageData.value.chlData)
            pageData.value.chlList.forEach((item) => {
                if (item.chlId == pageData.value.currChlId) {
                    item.switch = value
                }
            })
        }
        const handleTableSwitchChange = (row: ChannelWaterMarkDto) => {
            if (pageData.value.currChlId == row.chlId) {
                pageData.value.chlData.switch = row.switch
            }
            addEditRow(pageData.value.chlData)
        }
        const handleSwitchChangeAll = (value: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.switch = value
                    addEditRow(item)
                }
                if (pageData.value.currChlId == item.chlId) {
                    pageData.value.chlData.switch = value
                }
            })
            pageData.value.applyDisabled = false
        }
        const handleFocus = (customText: string, type: string) => {
            const reg = /[^A-Za-z0-9]/g
            if (reg.test(customText)) {
                if (type === 'form') {
                    pageData.value.chlData.customText = customText.replace(reg, '')
                } else {
                    pageData.value.customTextSetAll = customText.replace(reg, '')
                }
            }
        }

        const handleCustomTextInput = (customText: string) => {
            pageData.value.chlList.forEach((item) => {
                if (item.chlId == pageData.value.currChlId) {
                    item.customText = customText
                }
            })
            addEditRow(pageData.value.chlData)
        }
        const handleSetCustomTextAll = (customText: string) => {
            pageData.value.chlList.forEach((item) => {
                if (!item.disabled) {
                    item.customText = customText
                    addEditRow(item)
                }
                if (pageData.value.currChlId == item.chlId) {
                    pageData.value.chlData.customText = customText
                }
            })
        }
        const handleSetCancel = () => {
            if (dropdownRef.value) {
                dropdownRef.value.handleClose()
            }
        }
        const getChannelList = async () => {
            pageData.value.initComplete = false
            const res = await getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlName: '',
                isSupportMaskSetting: true,
            })
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                pageData.value.chlList = []
                pageData.value.totalCount = Number($('//content').attr('total'))
                $('//content/item').forEach((item) => {
                    const $ = queryXml(item.element)
                    if ($('chlType').text() == 'analog') {
                        pageData.value.chlList.push({
                            chlId: item.attr('id')!,
                            chlName: $('name').text(),
                            chlIndex: '1',
                            chlType: $('chlType').text(),
                            status: 'loading',
                            disabled: true,
                            switch: '',
                            customText: '',
                        })
                    }
                })
                pageData.value.currChlId = pageData.value.chlList[0].chlId
                pageData.value.chlList.forEach(async (item) => {
                    getData(item)
                })
                tableRef.value?.setCurrentRow(pageData.value.chlList[0])
                pageData.value.initComplete = true
            }
        }
        const getData = async (item: ChannelWaterMarkDto) => {
            const sendXml = rawXml`<condition><chlId>${item.chlId}</chlId></condition>`
            const res = await queryChlWaterMark(getXmlWrapData(sendXml))
            const $ = queryXml(res)
            if ($('status').text() == 'success') {
                const waterMarkSwitch = $('//content/chl/watermark/switch').text()
                const customText = $('//content/chl/watermark/customText').text()
                item.disabled = false
                item.status = ''
                item.switch = waterMarkSwitch
                item.customText = customText
                if (item.chlId == pageData.value.currChlId) {
                    pageData.value.chlData = cloneDeep(item)
                    if (pageData.value.chlData.disabled) {
                        pageData.value.switchDisabled = true
                    } else {
                        pageData.value.switchDisabled = false
                    }
                }
            } else {
                item.status = ''
                if (item.chlId == pageData.value.currChlId) {
                    pageData.value.chlData = cloneDeep(item)
                }
            }
        }
        const getSaveData = (row: ChannelWaterMarkDto) => {
            const sendXml = rawXml`
                            <content>
                                <chl id="${row.chlId}">
                                    <waterMark>
                                        <switch>${row.switch}</switch>
                                        <customText>${row.customText.trim()}</customText>
                                    </waterMark>
                                </chl>
                            </content>
                        `
            return getXmlWrapData(sendXml)
        }
        const setData = async () => {
            openLoading()
            pageData.value.editRows.forEach(async (item) => {
                const sendXml = getSaveData(item)
                const res = await editChlWaterMark(sendXml)
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    item.status = 'success'
                } else {
                    item.status = 'error'
                }
            })
            closeLoading()
            pageData.value.editRows = []
            pageData.value.applyDisabled = true
        }
        const handleApply = async () => {
            setData()
        }
        const handleRowClick = (rowData: ChannelWaterMarkDto) => {
            if (!rowData.disabled) {
                pageData.value.currChlId = rowData.chlId
                pageData.value.chlData = cloneDeep(rowData)
                if (pageData.value.chlData.disabled) {
                    pageData.value.switchDisabled = true
                } else {
                    pageData.value.switchDisabled = false
                }
                tableRef.value?.setCurrentRow(rowData)
                play()
            }
        }
        const getRowById = (chlId: string) => {
            return pageData.value.chlList.find((element) => element.chlId == chlId) as ChannelWaterMarkDto
        }
        const addEditRow = function (row: ChannelWaterMarkDto) {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.chlId === row.chlId)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisabled = false
        }
        const changePagination = () => {
            getChannelList()
        }
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getChannelList()
        }
        onMounted(async () => {
            await getChannelList()
        })
        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                plugin.CloseCurPlugin(document.getElementById('player'))
            }
            if (mode.value === 'h5') {
                player.destroy()
            }
        })
        return {
            pageData,
            handlePlayerReady,
            playerRef,
            dropdownRef,
            tableRef,
            handleChlChange,
            handleSwitchChange,
            handleTableSwitchChange,
            handleSwitchChangeAll,
            handleFocus,
            handleCustomTextInput,
            handleSetCustomTextAll,
            handleSetCancel,
            handleApply,
            handleRowClick,
            getRowById,
            addEditRow,
            changePagination,
            changePaginationSize,
        }
    },
})
