/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-18 13:54:46
 * @Description: 通道 - 鱼眼设置
 */
import { ChannelFisheye } from '@/types/apiType/channel'
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageTipBox } = useMessageBox()
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const formData = ref(new ChannelFisheye())
        const tableRef = ref<TableInstance>()
        const tableData = ref([] as ChannelFisheye[])
        const btnOKDisabled = ref(true)
        const pageIndex = ref(1)
        const pageSize = ref(10)
        const pageTotal = ref(0)
        const selectedChlId = ref('')
        const fishEyeModelList = ref<Set<string>>(new Set())
        const installTypeList = ref<Set<string>>(new Set())
        const editRows = new Set<ChannelFisheye>()
        const deviceDatacache: Record<string, Record<string, string>> = {}

        const statusToolTip: Record<string, string> = {
            loading: Translate('IDCS_DEVC_REQUESTING_DATA'),
            saveSuccess: Translate('IDCS_SAVE_DATA_SUCCESS'),
            saveFailed: Translate('IDCS_SAVE_DATA_FAIL'),
        }

        const fishEyeModeMap: Record<string, string> = {
            'FishEye+Panorama+3PTZ': Translate('IDCS_FISHEYE_STREAM_1'),
            'FishEye+4PTZ': Translate('IDCS_FISHEYE_STREAM_2'),
        }
        const installTypeMap: Record<string, string> = {
            Top: Translate('IDCS_FISHEYE_MODE_CEILING'),
            Wall: Translate('IDCS_FISHEYE_MODE_WALL'),
            Floor: Translate('IDCS_FISHEYE_MODE_DESTOP'),
        }

        const handleSizeChange = (val: number) => {
            pageSize.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleCurrentChange = (val: number) => {
            pageIndex.value = val
            getDataList()
            btnOKDisabled.value = true
        }

        const handleChlSel = (chlId: string) => {
            const rowData = getRowById(chlId)
            formData.value = rowData
            tableRef.value!.setCurrentRow(rowData)
        }

        const handleRowClick = (rowData: ChannelFisheye) => {
            if (!rowData.disabled) {
                selectedChlId.value = rowData.id
                formData.value = rowData
            }
            tableRef.value!.setCurrentRow(getRowById(selectedChlId.value))
        }

        const handleChangeVal = (isFishEyeEnable = false) => {
            const rowData = getRowById(selectedChlId.value)
            if (isFishEyeEnable) rowData.supportFishEyeEnable = true
            editRows.add(rowData)
            btnOKDisabled.value = false
        }

        const handleChangeAll = (type: 'fishEyeMode' | 'installType' | 'fishEyeEnable', val: string | boolean) => {
            switch (type) {
                case 'fishEyeMode':
                    const fishEyeMode = val as string
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled) {
                            ele.fishEyeModelList.forEach((item) => {
                                if (fishEyeMode in item) {
                                    ele.fishEyeMode = fishEyeMode
                                    editRows.add(ele)
                                    btnOKDisabled.value = false
                                }
                            })
                        }
                    })
                    break
                case 'installType':
                    const installType = val as string
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled) {
                            ele.installTypeList.forEach((item) => {
                                if (installType in item) {
                                    ele.installType = installType
                                    editRows.add(ele)
                                    btnOKDisabled.value = false
                                }
                            })
                        }
                    })
                    break
                case 'fishEyeEnable':
                    const fishEyeEnable = val as boolean
                    tableData.value.forEach((ele) => {
                        if (!ele.disabled && ele.reqCfgFail) {
                            ele.fishEyeEnable = fishEyeEnable
                            ele.supportFishEyeEnable = true
                            editRows.add(ele)
                            btnOKDisabled.value = false
                        }
                    })
                    break
            }
        }

        const getRowById = (chlId: string) => {
            return tableData.value.find((element) => element.id == chlId) as ChannelFisheye
        }

        const updateDeviceDatacache = (chlId: string, fishEyeMode: string) => {
            if (!(chlId in deviceDatacache)) {
                deviceDatacache[chlId] = {}
            }
            deviceDatacache[chlId]['fishEyeMode'] = fishEyeMode
        }

        const getDataList = () => {
            openLoading()
            Promise.all([
                getChlList({
                    pageIndex: pageIndex.value,
                    pageSize: pageSize.value,
                    isSupportFishEye: true,
                }),
                queryDevList(''),
            ]).then((resultArr) => {
                closeLoading()
                const res1 = queryXml(resultArr[0])
                const res2 = queryXml(resultArr[1])
                const hikvisionIds: string[] = []
                const privateProtocolIds: string[] = []
                res2('content/item').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    if (eleXml('protocolType').text() == 'HIKVISION') hikvisionIds.push(ele.attr('id')!)
                    if (eleXml('manufacturer').text() == 'TVT') privateProtocolIds.push(ele.attr('id')!)
                })
                if (res1('status').text() == 'success') {
                    pageTotal.value = Number(res1('content').attr('total'))
                    const rowData: ChannelFisheye[] = []
                    installTypeList.value.clear()
                    editRows.clear()
                    btnOKDisabled.value = true
                    const curPageCount = res1('content/item').length
                    let count = 0
                    res1('content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const newData = new ChannelFisheye()
                        newData.id = ele.attr('id')!
                        newData.name = eleXml('name').text()
                        newData.chlIndex = eleXml('chlIndex').text()
                        newData.chlType = eleXml('chlType').text()
                        newData.fishEyeMode = 'FishEye+Panorama+3PTZ'
                        newData.installType = 'Wall'
                        newData.status = 'loading'
                        newData.statusTip = statusToolTip['loading']
                        rowData.push(newData)

                        // 1.4.5 queryIPChlORChlFishEye协议修改，不会存在ipc不支持鱼眼接口返回失败的情况了
                        // ipc支持鱼眼返回的supportMode为support/notSupport
                        // ipc不支持鱼眼，但通过onvif等协议添加时也可配置鱼眼开关，返回的supportMode为manualSupport/manualNotSupport
                        const sendXml = rawXml`
                            <condition>
                                <chlId>${newData.id}</chlId>
                            </condition>`
                        queryIPChlORChlFishEye(sendXml).then((res) => {
                            const $ = queryXml(res)
                            count++
                            const supportMode = $('content/chl').attr('supportMode')
                            if (supportMode == 'support') {
                                newData.fishEyeMode = $('content/chl/fishEyeMode').text()
                                newData.installType = $('content/chl/installType').text()
                                $('types/installType/enum').forEach((ele) => {
                                    const text = installTypeMap[ele.text()]
                                    if (text) {
                                        newData.installTypeList.push({
                                            value: ele.text(),
                                            text: text,
                                        })
                                        installTypeList.value.add(ele.text())
                                    }
                                })
                                $('types/fishEyeMode/enum').forEach((ele) => {
                                    const text = fishEyeModeMap[ele.text()]
                                    if (text) {
                                        newData.fishEyeModelList.push({
                                            value: ele.text(),
                                            text: text,
                                        })
                                        fishEyeModelList.value.add(ele.text())
                                    }
                                })
                                updateDeviceDatacache(newData.id, newData.fishEyeMode)
                                if (hikvisionIds.includes(newData.id)) {
                                    newData.disabled = true
                                    newData.HIKVISION = true
                                } else {
                                    newData.disabled = false
                                }
                            } else if (supportMode == 'manualSupport' || supportMode == 'manualNotSupport') {
                                //只对海康ipc判断
                                if (hikvisionIds.includes(newData.id)) {
                                    newData.disabled = true
                                    newData.HIKVISION = true
                                } else {
                                    newData.disabled = false
                                    newData.reqCfgFail = true
                                }
                            }
                            // todo
                            if (!newData.fishEyeModelList.length) {
                                const text = fishEyeModeMap[newData.fishEyeMode]
                                if (text) {
                                    newData.fishEyeModelList.push({
                                        value: newData.fishEyeMode,
                                        text: text,
                                    })
                                    fishEyeModelList.value.add(newData.fishEyeMode)
                                }
                            }
                            if (!newData.installTypeList.length) {
                                const text = installTypeMap[newData.installType]
                                if (text) {
                                    newData.installTypeList.push({
                                        value: newData.installType,
                                        text: text,
                                    })
                                    installTypeList.value.add(newData.installType)
                                }
                            }

                            if (count == curPageCount) {
                                getFishEyeEnableData(() => {
                                    tableData.value.forEach((ele) => {
                                        ele.privateProtocol = privateProtocolIds.includes(ele.id) //当以私有协议接入IPC时，禁止
                                        ele.status = ''
                                    })
                                    formData.value = tableData.value[0]
                                    selectedChlId.value = tableData.value[0].id
                                    tableRef.value!.setCurrentRow(tableData.value[0])
                                })
                            }
                        })
                    })
                    tableData.value = rowData
                }
            })
        }

        const getFishEyeEnableData = (callback: Function) => {
            let sendXml = '<condition>'
            tableData.value.forEach((ele) => {
                sendXml += `<chlId>${ele.id}</chlId>`
            })
            sendXml += '</condition>'
            queryFishEyeEnable(sendXml).then((res) => {
                const $ = queryXml(res)
                $('content/chl').forEach((ele) => {
                    const eleXml = queryXml(ele.element)
                    const rowData = getRowById(ele.attr('id')!)
                    if (eleXml('fishEyeEnable').length) {
                        rowData.fishEyeEnable = eleXml('fishEyeEnable').text().toBoolean()
                        rowData.supportFishEyeEnable = true
                    }
                })
                callback()
            })
        }

        const getSaveData = (rowData: ChannelFisheye) => {
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

        const getFishEyeEnableSaveData = (rowDatas: ChannelFisheye[]) => {
            let data = '<content>'
            rowDatas.forEach((ele) => {
                if (ele.reqCfgFail) {
                    data += rawXml`
                        <chl id='${ele.id}'>
                            <fishEyeEnable>${ele.fishEyeEnable.toString()}</fishEyeEnable>
                        </chl>`
                }
            })
            data += '</content>'
            return data
        }

        const setData = () => {
            const total = editRows.size
            let count = 0
            const successRows = new Set<ChannelFisheye>()
            tableData.value.forEach((ele) => (ele.status = ''))
            openLoading()
            editRows.forEach((ele) => {
                if (!ele.reqCfgFail) {
                    editIPChlORChlFishEye(getSaveData(ele)).then((res) => {
                        const $ = queryXml(res)
                        const success = $('status').text() === 'success'
                        if (success) {
                            ele.status = 'success'
                            ele.statusTip = statusToolTip['saveSuccess']
                            successRows.add(ele)
                        } else {
                            ele.status = 'error'
                            ele.statusTip = statusToolTip['saveFailed']
                        }
                        count++
                        if (count >= total) {
                            successRows.forEach((element) => {
                                editRows.delete(element)
                            })
                            if (!editRows.size) btnOKDisabled.value = true
                            closeLoading()
                        }
                    })
                }
            })

            // 支持开关配置的鱼眼才下发editFishEyeEnable协议
            const editEnableRows: ChannelFisheye[] = []
            editRows.forEach((ele) => {
                if (ele.supportFishEyeEnable) editEnableRows.push(ele)
            })

            if (editEnableRows.length) {
                editFishEyeEnable(getFishEyeEnableSaveData(editEnableRows)).then((res) => {
                    const $ = queryXml(res)
                    const success = $('status').text() === 'success'
                    if (success) btnOKDisabled.value = true
                    editEnableRows.forEach((ele) => {
                        if (ele.reqCfgFail) {
                            if (success) {
                                ele.status = 'success'
                                ele.statusTip = statusToolTip['saveSuccess']
                                successRows.add(ele)
                                updateDeviceDatacache(ele.id, ele.fishEyeMode)
                            } else {
                                ele.status = 'error'
                                ele.statusTip = statusToolTip['saveFailed']
                            }
                        }
                    })
                })
            }
        }

        const save = () => {
            let isChangeFishModel = false
            editRows.forEach((ele) => {
                if (ele.id in deviceDatacache && deviceDatacache[ele.id]['fishEyeMode'] != ele.fishEyeMode) isChangeFishModel = true
            })
            if (isChangeFishModel) {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_FISHMODE_CHANGE_TIP'),
                })
                    .then(() => {
                        setData()
                    })
                    .catch(() => {})
            } else {
                setData()
            }
        }

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

        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel(osType == 'mac' ? 'VedioMaskConfig' : 'ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!selectedChlId.value) return
            if (!ready.value) return
            const rowData = getRowById(selectedChlId.value)
            if (mode.value === 'h5') {
                player.play({
                    chlID: rowData.id,
                    streamType: 2,
                })
            } else {
                if (osType == 'mac') {
                } else {
                    plugin.RetryStartChlView(rowData.id, rowData.name)
                }
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

        onMounted(() => {
            getDataList()
        })

        onBeforeUnmount(() => {
            if (mode.value === 'ocx' && ready.value) {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            formData,
            tableRef,
            tableData,
            btnOKDisabled,
            pageIndex,
            pageSize,
            pageTotal,
            DefaultPagerSizeOptions,
            DefaultPagerLayout,
            selectedChlId,
            fishEyeModelList,
            installTypeList,
            fishEyeModeMap,
            installTypeMap,
            handleSizeChange,
            handleCurrentChange,
            handleRowClick,
            handleChlSel,
            handleChangeVal,
            handleChangeAll,
            save,
            onReady,
        }
    },
})
