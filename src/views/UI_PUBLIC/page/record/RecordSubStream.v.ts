/*
 * @Description: 录像——录像子码流
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-31 10:13:57
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-12 13:50:48
 */

import { type ResolutionRow, type RecordSubStreamList, type rowNonExistent } from '@/types/apiType/record'
import { uniq } from 'lodash-es'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        // “RecordSubResAdaptive” 为true时:录像子码流界面仅显示不可编辑，为false时录像子码流可以编辑
        const RecordSubResAdaptive = systemCaps.RecordSubResAdaptive

        let mainStreamLimitFps = 1 // 主码流帧率限制
        let poeModeNode = ''

        const dropdownRef = ref()
        const resolutionTableRef = ref()

        const pageData = ref({
            isRowDisabled: [] as boolean[],
            isRowNonExistent: [] as rowNonExistent[],
            doubleStreamRecSwitch: true,
            recType: '',
            recType1: '',
            loopRecSwitch: true,
            maxQoI: 0,
            videoEncodeTypeUnionList: [] as SelectOption<string, string>[],
            videoEncodeTypeList: [[] as SelectOption<string, string>[]],
            // 分辨率表头下拉框
            resolutionHeaderVisble: false,
            resolutionUnionList: [] as string[],
            resolutionGroups: [] as ResolutionRow[],
            resolutionList: [[] as string[]],
            frameRateUnionList: [] as string[],
            frameRateList: [[] as string[]],
            maxFpsMap: [] as number[],
            videoQualityList: [] as SelectOption<string, string>[],
            videoQualityItemList: [[] as SelectOption<string, string>[]],
            isVideoQualityDisabled: [] as boolean[],
            expands: [] as string[],
        })

        const tableData = ref<RecordSubStreamList[]>([])

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

            pageData.value.doubleStreamRecSwitch = $('/response/content/doubleStreamRecSwitch').text() == 'true'
            pageData.value.recType = $('/response/content/recMode/mode').text() == 'auto' ? 'ae' : 'me'
            pageData.value.recType1 = $('/response/content/recMode/mode').text() == 'auto' ? 'an' : 'mn'
            pageData.value.loopRecSwitch = $('/response/content/loopRecSwitch').text().toLowerCase() === 'true'
        }

        const getNetCfgModule = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)

            poeModeNode = $('/response/content/poeMode').text()
        }

        const getSystemCaps = async () => {
            const result = await querySystemCaps()
            const $ = queryXml(result)

            mainStreamLimitFps = Number($('/response/content/mainStreamLimitFps').text()) || mainStreamLimitFps
        }

        const getQualityList = (rowData: RecordSubStreamList) => {
            // rtsp通道只有声音节点，没有其他
            if (rowData.subStreamQualityCaps.length > 0) {
                let isQualityCapsMatch = false
                let isQualityCapsEmpty = true
                pageData.value.videoQualityItemList[rowData.index] = []

                rowData.subStreamQualityCaps.forEach((item) => {
                    if (item['enct'] == rowData.videoEncodeType && item['res'] == rowData.resolution) {
                        if (item['value'][0]) {
                            isQualityCapsEmpty = false
                            tableData.value[rowData.index].qualitys = item['value']
                            tableData.value[rowData.index].qualitys.forEach((item) => {
                                if (poeModeNode && poeModeNode == '10' && Number(item) <= 6144) {
                                    pageData.value.videoQualityItemList[rowData.index].push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode == '100') {
                                    pageData.value.videoQualityItemList[rowData.index].push({
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
                        const currentResolutionParts = (item['res'] as string).split('x')
                        if (
                            item['enct'] == rowData.videoEncodeType &&
                            (Number(currentResolutionParts[0]) < Number(resolutionParts[0]) ||
                                (currentResolutionParts[0] == resolutionParts[0] && Number(currentResolutionParts[1]) < Number(resolutionParts[1])))
                        ) {
                            if (item['value'][0]) {
                                isQualityCapsEmpty = false
                                tableData.value[rowData.index].qualitys = item['value']
                                tableData.value[rowData.index].qualitys.forEach((item) => {
                                    if (poeModeNode && poeModeNode == '10' && Number(item) <= 6144) {
                                        pageData.value.videoQualityItemList[rowData.index].push({
                                            value: item,
                                            label: item + 'Kbps',
                                        })
                                    } else if (!poeModeNode || poeModeNode == '100') {
                                        pageData.value.videoQualityItemList[rowData.index].push({
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
                        if (item['enct'] == rowData.videoEncodeType && item['res'] == '0x0') {
                            tableData.value[rowData.index].qualitys = item['value']
                            tableData.value[rowData.index].qualitys.forEach((item) => {
                                if (poeModeNode && poeModeNode == '10' && Number(item) <= 6144) {
                                    pageData.value.videoQualityItemList[rowData.index].push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                } else if (!poeModeNode || poeModeNode == '100') {
                                    pageData.value.videoQualityItemList[rowData.index].push({
                                        value: item,
                                        label: item + 'Kbps',
                                    })
                                }
                            })
                        }
                    })
                }
                if (Number(rowData.videoQuality) < Number(pageData.value.videoQualityItemList[rowData.index][0]?.value)) {
                    rowData.videoQuality = pageData.value.videoQualityItemList[rowData.index][0].value
                } else {
                    // cboRowVideoQuality.val(rowData["videoQuality"]);  cboRowVideoQuality是一个option选项组，这里选中了当前rowData["videoQuality"]的值
                    // vue3双向绑定，无需进行操作
                }
            }
        }

        const getData = async () => {
            await getDevRecParamCfgModule()

            await getNetCfgModule()
            await getSystemCaps()

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

            const unionList = [] as string[]
            let videoQualityListFlag = 0

            let maxFrameRate = 0

            commLoadResponseHandler(result, ($) => {
                const data = $('/response/content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const subCaps = {
                        supEnct: [] as string[],
                        bitType: [] as string[],
                        res: [] as { fps: string; value: string }[],
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
                                fps: elem.attr('fps') as string,
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
                                fps: elem.attr('fps') as string,
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
                    pageData.value.videoEncodeTypeList[index] = subCaps.supEnct.sort().map((item) => {
                        return {
                            value: item,
                            label: STREAM_TYPE_MAPPING[item],
                        }
                    })

                    // 分辨率单个行选项列表
                    pageData.value.resolutionList[index] = subCaps.res.map((item) => item.value)

                    const subStreamQualityCaps = [] as object[]
                    // 码率上限总选项
                    $item('subStreamQualityCaps/item').forEach((item) => {
                        subStreamQualityCaps.push({
                            enct: item.attr('enct'),
                            res: item.attr('res'),
                            digitalDefault: item.attr('digitalDefault'),
                            analogDefault: item.attr('analogDefault'),
                            value: item.text().split(',') ? item.text().split(',') : [],
                        })
                        if (item.attr('enct') == 'h264' && item.attr('res') == '0x0' && videoQualityListFlag === 0) {
                            item.text()
                                .split(',')
                                .forEach((element) => {
                                    pageData.value.maxQoI = Math.max(Number(element), pageData.value.maxQoI)

                                    if (poeModeNode && poeModeNode == '10' && parseInt(element) <= 6144) {
                                        //为长线模式时，过滤掉6M以上的码率
                                        pageData.value.videoQualityList.push({ value: element, label: element + 'Kbps' })
                                    } else if (!poeModeNode || poeModeNode == '100') {
                                        pageData.value.videoQualityList.push({ value: element, label: element + 'Kbps' })
                                    }
                                })
                            videoQualityListFlag++
                        }
                    })

                    // 初始数据项，一些tableData上的数据只有在有initItem下才存在
                    let initItem = null
                    $item('stream/s').forEach((item) => {
                        if (item.attr('idx') == '3') {
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
                        if (initItem.attr('enct')?.indexOf('plus') != -1) {
                            videoEncodeType = initItem.attr('enct')?.replace(/plus/g, 'p') as string
                        } else if (initItem.attr('enct')?.indexOf('smart') != -1) {
                            videoEncodeType = initItem.attr('enct')?.replace(/smart/g, 's') as string
                        } else {
                            videoEncodeType = initItem.attr('enct') as string
                        }

                        // 分辨率
                        let frameRate = initItem?.attr('fps')
                        if (!frameRate && subCaps.res.length > 0) {
                            frameRate = subCaps.res[0].fps
                        }
                        if (subCaps.res.length > 1) {
                            subCaps.res.sort((a, b) => {
                                return Number(b['value'].split('x')[0]) - Number(a['value'].split('x')[0])
                            })
                        }

                        // 帧率
                        const resolution = initItem?.attr('res')
                        pageData.value.frameRateList[index] = []
                        subCaps.res.forEach((item) => {
                            if (item.value === resolution) {
                                const maxFrameRate = Number(item.fps)
                                pageData.value.maxFpsMap[index] = maxFrameRate
                                const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
                                for (let i = maxFrameRate; i >= minFrameRate; i--) {
                                    pageData.value.frameRateList[index].push(String(i))
                                }
                            }
                        })

                        // 帧率总选项
                        subCaps.res.forEach((item) => {
                            if (resolution == item.value && maxFrameRate < Number(item.fps)) {
                                maxFrameRate = Number(item.fps)
                            }
                        })

                        return {
                            index,
                            id: item.attr('id')?.trim(),
                            name: $item('name').text(),
                            isRTSPChl: item.attr('isRTSPChl'),
                            chlType: $item('chlType').text(),
                            subCaps,
                            streamLength: $item('stream/s').length,
                            subStreamQualityCaps,
                            streamType: 'sub',
                            videoEncodeType,
                            frameRate,
                            resolution,
                            bitType: initItem?.attr('bitType'),
                            level: initItem?.attr('level'),
                            videoQuality: initItem?.attr('QoI'),
                        }
                    }

                    // 在取值后再进行排序
                    if (subCaps.res.length > 1) {
                        subCaps.res.sort((a, b) => {
                            return Number(b['value'].split('x')[0]) - Number(a['value'].split('x')[0])
                        })
                    }

                    return {
                        index,
                        id: item.attr('id')?.trim(),
                        name: $item('name').text(),
                        isRTSPChl: item.attr('isRTSPChl'),
                        chlType: $item('chlType').text(),
                        subCaps,
                        streamLength: $item('stream/s').length,
                        subStreamQualityCaps,
                        streamType: 'sub',
                    }
                })
                tableData.value = data as RecordSubStreamList[]
            })

            // isVideoQualityDisabled当前行是否可进行修改
            tableData.value.forEach((item) => {
                getQualityList(item)
                if (videoEncodeTypeArr.includes(item.videoEncodeType)) {
                    pageData.value.isVideoQualityDisabled[item.index] = true
                }
                if (item.chlType == 'recorder' || item.subCaps.res.length == 0 || item.isRTSPChl == 'true') {
                    pageData.value.isRowDisabled[item.index] = true
                }
                if (item.isRTSPChl == 'true') {
                    pageData.value.isRowNonExistent[item.index] = {} as rowNonExistent
                    if (!item.videoEncodeType) {
                        pageData.value.isRowNonExistent[item.index].videoEncodeType = 'true'
                    }
                    if (!item.resolution) {
                        pageData.value.isRowNonExistent[item.index].resolution = 'true'
                    }
                    if (!item.frameRate) {
                        pageData.value.isRowNonExistent[item.index].frameRate = 'true'
                    }
                    if (!item.videoQuality) {
                        pageData.value.isRowNonExistent[item.index].videoQuality = 'true'
                    }
                }
            })

            pageData.value.videoEncodeTypeUnionList = unionList.sort().map((item) => {
                return {
                    value: item,
                    label: STREAM_TYPE_MAPPING[item],
                }
            })

            if (maxFrameRate == 0) {
                pageData.value.frameRateUnionList = []
            }
            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                pageData.value.frameRateUnionList.push(String(i))
            }
            getResolutionDropdownData()
        }

        const setRecSubStreamData = async () => {
            let sendXML = rawXml`<content type='list' total='${String(tableData.value.length)}'>`
            tableData.value.forEach((item, index) => {
                if (!pageData.value.isRowDisabled[index]) {
                    if (item.streamLength == 3) {
                        sendXML += `<item id='${item.id}'><subRec res='${item.resolution}' fps='${item.frameRate}' QoI='${item.videoQuality}' bitType ='${item.bitType || 'CBR'}' level='${item.level}' enct='${item.videoEncodeType}'></subRec>`
                        sendXML += '</item>'
                    } else {
                        sendXML += `<item id='${item.id}'><sub res='${item.resolution}' fps='${item.frameRate}' QoI='${item.videoQuality}' bitType ='${item.bitType || 'CBR'}' level='${item.level}' enct='${item.videoEncodeType}'></sub>`
                        sendXML += '</item>'
                    }
                }
            })
            sendXML += '</content>'

            const result = await editNodeEncodeInfo(sendXML)
            commSaveResponseHadler(result)
        }

        const setData = async () => {
            let smartEncodeFlag = false
            let count = 0
            let chlName = ''

            tableData.value.forEach((item, index) => {
                if (!pageData.value.isRowDisabled[index]) {
                    if (item.videoEncodeType == 'h264smart' || item.videoEncodeType == 'h265smart') {
                        chlName = item.name
                        smartEncodeFlag = true
                        count++
                    }
                }
            })
            if (smartEncodeFlag) {
                if (count == 1) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_SIMPLE_SMART_ENCODE_TIPS').formatForLang(Translate('IDCS_CHANNEL') + ':' + chlName, Translate('IDCS_FACE_DETECTION')),
                    }).then(() => {
                        setRecSubStreamData()
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
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
            pageData.value.isVideoQualityDisabled[rowData.index] = isDisabled
            if (!isDisabled) {
                getQualityList(rowData)
                if (rowData.bitType == 'CBR') {
                    rowData.subStreamQualityCaps.forEach((item) => {
                        if (rowData.resolution == item['res'] && rowData.videoEncodeType == item['enct']) {
                            if (poeModeNode && poeModeNode == '10' && Number(item[rowData['chlType'] + 'Default']) > 6144) {
                                tableData.value[rowData.index].videoQuality = '6144'
                            } else {
                                tableData.value[rowData.index].videoQuality = item[rowData['chlType'] + 'Default']
                            }
                        }
                    })
                }
            }
        }

        const changeAllVideoEncodeType = (value: string) => {
            tableData.value.forEach((item, index) => {
                if (item.chlType !== 'recorder' && !pageData.value.isRowDisabled[index] && item.subCaps.supEnct.includes(value)) {
                    item.videoEncodeType = value
                    changeVideoEncodeType(item)
                }
            })
        }

        // 更新当前行帧率选项
        const updateFrameRate = (rowData: RecordSubStreamList, maxFrameRate: number) => {
            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps

            pageData.value.frameRateList[rowData.index] = []

            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                pageData.value.frameRateList[rowData.index].push(String(i))
            }

            pageData.value.maxFpsMap[rowData.index] = maxFrameRate
        }

        const updateTitleFrameRate = () => {
            let maxFrameRate = 0
            for (const item in pageData.value.maxFpsMap) {
                if (pageData.value.maxFpsMap[item] > maxFrameRate) {
                    maxFrameRate = pageData.value.maxFpsMap[item]
                }
            }

            pageData.value.frameRateUnionList = []

            const minFrameRate = mainStreamLimitFps > maxFrameRate ? maxFrameRate : mainStreamLimitFps
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                pageData.value.frameRateUnionList.push(String(i))
            }
        }

        // 改变当前行的分辨率
        const changeResolution = (rowData: RecordSubStreamList, value: string) => {
            rowData.subCaps.res.forEach((item, index) => {
                if (item['value'] == value) {
                    let frameRate = rowData.frameRate
                    if (Number(frameRate) > Number(item['fps'])) {
                        frameRate = item['fps']
                    }
                    if (pageData.value.maxFpsMap[index] != Number(item['fps'])) {
                        updateFrameRate(rowData, Number(item['fps']))
                        updateTitleFrameRate()
                    }
                    rowData.frameRate = frameRate
                }
            })
            getQualityList(rowData)

            if (rowData.bitType == 'CBR') {
                rowData.subStreamQualityCaps.forEach((item) => {
                    if (rowData.resolution == item['res'] && rowData.videoEncodeType == item['enct']) {
                        tableData.value[rowData.index].videoQuality = item[rowData['chlType'] + 'Default']
                    }
                })
            }
        }

        // 获取分辨率下拉框数据
        const getResolutionDropdownData = () => {
            const rowDatas = [] as RecordSubStreamList[]
            tableData.value.forEach((item, index) => {
                if (item.chlType !== 'recorder' && !pageData.value.isRowDisabled[index]) {
                    rowDatas.push(item)
                }
            })

            const resolutionMapping = {} as Record<string, SelectOption<string, string>[]>
            pageData.value.resolutionGroups = []

            rowDatas.forEach((item) => {
                const resolutionList = item.subCaps.res.map((item) => item['value'])

                const mappingKey = resolutionList.join(',')

                if (!resolutionMapping[mappingKey]) {
                    resolutionMapping[mappingKey] = []
                    pageData.value.resolutionGroups.push({
                        res: resolutionList[0],
                        resGroup: resolutionList,
                        chls: {
                            expand: pageData.value.resolutionGroups.length == 0,
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
                const ids = item.chls.data.map((item) => item['value'])

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

        const handleExpandChange = (row: ResolutionRow, expandedRows: string[]) => {
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

        const getRowKey = (row: ResolutionRow) => {
            return row.chls.data[0].value
        }

        // 在选择项时下拉框保持打开
        const keepDropDownOpen = (row: ResolutionRow) => {
            pageData.value.resolutionHeaderVisble = true
            if (row.chls.expand && resolutionTableRef.value) {
                row.chls.expand = true
                resolutionTableRef.value.toggleRowExpansion(row, true)
            } else if (row.chls.expand == false && resolutionTableRef.value) {
                row.chls.expand = false
                resolutionTableRef.value.toggleRowExpansion(row, false)
            }
        }

        const changeAllFrameRate = (value: string) => {
            tableData.value.forEach((item, index) => {
                let val = value
                if (Number(val) > pageData.value.maxFpsMap[index]) {
                    val = String(pageData.value.maxFpsMap[index])
                }
                if (!pageData.value.isRowDisabled[index]) {
                    item.frameRate = val
                }
            })
        }

        const changeAllVideoQuality = (value: string) => {
            tableData.value.forEach((item, index) => {
                if (item.chlType !== 'recorder' && !pageData.value.isRowDisabled[index] && item.qualitys?.includes(value)) item.videoQuality = value
            })
        }

        // 为不可修改行添加disabled属性,统一设置文字样式
        const disabledRow = (row: { rowIndex: number }) => {
            if (pageData.value.isRowDisabled[row.rowIndex]) return 'disabled'
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            dropdownRef,
            resolutionTableRef,
            STREAM_TYPE_MAPPING,
            RecordSubResAdaptive,
            pageData,
            tableData,
            setData,
            changeVideoEncodeType,
            changeAllVideoEncodeType,
            changeResolution,
            changeAllFrameRate,
            changeAllVideoQuality,
            handleExpandChange,
            getRowKey,
            keepDropDownOpen,
            disabledRow,
            apply,
            close,
        }
    },
})
