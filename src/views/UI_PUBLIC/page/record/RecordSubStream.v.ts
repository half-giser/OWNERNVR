/*
 * @Description: 录像——录像子码流
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-31 10:13:57
 */

import { type RecordSubStreamResolutionDto, type RecordSubStreamList, RecordSubStreamNoneDto, type RecordSubStreamQualityCaps } from '@/types/apiType/record'
import { type TableInstance } from 'element-plus'
import { uniq } from 'lodash-es'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        // “RecordSubResAdaptive” 为true时:录像子码流界面仅显示不可编辑，为false时录像子码流可以编辑
        const RecordSubResAdaptive = systemCaps.RecordSubResAdaptive

        const mainStreamLimitFps = systemCaps.mainStreamLimitFps // 主码流帧率限制
        let poeModeNode = 0

        const resolutionTableRef = ref<TableInstance>()

        const pageData = ref({
            isRowNonExistent: [] as RecordSubStreamNoneDto[],
            doubleStreamRecSwitch: true,
            recType: '',
            recType1: '',
            loopRecSwitch: true,
            maxQoI: 0,
            videoEncodeTypeUnionList: [] as SelectOption<string, string>[],
            // 分辨率表头下拉框
            resolutionHeaderVisble: false,
            resolutionUnionList: [] as string[],
            resolutionGroups: [] as RecordSubStreamResolutionDto[],
            frameRateUnionList: [] as string[],
            videoQualityList: [] as SelectOption<string, string>[],
            expands: [] as string[],
        })

        const tableData = ref<RecordSubStreamList[]>([])
        const editRows = useWatchEditRows<RecordSubStreamList>()
        const virtualTableData = computed(() => {
            return Array(tableData.value.length)
                .fill(1)
                .map((item, index) => item + index)
        })

        // 码流类型与显示文本的映射
        const STREAM_TYPE_MAPPING: Record<string, string> = {
            main: Translate('IDCS_MAIN_STREAM'),
            sub: Translate('IDCS_SUB_STREAM'),
            h264: Translate('IDCS_VIDEO_ENCT_TYPE_H264'),
            h264s: Translate('IDCS_VIDEO_ENCT_TYPE_H264_SMART'),
            h264p: Translate('IDCS_VIDEO_ENCT_TYPE_H264_PLUS'),
            h265: Translate('IDCS_VIDEO_ENCT_TYPE_H265'),
            h265s: Translate('IDCS_VIDEO_ENCT_TYPE_H265_SMART'),
            h265p: Translate('IDCS_VIDEO_ENCT_TYPE_H265_PLUS'),
        }

        const videoEncodeTypeArr = ['h264s', 'h265s', 'h264p', 'h265p']

        const getDevRecParamCfgModule = async () => {
            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)

            pageData.value.doubleStreamRecSwitch = $('content/doubleStreamRecSwitch').text().bool()
            pageData.value.recType = $('content/recMode/mode').text() === 'auto' ? 'ae' : 'me'
            pageData.value.recType1 = $('content/recMode/mode').text() === 'auto' ? 'an' : 'mn'
            pageData.value.loopRecSwitch = $('content/loopRecSwitch').text().toLowerCase().bool()
        }

        const getNetCfgModule = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)

            poeModeNode = $('content/poeMode').text().num()
        }

        const getQualityList = (rowData: RecordSubStreamList) => {
            // rtsp通道只有声音节点，没有其他
            if (rowData.subStreamQualityCaps.length) {
                let isQualityCapsMatch = false
                let isQualityCapsEmpty = true
                rowData.videoQualityItemList = []

                rowData.subStreamQualityCaps.forEach((item) => {
                    if (item.enct === rowData.videoEncodeType && item.res === rowData.resolution) {
                        if (item.value[0]) {
                            isQualityCapsEmpty = false
                            rowData.qualitys = item.value
                            rowData.qualitys.forEach((item) => {
                                if (poeModeNode === 10 && Number(item) <= 6144) {
                                    rowData.videoQualityItemList.push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode === 100) {
                                    rowData.videoQualityItemList.push({
                                        value: item,
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
                                rowData.qualitys = item.value
                                rowData.qualitys.forEach((item) => {
                                    if (poeModeNode === 10 && Number(item) <= 6144) {
                                        rowData.videoQualityItemList.push({
                                            value: item,
                                            label: item + 'Kbps',
                                        })
                                    } else if (!poeModeNode || poeModeNode === 100) {
                                        rowData.videoQualityItemList.push({
                                            value: item,
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
                            tableData.value[rowData.index].qualitys = item.value
                            tableData.value[rowData.index].qualitys.forEach((item) => {
                                if (poeModeNode === 10 && Number(item) <= 6144) {
                                    rowData.videoQualityItemList.push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode === 100) {
                                    rowData.videoQualityItemList.push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                }
                            })
                        }
                    })
                }

                if (Number(rowData.videoQuality) < Number(rowData.videoQualityItemList[0]?.value)) {
                    rowData.videoQuality = rowData.videoQualityItemList[0].value
                } else {
                    // cboRowVideoQuality.val(rowData["videoQuality"]);  cboRowVideoQuality是一个option选项组，这里选中了当前rowData["videoQuality"]的值
                    // vue3双向绑定，无需进行操作
                }
            }
        }

        const getData = async () => {
            editRows.clear()

            const sendXML = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <mainCaps/>
                    <main/>
                    <${pageData.value.recType}/>
                    <${pageData.value.recType1}/>
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

            const unionList: string[] = []
            let videoQualityListFlag = 0

            let maxFrameRate = 0

            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const subCaps: RecordSubStreamList['subCaps'] = {
                        supEnct: [],
                        bitType: [],
                        res: [],
                    }
                    // aux1Caps 视频编码能力参数
                    if ($item('aux1Caps') && $item('aux1Caps').attr('supEnct') && $item('aux1Caps/res')[0]) {
                        subCaps.supEnct = uniq(
                            $item('aux1Caps') && $item('aux1Caps').attr('supEnct') ? ($item('aux1Caps').attr('supEnct').split(',') ? $item('aux1Caps').attr('supEnct').split(',') : []) : [],
                        )
                        subCaps.bitType =
                            $item('aux1Caps') && $item('aux1Caps').attr('bitType') ? ($item('aux1Caps').attr('bitType').split(',') ? $item('aux1Caps').attr('bitType').split(',') : []) : []

                        $item('aux1Caps/res').forEach((elem) => {
                            subCaps.res.push({
                                fps: elem.attr('fps'),
                                value: elem.text(),
                            })
                        })
                    } else {
                        subCaps.supEnct = uniq(
                            $item('subCaps') && $item('subCaps').attr('supEnct') ? ($item('subCaps').attr('supEnct').split(',') ? $item('subCaps').attr('supEnct').split(',') : []) : [],
                        )
                        subCaps.bitType = $item('subCaps') && $item('subCaps').attr('bitType') ? ($item('subCaps').attr('bitType').split(',') ? $item('subCaps').attr('bitType').split(',') : []) : []

                        $item('subCaps/res').forEach((elem) => {
                            subCaps.res.push({
                                fps: elem.attr('fps'),
                                value: elem.text(),
                            })
                        })
                    }
                    // 视频编码总选项和单个行选项
                    subCaps.supEnct.forEach((item) => {
                        if (!unionList.includes(item)) {
                            unionList.push(item)
                        }
                    })
                    const videoEncodeTypeList = subCaps.supEnct.sort().map((item) => {
                        return {
                            value: item,
                            label: STREAM_TYPE_MAPPING[item],
                        }
                    })

                    // 分辨率单个行选项列表
                    const resolutionList = subCaps.res.map((item) => item.value)

                    const subStreamQualityCaps: RecordSubStreamQualityCaps[] = []
                    // 码率上限总选项
                    $item('subStreamQualityCaps/item').forEach((item) => {
                        subStreamQualityCaps.push({
                            enct: item.attr('enct'),
                            res: item.attr('res'),
                            digitalDefault: item.attr('digitalDefault'),
                            analogDefault: item.attr('analogDefault'),
                            value: item.text().split(',') ? item.text().split(',') : [],
                        })
                        if (item.attr('enct') === 'h264' && item.attr('res') === '0x0' && videoQualityListFlag === 0) {
                            item.text()
                                .split(',')
                                .forEach((element) => {
                                    pageData.value.maxQoI = Math.max(Number(element), pageData.value.maxQoI)

                                    if (poeModeNode === 10 && Number(element) <= 6144) {
                                        //为长线模式时，过滤掉6M以上的码率
                                        pageData.value.videoQualityList.push({
                                            value: element,
                                            label: element + 'Kbps',
                                        })
                                    } else if (!poeModeNode || poeModeNode === 100) {
                                        pageData.value.videoQualityList.push({
                                            value: element,
                                            label: element + 'Kbps',
                                        })
                                    }
                                })
                            videoQualityListFlag++
                        }
                    })

                    // 初始数据项，一些tableData上的数据只有在有initItem下才存在
                    let initItem = null
                    $item('stream/s').forEach((item) => {
                        if (item.attr('idx') === '3') {
                            initItem = item
                            return false
                        }
                    })
                    if (!initItem) {
                        if ($item('sub')) {
                            initItem = $item('sub')[0]
                        }
                    }

                    if (initItem) {
                        // 视频编码
                        let videoEncodeType = ''
                        if (initItem.attr('enct').indexOf('plus') !== -1) {
                            videoEncodeType = initItem.attr('enct').replace(/plus/g, 'p')
                        } else if (initItem.attr('enct').indexOf('smart') !== -1) {
                            videoEncodeType = initItem.attr('enct').replace(/smart/g, 's')
                        } else {
                            videoEncodeType = initItem.attr('enct')
                        }

                        // 分辨率
                        let frameRate = initItem.attr('fps')
                        if (!frameRate && subCaps.res.length) {
                            frameRate = subCaps.res[0].fps
                        }

                        if (subCaps.res.length > 1) {
                            subCaps.res.sort((a, b) => {
                                return Number(b.value.split('x')[0]) - Number(a.value.split('x')[0])
                            })
                        }

                        // 帧率
                        const resolution = initItem.attr('res')
                        const frameRateList: string[] = []
                        let maxFps = 0
                        subCaps.res.forEach((item) => {
                            if (item.value === resolution) {
                                const maxFrameRate = Number(item.fps)
                                maxFps = maxFrameRate
                                const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
                                for (let i = maxFrameRate; i >= minFrameRate; i--) {
                                    frameRateList.push(String(i))
                                }
                            }
                        })

                        // 帧率总选项
                        subCaps.res.forEach((item) => {
                            if (resolution === item.value && maxFrameRate < Number(item.fps)) {
                                maxFrameRate = Number(item.fps)
                            }
                        })

                        return {
                            index,
                            id: item.attr('id').trim(),
                            name: $item('name').text(),
                            isRTSPChl: item.attr('isRTSPChl'),
                            chlType: $item('chlType').text(),
                            subCaps,
                            streamType: 'sub',
                            streamLength: $item('stream/s').length,
                            resolution,
                            frameRate,
                            bitType: initItem.attr('bitType'),
                            level: initItem.attr('level'),
                            videoQuality: initItem.attr('QoI'),
                            videoEncodeType,
                            subStreamQualityCaps,
                            qualitys: [],
                            disabled: false,
                            status: '',
                            statusTip: '',
                            maxFps,
                            frameRateList,
                            videoEncodeTypeList,
                            resolutionList,
                            videoQualityItemList: [],
                            isVideoQualityDisabled: false,
                        }
                    }

                    // 在取值后再进行排序
                    if (subCaps.res.length > 1) {
                        subCaps.res.sort((a, b) => {
                            return Number(b.value.split('x')[0]) - Number(a.value.split('x')[0])
                        })
                    }

                    return {
                        index,
                        id: item.attr('id').trim(),
                        name: $item('name').text(),
                        isRTSPChl: item.attr('isRTSPChl'),
                        chlType: $item('chlType').text(),
                        subCaps,
                        streamType: 'sub',
                        streamLength: $item('stream/s').length,
                        resolution: '',
                        frameRate: '',
                        bitType: '',
                        level: '',
                        videoQuality: '',
                        videoEncodeType: '',
                        subStreamQualityCaps,
                        qualitys: [],
                        disabled: false,
                        status: '',
                        statusTip: '',
                        maxFps: 0,
                        frameRateList: [],
                        videoEncodeTypeList: [],
                        resolutionList: [],
                        videoQualityItemList: [],
                        isVideoQualityDisabled: false,
                    }
                })
            })

            // isVideoQualityDisabled当前行是否可进行修改
            tableData.value.forEach((item) => {
                getQualityList(item)
                if (videoEncodeTypeArr.includes(item.videoEncodeType)) {
                    item.isVideoQualityDisabled = true
                }

                if (item.chlType === 'recorder' || !item.subCaps.res.length || item.isRTSPChl === 'true') {
                    item.disabled = true
                } else {
                    editRows.listen(item)
                }

                if (item.isRTSPChl === 'true') {
                    const none = new RecordSubStreamNoneDto()

                    if (!item.videoEncodeType) {
                        none.videoEncodeType = 'true'
                    }

                    if (!item.resolution) {
                        none.resolution = 'true'
                    }

                    if (!item.frameRate) {
                        none.frameRate = 'true'
                    }

                    if (!item.videoQuality) {
                        none.videoQuality = 'true'
                    }

                    pageData.value.isRowNonExistent[item.index] = none
                }
            })

            pageData.value.videoEncodeTypeUnionList = unionList.sort().map((item) => {
                return {
                    value: item,
                    label: STREAM_TYPE_MAPPING[item],
                }
            })

            if (maxFrameRate === 0) {
                pageData.value.frameRateUnionList = []
            }
            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                pageData.value.frameRateUnionList.push(String(i))
            }
            getResolutionDropdownData()
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
                        message: Translate('IDCS_SIMPLE_SMART_ENCODE_TIPS').formatForLang(null, Translate('IDCS_FACE_DETECTION')),
                    }).then(() => {
                        setRecSubStreamData()
                    })
                }
            } else {
                setRecSubStreamData()
            }
        }

        // 视频编码改变
        const changeVideoEncodeType = (rowData: RecordSubStreamList) => {
            const isDisabled = videoEncodeTypeArr.includes(rowData.videoEncodeType)
            rowData.isVideoQualityDisabled = isDisabled
            if (!isDisabled) {
                getQualityList(rowData)
                if (rowData.bitType === 'CBR') {
                    rowData.subStreamQualityCaps.forEach((item) => {
                        if (rowData.resolution === item.res && rowData.videoEncodeType === item.enct) {
                            if (poeModeNode === 10 && Number(rowData.chlType === 'digital' ? item.digitalDefault : item.analogDefault) > 6144) {
                                tableData.value[rowData.index].videoQuality = '6144'
                            } else {
                                tableData.value[rowData.index].videoQuality = rowData.chlType === 'digital' ? item.digitalDefault : item.analogDefault
                            }
                        }
                    })
                }
            }
        }

        const changeAllVideoEncodeType = (value: string) => {
            tableData.value.forEach((item) => {
                if (item.chlType !== 'recorder' && !item.disabled && item.subCaps.supEnct.includes(value)) {
                    item.videoEncodeType = value
                    changeVideoEncodeType(item)
                }
            })
        }

        // 更新当前行帧率选项
        const updateFrameRate = (rowData: RecordSubStreamList, maxFrameRate: number) => {
            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps

            rowData.frameRateList = []

            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                rowData.frameRateList.push(String(i))
            }

            rowData.maxFps = maxFrameRate
        }

        const updateTitleFrameRate = () => {
            const maxFrameRate = Math.max.apply(
                [],
                tableData.value.map((item) => item.maxFps),
            )

            pageData.value.frameRateUnionList = []

            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                pageData.value.frameRateUnionList.push(String(i))
            }
        }

        // 改变当前行的分辨率
        const changeResolution = (rowData: RecordSubStreamList, value: string) => {
            rowData.subCaps.res.forEach((item) => {
                if (item.value === value) {
                    let frameRate = rowData.frameRate
                    if (Number(frameRate) > Number(item.fps)) {
                        frameRate = item.fps
                    }

                    if (rowData.maxFps !== Number(item.fps)) {
                        updateFrameRate(rowData, Number(item.fps))
                        updateTitleFrameRate()
                    }
                    rowData.frameRate = frameRate
                }
            })
            getQualityList(rowData)

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
                return item.chlType !== 'recorder' && !item.disabled
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
                        resGroup: resolutionList,
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

        const handleExpandChange = (row: RecordSubStreamResolutionDto, expandedRows: string[]) => {
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

        const getRowKey = (row: RecordSubStreamResolutionDto) => {
            return row.chls.data[0].value
        }

        const changeAllFrameRate = (value: string) => {
            tableData.value.forEach((item) => {
                let val = value
                if (Number(val) > item.maxFps) {
                    val = String(item.maxFps)
                }

                if (!item.disabled) {
                    item.frameRate = val
                }
            })
        }

        const changeAllVideoQuality = (value: string) => {
            tableData.value.forEach((item) => {
                if (item.chlType !== 'recorder' && !item.disabled && item.qualitys.includes(value)) item.videoQuality = value
            })
        }

        const handleResolutionVisibleChange = () => {
            setTimeout(() => {
                pageData.value.resolutionHeaderVisble = true
            }, 0)
        }

        onMounted(async () => {
            openLoading()

            await getDevRecParamCfgModule()
            await getNetCfgModule()
            await getData()

            closeLoading()
        })

        return {
            resolutionTableRef,
            STREAM_TYPE_MAPPING,
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
        }
    },
})
