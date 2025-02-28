/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-18 13:54:46
 * @Description: 通道 - 鱼眼设置
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelFisheyeDto())
        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelFisheyeDto[]>([])
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        // 当前列表中存在的鱼眼模式枚举
        const fishEyeModelList = ref(new Set<string>())
        // 当前列表中存在的安装模式枚举
        const installTypeList = ref(new Set<string>())
        const deviceDatacache: Record<string, Record<string, string>> = {}
        const hikvisionIds: string[] = []
        const privateProtocolIds: string[] = []
        const switchOptions = getTranslateOptions(DEFAULT_BOOL_SWITCH_OPTIONS)
        const editRows = useWatchEditRows<ChannelFisheyeDto>()

        const chlOptions = computed(() => {
            return tableData.value.map((item) => {
                return {
                    label: item.name,
                    value: item.id,
                }
            })
        })

        // 鱼眼模式与文本的映射
        const fishEyeModeMap: Record<string, string> = {
            'FishEye+Panorama+3PTZ': Translate('IDCS_FISHEYE_STREAM_1'),
            'FishEye+4PTZ': Translate('IDCS_FISHEYE_STREAM_2'),
        }

        // 安装模式与文本的映射
        const installTypeMap: Record<string, string> = {
            Top: Translate('IDCS_FISHEYE_MODE_CEILING'),
            Wall: Translate('IDCS_FISHEYE_MODE_WALL'),
            Floor: Translate('IDCS_FISHEYE_MODE_DESTOP'),
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)!
            formData.value = rowData
            tableRef.value!.setCurrentRow(rowData)
        }

        const handleRowClick = (rowData: ChannelFisheyeDto) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleChangeVal = (isFishEyeEnable = false) => {
            const rowData = getRowById(selectedChlId.value)!
            if (isFishEyeEnable) rowData.supportFishEyeEnable = true
        }

        const handleChangeAll = (type: 'fishEyeMode' | 'installType' | 'fishEyeEnable', val: string | boolean) => {
            switch (type) {
                case 'fishEyeMode':
                    const fishEyeMode = val as string
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled) {
                            ele.fishEyeMode = fishEyeMode
                        }
                    })
                    break
                case 'installType':
                    const installType = val as string
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled) {
                            ele.installType = installType
                        }
                    })
                    break
                case 'fishEyeEnable':
                    const fishEyeEnable = val as boolean
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled && ele.reqCfgFail) {
                            ele.fishEyeEnable = fishEyeEnable
                            ele.supportFishEyeEnable = true
                        }
                    })
                    break
            }
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id === chlId)
        }

        const updateDeviceDatacache = (chlId: string, fishEyeMode: string) => {
            if (!(chlId in deviceDatacache)) {
                deviceDatacache[chlId] = {}
            }
            deviceDatacache[chlId].fishEyeMode = fishEyeMode
        }

        const getDevList = async () => {
            const result = await queryDevList('')
            const $ = queryXml(result)
            $('content/item').forEach((ele) => {
                const $item = queryXml(ele.element)
                if ($item('protocolType').text() === 'HIKVISION') hikvisionIds.push(ele.attr('id'))
                if ($item('manufacturer').text() === 'TVT') privateProtocolIds.push(ele.attr('id'))
            })
        }

        const getDataList = async () => {
            openLoading()
            editRows.clear()
            installTypeList.value.clear()
            fishEyeModelList.value.clear()

            const result = await getChlList({
                pageIndex: pageIndex.value,
                pageSize: pageSize.value,
                isSupportFishEye: true,
            })

            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageTotal.value = $('content').attr('total').num()
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const newData = new ChannelFisheyeDto()
                    newData.id = ele.attr('id')
                    newData.name = $item('name').text()
                    newData.chlIndex = $item('chlIndex').text()
                    newData.chlType = $item('chlType').text()
                    newData.fishEyeMode = 'FishEye+Panorama+3PTZ'
                    newData.installType = 'Wall'
                    newData.status = 'loading'
                    return newData
                })
            } else {
                tableData.value = []
            }

            if (tableData.value.length) {
                tableData.value.forEach((ele) => {
                    //当以私有协议接入IPC时，禁止
                    ele.privateProtocol = privateProtocolIds.includes(ele.id)
                })

                await getFishEyeEnableData()
            }

            closeLoading()

            tableData.value.forEach(async (item, i) => {
                const chlId = item.id
                // 1.4.5 queryIPChlORChlFishEye协议修改，不会存在ipc不支持鱼眼接口返回失败的情况了
                // ipc支持鱼眼返回的supportMode为support/notSupport
                // ipc不支持鱼眼，但通过onvif等协议添加时也可配置鱼眼开关，返回的supportMode为manualSupport/manualNotSupport
                const sendXml = rawXml`
                    <condition>
                        <chlId>${chlId}</chlId>
                    </condition>
                `
                const result = await queryIPChlORChlFishEye(sendXml)
                const $ = queryXml(result)

                if (!tableData.value.some((row) => row === item)) {
                    return
                }

                item.status = ''

                const supportMode = $('content/chl').attr('supportMode')
                if (supportMode === 'support') {
                    item.fishEyeMode = $('content/chl/fishEyeMode').text()
                    item.installType = $('content/chl/installType').text()
                    $('types/installType/enum').forEach((ele) => {
                        const installType = installTypeMap[ele.text()]
                        if (installType) {
                            installTypeList.value.add(ele.text())
                        }
                    })
                    $('types/fishEyeMode/enum').forEach((ele) => {
                        const fishEyeMode = fishEyeModeMap[ele.text()]
                        if (fishEyeMode) {
                            fishEyeModelList.value.add(ele.text())
                        }
                    })
                    updateDeviceDatacache(item.id, item.fishEyeMode)
                    if (hikvisionIds.includes(item.id)) {
                        item.disabled = true
                        item.HIKVISION = true
                    } else {
                        item.disabled = false
                    }
                } else if (supportMode === 'manualSupport' || supportMode === 'manualNotSupport') {
                    //只对海康ipc判断
                    if (hikvisionIds.includes(item.id)) {
                        item.disabled = true
                        item.HIKVISION = true
                    } else {
                        item.disabled = false
                        item.reqCfgFail = true
                    }
                }

                const fishEyeMode = fishEyeModeMap[item.fishEyeMode]
                if (fishEyeMode) {
                    fishEyeModelList.value.add(item.fishEyeMode)
                }

                const installType = installTypeMap[item.installType]
                if (installType) {
                    installTypeList.value.add(item.installType)
                }

                editRows.listen(item)

                if (i === 0) {
                    formData.value = item
                    selectedChlId.value = item.id
                    tableRef.value!.setCurrentRow(item)
                }
            })
        }

        // 安装模式选项
        const installTypeOption = computed(() => {
            return Array.from(installTypeList.value).map((value) => {
                return {
                    label: installTypeMap[value],
                    value,
                }
            })
        })

        // 鱼眼模式选项
        const fishEyeModeOption = computed(() => {
            return Array.from(fishEyeModelList.value).map((value) => {
                return {
                    label: fishEyeModeMap[value],
                    value,
                }
            })
        })

        const getFishEyeEnableData = async () => {
            const sendXml = rawXml`
                <condition>
                    ${tableData.value.map((ele) => `<chlId>${ele.id}</chlId>`).join('')}
                </condition>
            `
            const res = await queryFishEyeEnable(sendXml)
            const $ = queryXml(res)
            $('content/chl').forEach((ele) => {
                const $item = queryXml(ele.element)
                const rowData = getRowById(ele.attr('id'))!
                if ($item('fishEyeEnable').length) {
                    rowData.fishEyeEnable = $item('fishEyeEnable').text().bool()
                    rowData.supportFishEyeEnable = true
                }
            })
        }

        const getSaveData = (rowData: ChannelFisheyeDto) => {
            return rawXml`
                <types>
                    <fishEyeMode>
                        <enum>FishEye+Panorama+3PTZ</enum>
                        <enum>FishEye+4PTZ</enum>
                    </fishEyeMode>
                    <installType>
                        <enum>Top</enum>
                        <enum>Wall</enum>
                        <enum>Floor</enum>
                    </installType>
                </types>
                <content>
                    <chl id='${rowData.id}'>
                        <installType type='installType'>${rowData.installType}</installType>
                        <fishEyeMode type='fishEyeMode'>${rowData.fishEyeMode}</fishEyeMode>
                    </chl>
                </content>`
        }

        const getFishEyeEnableSaveData = (rowDatas: ChannelFisheyeDto[]) => {
            return rawXml`
                <content>
                    ${rowDatas
                        .filter((ele) => ele.reqCfgFail)
                        .map((ele) => {
                            return rawXml`
                                <chl id='${ele.id}'>
                                    <fishEyeEnable>${ele.fishEyeEnable}</fishEyeEnable>
                                </chl>
                            `
                        })
                        .join('')}
                </content>`
        }

        const setData = async () => {
            tableData.value.forEach((ele) => (ele.status = ''))

            // 支持开关配置的鱼眼才下发editFishEyeEnable协议
            const editEnableRows: ChannelFisheyeDto[] = []

            openLoading()

            for (const ele of editRows.toArray()) {
                if (!ele.reqCfgFail) {
                    const res = await editIPChlORChlFishEye(getSaveData(ele))
                    const $ = queryXml(res)
                    const success = $('status').text() === 'success'
                    if (success) {
                        ele.status = 'success'
                        editRows.remove(ele)
                    } else {
                        ele.status = 'error'
                    }
                }

                if (ele.supportFishEyeEnable) {
                    editEnableRows.push(ele)
                }
            }

            if (editEnableRows.length) {
                const res = await editFishEyeEnable(getFishEyeEnableSaveData(editEnableRows))
                const $ = queryXml(res)
                const success = $('status').text() === 'success'

                editEnableRows.forEach((ele) => {
                    if (ele.reqCfgFail) {
                        if (success) {
                            ele.status = 'success'
                            editRows.remove(ele)
                            updateDeviceDatacache(ele.id, ele.fishEyeMode)
                        } else {
                            ele.status = 'error'
                        }
                    }
                })
            }

            closeLoading()
        }

        const save = () => {
            const isChangeFishModel = editRows.toArray().some((ele) => {
                if (ele.id in deviceDatacache && deviceDatacache[ele.id].fishEyeMode !== ele.fishEyeMode) {
                    return true
                }
            })

            if (isChangeFishModel) {
                openMessageBox({
                    type: 'question',
                    message: Translate('IDCS_FISHMODE_CHANGE_TIP'),
                }).then(() => {
                    setData()
                })
            } else {
                setData()
            }
        }

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

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return

            const rowData = getRowById(selectedChlId.value)!

            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(rowData.id, rowData.name)
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(selectedChlId, play)

        onMounted(async () => {
            await getDevList()
            getDataList()
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            chlOptions,
            editRows,
            pageIndex,
            pageSize,
            pageTotal,
            selectedChlId,
            installTypeOption,
            fishEyeModeOption,
            handleRowClick,
            handleChlSel,
            handleChangeVal,
            handleChangeAll,
            save,
            onReady,
            switchOptions,
            getDataList,
        }
    },
})
