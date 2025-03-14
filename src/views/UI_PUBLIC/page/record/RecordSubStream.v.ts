/*
 * @Description: 录像——录像子码流
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-31 10:13:57
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // “RecordSubResAdaptive” 为true时:录像子码流界面仅显示不可编辑，为false时录像子码流可以编辑
        const RecordSubResAdaptive = systemCaps.RecordSubResAdaptive
        const mainStreamLimitFps = systemCaps.mainStreamLimitFps // 主码流帧率限制

        let poeModeNode = 0

        const resolutionTableRef = ref<TableInstance>()

        const pageData = ref({
            doubleStreamRecSwitch: true,
            isAuto: true,
            loopRecSwitch: true,
            maxQoI: 0,
            videoEncodeTypeList: [] as SelectOption<string, string>[],
            // 分辨率表头下拉框
            resolutionHeaderVisble: false,
            resolutionGroups: [] as RecordStreamResolutionDto[],
            videoQualityList: [] as SelectOption<number, string>[],
            expands: [] as string[],
        })

        const tableData = ref<RecordSubStreamList[]>([])
        const editRows = useWatchEditRows<RecordSubStreamList>()
        const virtualTableData = computed<number[]>(() => {
            return [...Array(tableData.value.length).keys()]
        })

        const getDevRecParamCfgModule = async () => {
            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)

            pageData.value.doubleStreamRecSwitch = $('content/doubleStreamRecSwitch').text().bool()
            pageData.value.isAuto = $('content/recMode/mode').text() === 'auto'
            pageData.value.loopRecSwitch = $('content/loopRecSwitch').text().toLowerCase().bool()
        }

        const getNetCfgModule = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)

            poeModeNode = $('content/poeMode').text().num()
        }

        /**
         * @description 获取码率选项
         * @param {RecordSubStreamList} rowData
         */
        const getQualityList = (rowData: RecordSubStreamList) => {
            const qualitys: SelectOption<number, string>[] = []
            // rtsp通道只有声音节点，没有其他
            if (rowData.subStreamQualityCaps.length) {
                let isQualityCapsMatch = false
                let isQualityCapsEmpty = true

                rowData.subStreamQualityCaps.forEach((item) => {
                    if (item.enct === rowData.videoEncodeType && item.res === rowData.resolution) {
                        if (item.value[0]) {
                            isQualityCapsEmpty = false
                            item.value.forEach((item) => {
                                const value = Number(item)
                                if (poeModeNode === 10 && value <= 6144) {
                                    qualitys.push({
                                        value,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode === 100) {
                                    qualitys.push({
                                        value,
                                        label: item + 'Kbps',
                                    })
                                }
                            })
                        }
                        isQualityCapsMatch = true
                    }
                })

                // 没有完全匹配的项就找低于该值的最近的一项
                if (!isQualityCapsMatch) {
                    const resolutionParts = rowData.resolution.split('x')
                    rowData.subStreamQualityCaps.forEach((item) => {
                        const currentResolutionParts = item.res.split('x')
                        if (
                            item.enct === rowData.videoEncodeType &&
                            (Number(currentResolutionParts[0]) < Number(resolutionParts[0]) ||
                                (currentResolutionParts[0] === resolutionParts[0] && Number(currentResolutionParts[1]) < Number(resolutionParts[1])))
                        ) {
                            if (item.value[0]) {
                                isQualityCapsEmpty = false
                                item.value.forEach((item) => {
                                    const value = Number(item)
                                    if (poeModeNode === 10 && value <= 6144) {
                                        qualitys.push({
                                            value,
                                            label: item + 'Kbps',
                                        })
                                    } else if (!poeModeNode || poeModeNode === 100) {
                                        qualitys.push({
                                            value,
                                            label: item + 'Kbps',
                                        })
                                    }
                                })
                            }
                        }
                    })
                }

                // 对应项如果码率列表为空，则取所有支持的码率列表
                if (isQualityCapsEmpty) {
                    rowData.subStreamQualityCaps.forEach((item) => {
                        if (item.enct === rowData.videoEncodeType && item.res === '0x0') {
                            item.value.forEach((item) => {
                                const value = Number(item)
                                if (poeModeNode === 10 && value <= 6144) {
                                    qualitys.push({
                                        value,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode === 100) {
                                    qualitys.push({
                                        value,
                                        label: item + 'Kbps',
                                    })
                                }
                            })
                        }
                    })
                }

                if (rowData.videoQuality < (qualitys[0].value || 0)) {
                    rowData.videoQuality = qualitys[0].value
                }
            }

            return qualitys
        }

        const getData = async () => {
            editRows.clear()

            const sendXML = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <mainCaps/>
                    <main/>
                    ${pageData.value.isAuto ? '<an/><ae/>' : '<mn/><me/>'}
                    <mainStreamQualityCaps/>
                    <sub/>
                    <subCaps/>
                    <aux1Caps/>
                    <stream/>
                    <subStreamQualityCaps/>
                    <levelNote/>
                </requireField>
            `
            const result = await queryNodeEncodeInfo(sendXML)

            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const subCaps: RecordSubStreamList['subCaps'] = {
                        supEnct: [],
                        bitType: [],
                        res: [],
                    }
                    // aux1Caps 视频编码能力参数
                    if ($item('aux1Caps').attr('supEnct') && $item('aux1Caps/res').length) {
                        subCaps.supEnct = Array.from(new Set($item('aux1Caps').attr('supEnct').array()))
                            .sort()
                            .map((item) => {
                                return {
                                    value: item,
                                    label: Translate(DEFAULT_STREAM_TYPE_MAPPING[item]),
                                }
                            })
                        subCaps.bitType = $item('aux1Caps').attr('bitType').array()
                        subCaps.res = $item('aux1Caps/res').map((elem) => {
                            return {
                                fps: elem.attr('fps').num(),
                                value: elem.text(),
                                label: elem.text(),
                            }
                        })
                    } else {
                        subCaps.supEnct = Array.from(new Set($item('subCaps').attr('supEnct').array()))
                            .sort()
                            .map((item) => {
                                return {
                                    value: item,
                                    label: Translate(DEFAULT_STREAM_TYPE_MAPPING[item]),
                                }
                            })
                        subCaps.bitType = $item('subCaps').attr('bitType').array()
                        subCaps.res = $item('subCaps/res').map((elem) => {
                            return {
                                fps: elem.attr('fps').num(),
                                value: elem.text(),
                                label: elem.text(),
                            }
                        })
                    }
                    // 视频编码总选项和单个行选项
                    subCaps.supEnct.forEach((item) => {
                        if (!pageData.value.videoEncodeTypeList.some((find) => find.value === item.value)) {
                            pageData.value.videoEncodeTypeList.push(item)
                        }
                    })

                    const subStreamQualityCaps: RecordStreamQualityCapsDto[] = []
                    // 码率上限总选项
                    $item('subStreamQualityCaps/item').forEach((item) => {
                        subStreamQualityCaps.push({
                            enct: item.attr('enct'),
                            res: item.attr('res'),
                            digitalDefault: item.attr('digitalDefault').num(),
                            analogDefault: item.attr('analogDefault').num(),
                            value: item.text().array(),
                        })
                        if (item.attr('enct') === 'h264' && item.attr('res') === '0x0' && !pageData.value.videoQualityList.length) {
                            item.text()
                                .array()
                                .forEach((element) => {
                                    const value = Number(element)
                                    pageData.value.maxQoI = Math.max(value, pageData.value.maxQoI)

                                    if (poeModeNode === 10 && value <= 6144) {
                                        //为长线模式时，过滤掉6M以上的码率
                                        pageData.value.videoQualityList.push({
                                            value,
                                            label: element + 'Kbps',
                                        })
                                    } else if (!poeModeNode || poeModeNode === 100) {
                                        pageData.value.videoQualityList.push({
                                            value,
                                            label: element + 'Kbps',
                                        })
                                    }
                                })
                        }
                    })

                    // 初始数据项，一些tableData上的数据只有在有initItem下才存在
                    let initItem = $item('stream/s').find((item) => {
                        return item.attr('idx').num() === 3
                    })

                    if (!initItem) {
                        if ($item('sub')) {
                            initItem = $item('sub')[0]
                        }
                    }

                    let videoEncodeType = ''
                    let frameRate = 0

                    if (initItem) {
                        // 视频编码

                        if (initItem.attr('enct').indexOf('plus') !== -1) {
                            videoEncodeType = initItem.attr('enct').replace(/plus/g, 'p')
                        } else if (initItem.attr('enct').indexOf('smart') !== -1) {
                            videoEncodeType = initItem.attr('enct').replace(/smart/g, 's')
                        } else {
                            videoEncodeType = initItem.attr('enct')
                        }

                        // 分辨率
                        frameRate = initItem.attr('fps').num()
                        if (!frameRate && subCaps.res.length) {
                            frameRate = subCaps.res[0].fps
                        }
                    }

                    subCaps.res.sort((a, b) => {
                        return Number(b.value.split('x')[0]) - Number(a.value.split('x')[0])
                    })

                    return {
                        index,
                        id: item.attr('id').trim(),
                        name: $item('name').text(),
                        isRTSPChl: item.attr('isRTSPChl').bool(),
                        chlType: $item('chlType').text(),
                        subCaps,
                        streamType: 'sub',
                        streamLength: $item('stream/s').length,
                        resolution: initItem?.attr('res') || '',
                        frameRate,
                        bitType: initItem?.attr('bitType') || '',
                        level: initItem?.attr('level') || '',
                        videoQuality: initItem?.attr('QoI').num() || 0,
                        videoEncodeType,
                        subStreamQualityCaps,
                        disabled: false,
                        status: '',
                        statusTip: '',
                    }
                })

                // isVideoQualityDisabled当前行是否可进行修改
                tableData.value.forEach((item) => {
                    console.log(item.chlType, item.subCaps.res, item.isRTSPChl)
                    if (item.chlType === 'recorder' || !item.subCaps.res.length || item.isRTSPChl) {
                        item.disabled = true
                    } else {
                        editRows.listen(item)
                        console.log('here')
                    }
                })

                // 排序 NT-9768
                pageData.value.videoEncodeTypeList.sort((a, b) => {
                    return a.value.charCodeAt(0) - b.value.charCodeAt(0)
                })

                getResolutionDropdownData()
            })
        }

        const setRecSubStreamData = async () => {
            const rows = editRows.toArray()
            const sendXML = rawXml`
                <content type='list' total='${rows.length}'>
                    ${rows
                        .map((item) => {
                            if (!item.disabled) {
                                if (item.streamLength === 3) {
                                    return rawXml`
                                        <item id='${item.id}'>
                                            <subRec res='${item.resolution}' fps='${item.frameRate}' QoI='${item.videoQuality}' bitType ='${item.bitType || 'CBR'}' level='${item.level}' enct='${item.videoEncodeType}'></subRec>
                                        </item>
                                    `
                                } else {
                                    return rawXml`
                                        <item id='${item.id}'>
                                            <sub res='${item.resolution}' fps='${item.frameRate}' QoI='${item.videoQuality}' bitType ='${item.bitType || 'CBR'}' level='${item.level}' enct='${item.videoEncodeType}'></sub>
                                        </item>
                                    `
                                }
                            }
                        })
                        .join('')}
                </content>
            `
            const result = await editNodeEncodeInfo(sendXML)
            commSaveResponseHandler(result)
        }

        const setData = () => {
            const filter = editRows.toArray().filter((item) => {
                if (item.videoEncodeType === 'h264smart' || item.videoEncodeType === 'h265smart') {
                    return true
                }
                return false
            })

            if (filter.length) {
                if (filter.length === 1) {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_SMART_ENCODE_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + filter[0].name, Translate('IDCS_FACE_DETECTION')),
                    }).then(() => {
                        setRecSubStreamData()
                    })
                } else {
                    openMessageBox({
                        type: 'question',
                        message: Translate('IDCS_SIMPLE_SMART_ENCODE_TIPS').formatForLang('', Translate('IDCS_FACE_DETECTION')),
                    }).then(() => {
                        setRecSubStreamData()
                    })
                }
            } else {
                setRecSubStreamData()
            }
        }

        /**
         * @description 当前码率上限是否禁用
         * @param {Number} index
         */
        const isVideoQualityDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(item.videoEncodeType)
        }

        // 视频编码改变
        const changeVideoEncodeType = (rowData: RecordSubStreamList) => {
            if (rowData.bitType === 'CBR') {
                rowData.subStreamQualityCaps.forEach((item) => {
                    if (rowData.resolution === item.res && rowData.videoEncodeType === item.enct) {
                        if (poeModeNode === 10 && (rowData.chlType === 'digital' ? item.digitalDefault : item.analogDefault) > 6144) {
                            tableData.value[rowData.index].videoQuality = 6144
                        } else {
                            tableData.value[rowData.index].videoQuality = rowData.chlType === 'digital' ? item.digitalDefault : item.analogDefault
                        }
                    }
                })
            }
        }

        /**
         * @description 获取全局可选取的帧率范围
         * @returns {SelectOption<number, number>}
         */
        const getFrameRateList = () => {
            let maxFrameRate = 0
            tableData.value.forEach((element) => {
                element.subCaps.res.forEach((obj) => {
                    if (element.resolution === obj.value && maxFrameRate < obj.fps) {
                        maxFrameRate = obj.fps
                    }
                })
            })
            if (maxFrameRate === 0) return []

            const fps: number[] = []
            const minFrameRate = Math.min(mainStreamLimitFps, maxFrameRate)
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                fps.push(i)
            }
            return arrayToOptions(fps)
        }

        /**
         * @description 获取单个设备的帧率范围
         * @param {RecordSubStreamList} rowData
         * @returns {SelectOption<number, number>}
         */
        const getFrameRateSingleList = (rowData: RecordSubStreamList) => {
            const frameRates: number[] = []
            rowData.subCaps.res.forEach((obj) => {
                if (obj.value === rowData.resolution) {
                    const maxFrameRate = obj.fps
                    const minFrameRate = Math.min(mainStreamLimitFps, maxFrameRate)
                    for (let i = maxFrameRate; i >= minFrameRate; i--) {
                        frameRates.push(i)
                    }
                }
            })

            if (rowData.frameRate > frameRates[0]) {
                rowData.frameRate = frameRates[0]
            }

            if (rowData.frameRate < frameRates.at(-1)!) {
                rowData.frameRate = frameRates.at(-1)!
            }

            return arrayToOptions(frameRates)
        }

        const changeAllVideoEncodeType = (value: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled && item.subCaps.supEnct.some((find) => find.value === value)) {
                    item.videoEncodeType = value
                    changeVideoEncodeType(item)
                }
            })
        }

        // 改变当前行的分辨率
        const changeResolution = (rowData: RecordSubStreamList, value: string) => {
            rowData.subCaps.res.forEach((item) => {
                if (item.value === value) {
                    rowData.frameRate = Math.min(rowData.frameRate, item.fps)
                }
            })

            if (rowData.bitType === 'CBR') {
                rowData.subStreamQualityCaps.forEach((item) => {
                    if (rowData.resolution === item.res && rowData.videoEncodeType === item.enct) {
                        tableData.value[rowData.index].videoQuality = rowData.chlType === 'digital' ? item.digitalDefault : item.analogDefault
                    }
                })
            }
        }

        // 获取分辨率下拉框数据
        const getResolutionDropdownData = () => {
            const rowDatas = tableData.value.filter((item) => {
                return !item.disabled
            })

            const resolutionMapping: Record<string, SelectOption<string, string>[]> = {}
            pageData.value.resolutionGroups = []

            rowDatas.forEach((item) => {
                const resolutionList = item.subCaps.res.map((item) => item.value)

                const mappingKey = resolutionList.join(',')

                if (!resolutionMapping[mappingKey]) {
                    resolutionMapping[mappingKey] = []
                    pageData.value.resolutionGroups.push({
                        res: resolutionList[0],
                        resGroup: arrayToOptions(resolutionList),
                        chls: {
                            expand: !pageData.value.resolutionGroups.length,
                            data: resolutionMapping[mappingKey],
                        },
                    })
                }

                resolutionMapping[mappingKey].push({
                    value: item.id,
                    label: item.name,
                })
            })
        }

        // 分辨率下拉框的确定
        const apply = () => {
            pageData.value.resolutionGroups.forEach((item) => {
                const resolution = item.res
                const ids = item.chls.data.map((item) => item.value)

                tableData.value.forEach((item) => {
                    if (ids.includes(item.id)) {
                        item.resolution = resolution
                        changeResolution(item, resolution)
                    }
                })
            })
            pageData.value.resolutionHeaderVisble = false
        }

        // 分辨率下拉框关闭
        const close = () => {
            pageData.value.resolutionHeaderVisble = false
        }

        const handleExpandChange = (row: RecordStreamResolutionDto, expandedRows: string[]) => {
            if (expandedRows.includes(row.chls.data[0].value) && resolutionTableRef.value) {
                resolutionTableRef.value.toggleRowExpansion(row, false)
                row.chls.expand = false
                pageData.value.expands.splice(pageData.value.expands.indexOf(row.chls.data[0].value), 1)
            } else if (resolutionTableRef.value) {
                resolutionTableRef.value.toggleRowExpansion(row, true)
                row.chls.expand = true
                pageData.value.expands.push(row.chls.data[0].value)
            }
        }

        const getRowKey = (row: RecordStreamResolutionDto) => {
            return row.chls.data[0].value
        }

        const changeAllFrameRate = (value: number) => {
            tableData.value.forEach((item) => {
                let currentFrameRate = value
                if (!item.disabled) {
                    const frameRateList = getFrameRateSingleList(item)
                    if (value > frameRateList[0].value) {
                        currentFrameRate = frameRateList[0].value
                    }
                    item.frameRate = currentFrameRate
                }
            })
        }

        const changeAllVideoQuality = (value: number) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    if (
                        getQualityList(item)
                            .map((item) => item.value)
                            .includes(value)
                    ) {
                        item.videoQuality = value
                    }
                }
            })
        }

        const handleResolutionVisibleChange = () => {
            setTimeout(() => {
                pageData.value.resolutionHeaderVisble = true
            }, 0)
        }

        /**
         * @description 显示码流文本
         * @param {String} key
         * @returns {String}
         */
        const displayStreamType = (key: string) => {
            return key ? Translate(DEFAULT_STREAM_TYPE_MAPPING[key]) : '--'
        }

        onMounted(async () => {
            openLoading()

            await getDevRecParamCfgModule()
            await getNetCfgModule()
            await getData()

            closeLoading()
        })

        return {
            getQualityList,
            resolutionTableRef,
            getFrameRateList,
            getFrameRateSingleList,
            displayStreamType,
            RecordSubResAdaptive,
            pageData,
            tableData,
            editRows,
            virtualTableData,
            setData,
            changeVideoEncodeType,
            changeAllVideoEncodeType,
            changeResolution,
            changeAllFrameRate,
            changeAllVideoQuality,
            handleExpandChange,
            getRowKey,
            apply,
            close,
            arrayToOptions,
            handleResolutionVisibleChange,
            isVideoQualityDisabled,
        }
    },
})
