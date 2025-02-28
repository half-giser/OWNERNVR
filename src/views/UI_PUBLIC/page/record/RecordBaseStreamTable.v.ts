/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-15 10:04:36
 * @Description: 录像码流通用组件
 */
import { type XmlResult } from '@/utils/xmlParse'
import type { TableInstance } from 'element-plus'

export default defineComponent({
    props: {
        mode: {
            type: String,
            default: 'event',
        },
        pop: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        bandwidth(e: string) {
            return e
        },
        recTime(e: string) {
            return e
        },
    },
    setup(props, ctx) {
        const { Translate } = useLangStore()

        // 用于控制下拉菜单的打开关闭
        const resolutionTableRef = ref<TableInstance>()

        // type ResolutionGroupReturnsType = {
        //     res: string
        //     resGroup: SelectOption<string, string>[]
        //     chls: { expand: boolean; data: SelectOption<string, string>[] }
        // }

        type ChlItem = {
            id: string
            addType: string
            chlType: string
            chlIndex: string
            name: string
            poeIndex: string
            productModel: {
                value: string
                factoryName: string
            }
        }

        const pageData = ref({
            doubleStreamRecSwitch: true,
            isAuto: false,
            loopRecSwitch: false,
            videoEncodeTypeList: [] as SelectOption<string, string>[],
            resolutionGroups: [] as RecordStreamResolutionDto[],
            bitTypeList: [] as string[],
            levelList: [] as SelectOption<string, string>[],
            videoQualityList: [] as SelectOption<number, string>[],
            chls: [] as ChlItem[],
            audioOptions: [
                {
                    value: 'ON',
                    label: Translate('IDCS_ON'),
                },
                {
                    value: 'OFF',
                    label: Translate('IDCS_OFF'),
                },
            ],
            gopSetAll: undefined as number | undefined,
            maxQoI: 0, // 最大QoI
            poeModeNode: 0, // poe模式
            txtBandwidth: '', // 宽带信息
            audioInNum: -1, //支持的音频数量
            mainStreamLimitFps: 1, // 主码流帧率限制

            isRecTime: false, // 预计录像时间是否显示
            recordStreamVisible: false, // 录像码流是否显示

            headerVisble: false, // 分辨率下拉框表头是否显示
            recTime: '', // 预计录像时间
            expands: [] as string[], // 展开的行
            resolutionHeaderVisble: false, // 分辨率下拉框表头是否显示
            gopHeaderVisble: false, // GOP下拉框表头是否显示
        })

        const tableData = ref<RecordStreamInfoDto[]>([])
        const editRows = useWatchEditRows<RecordStreamInfoDto>()
        const editMode = new Set<string>()

        const virtualTableData = computed(() => {
            return [...Array(tableData.value.length).keys()]
        })

        /**
         * @description 获取设备录制参数配置
         */
        const getDevRecParamCfgModule = async () => {
            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.doubleStreamRecSwitch = $('content/recMode/doubleStreamRecSwitch').text().bool()
                pageData.value.loopRecSwitch = $('content/loopRecSwitch').text().bool()
                pageData.value.isAuto = $('content/recMode/mode').text() === 'auto'
            }
        }

        /**
         * @description 获取系统宽带容量
         */
        const getSystemCaps = async () => {
            const result = await querySystemCaps()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const totalBandwidth = $('content/totalBandwidth').text().num()
                const usedBandwidth = pageData.value.isAuto ? $('content/usedAutoBandwidth').text().num() : $('content/usedManualBandwidth').text().num()
                const remainBandwidth = Math.max(0, (totalBandwidth * 1024 - usedBandwidth) / 1024)

                pageData.value.txtBandwidth = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
                pageData.value.audioInNum = $('content/audioInNum').text().num()
                pageData.value.mainStreamLimitFps = $('content/mainStreamLimitFps').text().num() || pageData.value.mainStreamLimitFps
            }
            ctx.emit('bandwidth', pageData.value.txtBandwidth)
        }

        /**
         * @description 获取通道列表
         */
        const getChlListData = async () => {
            const res = await getChlList()
            const $ = queryXml(res)
            pageData.value.chls = $('content/item').map((ele) => {
                const eleXml = queryXml(ele.element)
                return {
                    id: ele.attr('id'),
                    addType: eleXml('addType').text(),
                    chlType: eleXml('chlType').text(),
                    chlIndex: eleXml('chlIndex').text(),
                    name: eleXml('name').text(),
                    poeIndex: eleXml('poeIndex').text(),
                    productModel: {
                        value: eleXml('productModel').text(),
                        factoryName: eleXml('productModel').attr('factoryName'),
                    },
                }
            })
        }

        /**
         * @description 获取网络配置信息
         */
        const getNetCfgModule = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.poeModeNode = $('content/poeMode').text().num()
            }
        }

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            editRows.clear()
            editMode.clear()

            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <mainCaps/>
                    <main/>
                    ${pageData.value.isAuto ? '<an/><ae/>' : '<mn/><me/>'}
                    <mainStreamQualityCaps/>
                    <levelNote/>
                </requireField>
            `
            const result = await queryNodeEncodeInfo(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((ele) => {
                    const $item = queryXml(ele.element)
                    const item = new RecordStreamInfoDto()
                    item.id = ele.attr('id').trim()
                    item.name = $item('name').text()
                    item.chlType = $item('chlType').text()
                    item.mainCaps = {
                        supEnct: $item('mainCaps')
                            .attr('supEnct')
                            .array()
                            .map((item) => {
                                return {
                                    value: item,
                                    label: Translate(DEFAULT_STREAM_TYPE_MAPPING[item]),
                                }
                            }),
                        bitType: $item('mainCaps').attr('bitType').array(),
                        res: $item('mainCaps/res').map((element) => {
                            return {
                                fps: element.attr('fps').num(),
                                value: element.text(),
                                label: element.text(),
                            }
                        }),
                    }

                    const $main = $item('main')
                    item.main = {
                        enct: $main.attr('enct'),
                        aGOP: $main.attr('aGOP'),
                        mGOP: $main.attr('mGOP'),
                    }

                    item.videoEncodeType = $item('main').attr('enct')

                    setAttr($item('an'), item.an)
                    setAttr($item('ae'), item.ae)
                    setAttr($item('mn'), item.mn)
                    setAttr($item('me'), item.me)

                    item.streamType = 'main'
                    item.disabled = item.chlType === 'recorder' || !item.mainCaps.res.length

                    // 获取码率类型
                    $item('mainStreamQualityCaps/item').forEach((element) => {
                        item.mainStreamQualityCaps.push({
                            enct: element.attr('enct'),
                            res: element.attr('res'),
                            digitalDefault: element.attr('digitalDefault').num(),
                            analogDefault: element.attr('analogDefault').num(),
                            value: element.text().array(),
                        })
                        if (element.attr('enct') === 'h264' && element.attr('res') === '0x0') {
                            element
                                .text()
                                .array()
                                .forEach((ele) => {
                                    const value = Number(ele)
                                    pageData.value.maxQoI = Math.max(value, pageData.value.maxQoI)
                                    if (pageData.value.poeModeNode === 10 && value <= 6144) {
                                        //为长线模式时，过滤掉6M以上的码率
                                        pageData.value.videoQualityList.push({
                                            value,
                                            label: ele + 'Kbps',
                                        })
                                    } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === 100) {
                                        pageData.value.videoQualityList.push({
                                            value,
                                            label: ele + 'Kbps',
                                        })
                                    }
                                })
                        }
                    })

                    item.levelNote = $item('levelNote')
                        .text()
                        .array()
                        .reverse()
                        .map((item) => {
                            return {
                                value: item,
                                label: Translate(DEFAULT_IMAGE_LEVEL_MAPPING[item]),
                            }
                        })
                    pageData.value.levelList = [...item.levelNote]

                    //遍历item['mainCaps']['supEnct']，获取编码类型并集
                    item.mainCaps.supEnct.forEach((element) => {
                        if (!pageData.value.videoEncodeTypeList.some((find) => find.value === element.value)) {
                            pageData.value.videoEncodeTypeList.push(element)
                        }
                    })

                    item.mainCaps.bitType.forEach((element) => {
                        if (!pageData.value.bitTypeList.includes(element)) {
                            pageData.value.bitTypeList.push(element)
                        }
                    })

                    if (item.mainCaps.res.length > 1) {
                        item.mainCaps.res.sort((a, b) => {
                            const a1 = Number(a.value.split('x')[0])
                            const b1 = Number(b.value.split('x')[0])
                            return b1 - a1
                        })
                    }

                    return item
                })
            }
        }

        /**
         * @description
         * @param {XmlResult} $
         * @param {RecordStreamInfoAttrDto} attrObj
         */
        const setAttr = ($: XmlResult, attrObj: RecordStreamInfoAttrDto) => {
            attrObj.res = $.attr('res')
            attrObj.fps = $.attr('fps').num()
            attrObj.QoI = $.attr('QoI').num()
            attrObj.audio = $.attr('audio')
            attrObj.type = $.attr('type')
            attrObj.bitType = $.attr('bitType')
            attrObj.level = $.attr('level')
            attrObj.originalFps = attrObj.fps
        }

        /**
         * @description
         * @param {RecordStreamInfoDto} item
         * @param {RecordStreamInfoAttrDto} attrObj
         * @param {boolean} isAuto
         */
        const getAttr = (item: RecordStreamInfoDto, attrObj: RecordStreamInfoAttrDto, isAuto: boolean) => {
            if (isAuto) {
                item.GOP = item.main.aGOP ? Number(item.main.aGOP) : undefined
            } else {
                item.GOP = item.main.mGOP ? Number(item.main.mGOP) : undefined
            }

            item.resolution = attrObj.res
            item.frameRate = attrObj.fps
            item.bitType = attrObj.bitType
            item.level = attrObj.level
            item.videoQuality = attrObj.QoI
            item.audio = attrObj.audio
            item.recordStream = attrObj.type
        }

        /**
         * @description
         * @param {RecordStreamInfoDto} item
         * @param {RecordStreamInfoAttrDto} attrObj
         * @param {boolean} isAuto
         */
        const saveAttr = (item: RecordStreamInfoDto, attrObj: RecordStreamInfoAttrDto, isAuto: boolean) => {
            if (isAuto) {
                item.main.aGOP = item.GOP === undefined ? '' : String(item.GOP)
            } else {
                item.main.mGOP = item.GOP === undefined ? '' : String(item.GOP)
            }

            attrObj.res = item.resolution
            attrObj.fps = item.frameRate
            attrObj.bitType = item.bitType
            attrObj.level = item.level
            attrObj.QoI = item.videoQuality
            attrObj.audio = item.audio
            attrObj.type = item.recordStream
        }

        /**
         * @description 进行整体设置及一些操作
         */
        const doCfg = () => {
            tableData.value.forEach((item) => {
                if (props.mode === 'event') {
                    if (pageData.value.isAuto) {
                        getAttr(item, item.ae, true)
                    } else {
                        getAttr(item, item.me, false)
                    }
                } else if (props.mode === 'timing') {
                    if (pageData.value.isAuto) {
                        getAttr(item, item.an, true)
                    } else {
                        getAttr(item, item.mn, false)
                    }
                }

                if (!item.frameRate && item.mainCaps.res.length) {
                    item.frameRate = item.mainCaps.res[0].fps
                }

                item.supportAudio = true
                if (pageData.value.audioInNum > 0) {
                    item.supportAudio = pageData.value.chls.every((chl) => {
                        return chl.id !== item.id || !chl.chlIndex || Number(chl.chlIndex) < pageData.value.audioInNum
                    })
                }

                item.mainStreamQualityCaps.sort((item1, item2) => {
                    const resolutionParts1 = item1.res.split('x')
                    const resolutionParts2 = item2.res.split('x')
                    return item1.enct !== item2.enct
                        ? item1.enct > item2.enct
                            ? -1
                            : 1
                        : resolutionParts1[0] !== resolutionParts2[0]
                          ? Number(resolutionParts1[0]) > Number(resolutionParts2[0])
                              ? -1
                              : 1
                          : resolutionParts1[1] !== resolutionParts2[1]
                            ? Number(resolutionParts1[1]) > Number(resolutionParts2[1])
                                ? -1
                                : 1
                            : 0
                })

                if (!item.disabled) {
                    editRows.listen(item)
                }
            })

            // 排序 NT-9768
            pageData.value.videoEncodeTypeList.sort((a, b) => {
                return a.value.charCodeAt(0) - b.value.charCodeAt(0)
            })

            pageData.value.resolutionGroups = getResolutionGroups()
        }

        /**
         * @description 保存设置
         * @param {string} mode
         */
        const saveCfg = (mode: string) => {
            editMode.add(mode)
            editRows.off()
            tableData.value.forEach((item) => {
                if (mode === 'event') {
                    if (pageData.value.isAuto) {
                        saveAttr(item, item.ae, true)
                    } else {
                        saveAttr(item, item.me, false)
                    }
                } else {
                    if (pageData.value.isAuto) {
                        saveAttr(item, item.an, true)
                    } else {
                        saveAttr(item, item.mn, false)
                    }
                }
            })
        }

        /**
         * @description 格式化剩余的录制时间
         * @param {number} remainRecTime
         * @returns {string}
         */
        const getTranslateRecTime = (remainRecTime: number) => {
            if (remainRecTime === 0 && pageData.value.loopRecSwitch) {
                return Translate('IDCS_CYCLE_RECORD')
            }

            if (remainRecTime <= 1) {
                return Math.max(0, remainRecTime) + ' ' + Translate('IDCS_DAY_TIME')
            }

            return remainRecTime + ' ' + Translate('IDCS_DAY_TIMES')
        }

        /**
         * @description 查询和显示当前录制状态下剩余的录制时间
         */
        const getRemainRecTime = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>  
                    <recMode type='recModeType'>${pageData.value.isAuto ? 'auto' : 'manually'}</recMode> 
                    <streamType type='streamType'>Main</streamType>
                    <chls type='list'>
                        ${tableData.value
                            .map((rowData) => {
                                if (!rowData.disabled) {
                                    return rawXml`
                                        <item id='${rowData.id}'>
                                            <QoI>${rowData.videoQuality}</QoI>
                                        </item>
                                    `
                                }
                                return ''
                            })
                            .join('')}
                    </chls>
                </content>
            `
            const result = await queryRemainRecTime(sendXml)
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.recTime = ''
                const item = $('content/item')
                if (item.length >= 2) {
                    const recTimeArray: string[] = []
                    item.forEach((ele) => {
                        const $item = queryXml(ele.element)
                        const remainRecTime = $item('remainRecTime').text().num()
                        const recTime = getTranslateRecTime(remainRecTime)
                        const diskGroupIndex = '(' + Translate('IDCS_REEL_GROUP') + $item('diskGroupIndex').text() + ')'
                        recTimeArray.push(recTime + diskGroupIndex)
                    })
                    pageData.value.recTime = recTimeArray.join(';')
                } else if (!item.length) {
                    pageData.value.isRecTime = false
                } else {
                    const remainRecTime = $('content/item/remainRecTime').text().num()
                    const recTime = getTranslateRecTime(remainRecTime)
                    pageData.value.recTime = Translate('IDCS_PREDICT_RECORD_TIME') + recTime
                }
            }
            ctx.emit('recTime', pageData.value.recTime)
        }

        /**
         * @description 设置videoQuality
         * @param {RecordStreamInfoDto} rowData
         */
        const setQuality = (rowData: RecordStreamInfoDto) => {
            rowData.mainStreamQualityCaps.forEach((element) => {
                if (rowData.resolution === element.res && rowData.videoEncodeType === element.enct) {
                    if (rowData.chlType === 'digital') {
                        if (pageData.value.poeModeNode === 10 && element.digitalDefault > 6144) {
                            rowData.videoQuality = 6144
                        } else {
                            rowData.videoQuality = element.digitalDefault
                        }
                    } else {
                        if (pageData.value.poeModeNode === 10 && element.analogDefault > 6144) {
                            rowData.videoQuality = 6144
                        } else {
                            rowData.videoQuality = element.analogDefault
                        }
                    }
                }
            })
        }

        /**
         * @description 根据参数变化生成码率范围
         * @param {RecordStreamInfoDto} item
         */
        const getBitRange = (item: RecordStreamInfoDto) => {
            if (!item.resolution || !item.bitType || item.bitType === 'CBR') {
                return '--'
            }
            const bitRange = getBitrateRange({
                resolution: item.resolution,
                level: item.level,
                fps: item.frameRate,
                maxQoI: pageData.value.maxQoI,
                videoEncodeType: item.videoEncodeType,
            })
            if (bitRange) {
                return `${bitRange.min}~${bitRange.max}Kbps`
            }
        }

        /**
         * @description 对单个视频编码进行处理
         * @param {rowData} rowData
         */
        const changeVideoEncodeType = (rowData: RecordStreamInfoDto) => {
            const isDisabled = DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(rowData.videoEncodeType)
            if (!isDisabled) {
                if (rowData.bitType === 'CBR') {
                    setQuality(rowData)
                }
            }
        }

        /**
         * @description 设置整列的视频编码
         * @param {string} videoEncodeType
         */
        const changeAllVideoEncodeType = (videoEncodeType: string) => {
            tableData.value.forEach((rowData) => {
                if (rowData.mainCaps.supEnct.some((find) => find.value === videoEncodeType) && !rowData.disabled) {
                    rowData.videoEncodeType = videoEncodeType
                    changeVideoEncodeType(rowData)
                }
            })
        }

        /**
         * @description 对单个分辨率进行处理
         * @param {RecordStreamInfoDto} rowData
         */
        const changeResolution = (rowData: RecordStreamInfoDto) => {
            if (rowData.bitType === 'CBR') {
                rowData.mainStreamQualityCaps.forEach((element) => {
                    if (rowData.chlType === 'digital') {
                        if (rowData.resolution === element.res && rowData.videoEncodeType === element.enct) {
                            rowData.videoQuality = element.digitalDefault
                        }
                    } else {
                        if (rowData.resolution === element.res && rowData.videoEncodeType === element.enct) {
                            rowData.videoQuality = element.analogDefault
                        }
                    }
                })
            }
        }

        /**
         * @description 设置整列的分辨率
         */
        const changeAllResolution = () => {
            pageData.value.resolutionGroups.forEach((rowData) => {
                const resolution = rowData.res
                const ids = rowData.chls.data.map((element) => {
                    return element.value
                })
                const changeRows: RecordStreamInfoDto[] = []
                // 获取tableData中的被修改的数据,设置编辑状态，更新数据
                tableData.value.forEach((element) => {
                    if (!element.disabled) {
                        if (ids.includes(element.id)) {
                            changeRows.push(element)
                            element.resolution = resolution
                        }
                    }
                })

                // 生成码率范围
                changeRows.forEach((element) => {
                    if (element.bitType === 'CBR') {
                        element.mainStreamQualityCaps.forEach((ele) => {
                            if (element.resolution === ele.res && element.videoEncodeType === ele.enct) {
                                if (element.chlType === 'digital') {
                                    element.videoQuality = ele.digitalDefault
                                } else {
                                    element.videoQuality = ele.analogDefault
                                }
                            }
                        })
                    }
                })
            })
            pageData.value.resolutionHeaderVisble = false
        }

        /**
         * @description 取消分辨率下拉框表头
         */
        const cancelSetAllResolution = () => {
            pageData.value.resolutionHeaderVisble = false
        }

        /**
         * @description 展开或者收起分辨率下拉框的方法
         * @param {RecordStreamResolutionDto} row
         * @param {string[]} expandedRows
         */
        const changeExpandResolution = (row: RecordStreamResolutionDto, expandedRows: string[]) => {
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

        /**
         * @description 获取分辨率下拉框的key
         * @param {RecordStreamResolutionDto} row
         */
        const getRowKey = (row: RecordStreamResolutionDto) => {
            return row.chls.data[0].value
        }

        /**
         * @description 设置整列的帧率
         * @param {number} frameRate
         */
        const changeAllFrameRate = (frameRate: number) => {
            tableData.value.forEach((rowData) => {
                let currentFrameRate = frameRate
                if (!rowData.disabled) {
                    const frameRateList = getFrameRateSingleList(rowData)
                    if (frameRate > frameRateList[0].value) {
                        currentFrameRate = frameRateList[0].value
                    }
                    rowData.frameRate = currentFrameRate
                }
            })
        }

        /**
         * @description 对单个码率类型进行处理
         * @param {RecordStreamInfoDto} rowData
         */
        const changeBitType = (rowData: RecordStreamInfoDto) => {
            const isCBR = rowData.bitType === 'CBR'
            if (isCBR) {
                setQuality(rowData)
            }
        }

        /**
         * @description 设置整列的bitType
         * @param {string} bitType
         */
        const changeAllBitType = (bitType: string) => {
            const isCBR = bitType === 'CBR'
            tableData.value.forEach((rowData, index) => {
                if (rowData.mainCaps.bitType.includes(bitType) && rowData.bitType.length !== 0 && !isBitTypeDisabled(index)) {
                    rowData.bitType = bitType
                    if (isCBR) {
                        setQuality(rowData)
                    }
                }
            })
        }

        /**
         * @description 设置整列的level
         * @param {string} level
         */
        const changeAllLevel = (level: string) => {
            tableData.value.forEach((rowData, index) => {
                if (!isLevelDisabled(index)) {
                    rowData.level = level
                }
            })
        }

        /**
         * @description 设置整列的videoQuality
         * @param {number} videoQuality
         */
        const changeAllVideoQuality = (videoQuality: number) => {
            tableData.value.forEach((rowData, index) => {
                if (!isVideoQualityDisabled(index)) {
                    if (
                        getQualityList(rowData)
                            .map((item) => item.value)
                            .includes(videoQuality)
                    ) {
                        rowData.videoQuality = videoQuality
                    }
                }
            })
        }

        /**
         * @description 设置整列的audio
         * @param {SelectOption<string, string>} audio
         */
        const changeAllAudio = (audio: SelectOption<string, string>) => {
            tableData.value.forEach((rowData, index) => {
                if (rowData.supportAudio && !isAudioDisabled(index)) {
                    rowData.audio = audio.value
                }
            })
        }

        /**
         * @description 设置整列的GOP
         * @param {number | undefined} gop
         */
        const changeAllGOP = (gop: number | undefined) => {
            tableData.value.forEach((rowData, index) => {
                if (!isGOPDisabled(index)) {
                    rowData.GOP = gop
                }
            })
            pageData.value.gopHeaderVisble = false
        }

        /**
         * @description 取消设置整列的GOP
         */
        const cancelSetGOP = () => {
            pageData.value.gopSetAll = 0
            pageData.value.gopHeaderVisble = false
        }

        /**
         * @description 当前码率类型是否禁用
         * @param {Number} index
         * @returns {Boolean}
         */
        const isBitTypeDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(item.videoEncodeType)
        }

        /**
         * @description 当前图片质量是否禁用
         * @param {Number} index
         * @returns {Boolean}
         */
        const isLevelDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || item.bitType === 'CBR' || !item.bitType
        }

        /**
         * @description 是否禁用所有图片质量
         * @returns {Boolean}
         */
        const isAllLevelDisabled = () => {
            return tableData.value.every((_item, index) => isLevelDisabled(index))
        }

        /**
         * @description 是否禁用音频
         * @param {Number} index
         * @returns {Boolean}
         */
        const isAudioDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || !item.audio
        }

        /**
         * @description 当前码率上限是否禁用
         * @param {Number} index
         */
        const isVideoQualityDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(item.videoEncodeType)
        }

        /**
         * @description 是否禁用当前项GOP
         * @param {Number} index
         */
        const isGOPDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(item.videoEncodeType) || typeof tableData.value[index].GOP !== 'number'
        }

        /**
         * @description 对码流类型显示进行处理
         * @param {RecordStreamInfoDto} rowData
         * @returns {string}
         */
        const displayStreamType = (rowData: RecordStreamInfoDto) => {
            const value = rowData.streamType
            return Translate(DEFAULT_STREAM_TYPE_MAPPING[value])
        }

        /**
         * @description 获取全局可选取的帧率范围
         * @returns {SelectOption<number, number>}
         */
        const getFrameRateList = () => {
            let maxFrameRate = 0
            tableData.value.forEach((element) => {
                element.mainCaps.res.forEach((obj) => {
                    if (element.resolution === obj.value && maxFrameRate < obj.fps) {
                        maxFrameRate = obj.fps
                    }
                })
            })
            if (maxFrameRate === 0) return []

            const fps: number[] = []
            const minFrameRate = Math.min(pageData.value.mainStreamLimitFps, maxFrameRate)
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                fps.push(i)
            }
            return arrayToOptions(fps)
        }

        /**
         * @description 获取单个设备的帧率范围
         * @param {RecordStreamInfoDto} rowData
         * @returns {SelectOption<number, number>}
         */
        const getFrameRateSingleList = (rowData: RecordStreamInfoDto) => {
            const frameRates: number[] = []
            rowData.mainCaps.res.forEach((obj) => {
                if (obj.value === rowData.resolution) {
                    const maxFrameRate = obj.fps
                    const minFrameRate = Math.min(pageData.value.mainStreamLimitFps, maxFrameRate)
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

        /**
         * @description 获取整体的分辨率下拉框数据
         * @returns {RecordStreamResolutionDto[]}
         */
        const getResolutionGroups = () => {
            // 生成数据
            const rowDatas = tableData.value.filter((item) => {
                return item.chlType !== 'recorder' && !item.disabled
            })
            const resolutionMapping: Record<string, SelectOption<string, string>[]> = {}
            const resolutionGroups: RecordStreamResolutionDto[] = []
            rowDatas.forEach((rowData) => {
                const resolutionList: string[] = []
                rowData.mainCaps.res.forEach((element) => {
                    resolutionList.push(element.value)
                })
                const mappingKey = resolutionList.join(',')
                if (!resolutionMapping[mappingKey]) {
                    resolutionMapping[mappingKey] = []
                    resolutionGroups.push({
                        res: resolutionList[0],
                        resGroup: resolutionList.map((res) => {
                            return {
                                value: res,
                                label: res,
                            }
                        }),
                        chls: {
                            expand: false,
                            data: resolutionMapping[mappingKey],
                        },
                    })
                }
                resolutionMapping[mappingKey].push({
                    value: rowData.id,
                    label: rowData.name,
                })
            })
            return resolutionGroups
        }

        /**
         * @description 获取码率选项
         * @param {RecordStreamInfoDto} rowData
         */
        const getQualityList = (rowData: RecordStreamInfoDto) => {
            const qualitys: SelectOption<number, string>[] = []
            // rtsp通道只有声音节点，没有其他
            if (rowData.mainStreamQualityCaps.length) {
                let isQualityCapsMatch = false
                let isQualityCapsEmpty = true
                rowData.mainStreamQualityCaps.forEach((element) => {
                    if (element.enct === rowData.videoEncodeType && element.res === rowData.resolution) {
                        if (element.value[0]) {
                            isQualityCapsEmpty = false
                            const tmp = element.value
                            tmp.forEach((element) => {
                                const value = Number(element)
                                if (pageData.value.poeModeNode === 10 && value <= 6144) {
                                    qualitys.push({
                                        value,
                                        label: element + 'Kbps',
                                    })
                                } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === 100) {
                                    qualitys.push({
                                        value,
                                        label: element + 'Kbps',
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
                    rowData.mainStreamQualityCaps.forEach((element) => {
                        const currentResolutionParts = element.res.split('x')
                        if (
                            element.enct === rowData.videoEncodeType &&
                            (Number(currentResolutionParts[0]) < Number(resolutionParts[0]) ||
                                (currentResolutionParts[0] === resolutionParts[0] && Number(currentResolutionParts[1]) < Number(resolutionParts[1])))
                        ) {
                            if (element.value[0]) {
                                isQualityCapsEmpty = false
                                const tmp = element.value
                                tmp.forEach((element) => {
                                    const value = Number(element)
                                    if (pageData.value.poeModeNode === 10 && value <= 6144) {
                                        qualitys.push({
                                            value,
                                            label: element + 'Kbps',
                                        })
                                    } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === 100) {
                                        qualitys.push({
                                            value,
                                            label: element + 'Kbps',
                                        })
                                    }
                                })
                            }
                        }
                    })
                }

                // 对应项如果码率列表为空，则取所有支持的码率列表
                if (isQualityCapsEmpty) {
                    rowData.mainStreamQualityCaps.forEach((element) => {
                        if (element.enct === rowData.videoEncodeType && element.res === '0x0') {
                            const tmp = element.value
                            tmp.forEach((element) => {
                                const value = Number(element)
                                if (pageData.value.poeModeNode === 10 && value <= 6144) {
                                    qualitys.push({
                                        value,
                                        label: element + 'Kbps',
                                    })
                                } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === 100) {
                                    qualitys.push({
                                        value,
                                        label: element + 'Kbps',
                                    })
                                }
                            })
                        }
                    })
                }
            }
            return qualitys
        }

        /**
         * @description 编辑请求数据
         * @returns {string}
         */
        const getSaveData = () => {
            const editRowDatas = editRows.toArray()
            const recType = (() => {
                if (props.mode === 'event') {
                    return pageData.value.isAuto ? 'ae' : 'me'
                } else {
                    return pageData.value.isAuto ? 'an' : 'mn'
                }
            })()
            const sendXml = rawXml`
                <content type='list' total='${editRowDatas.length}'>
                    ${editRowDatas
                        .map((item) => {
                            const bitType = item.bitType || 'CBR'

                            let mainXml = ''
                            const gop = pageData.value.isAuto ? 'aGOP' : 'mGOP'
                            if (typeof item.GOP !== 'number') {
                                const max = Math.max(item.an.originalFps, item.ae.originalFps, item.mn.originalFps, item.me.originalFps, item.frameRate) * 4
                                mainXml = `<main enct="${item.videoEncodeType}" ${gop}="${max}"></main>`
                            } else {
                                mainXml = `<main enct="${item.videoEncodeType}" ${gop}="${item.GOP}" ></main>`
                            }

                            let attrXml = ''
                            if (editMode.size === 1) {
                                attrXml = `<${recType} res="${item.resolution}" fps="${item.frameRate}" QoI="${item.videoQuality}" audio="${item.audio}" type="${item.recordStream}" bitType="${bitType}" level="${item.level}"></${recType}>`
                            } else {
                                if (pageData.value.isAuto) {
                                    attrXml = rawXml`
                                        <an res="${item.an.res}" fps="${item.an.fps}" QoI="${item.an.QoI}" audio="${item.an.audio}" type="${item.an.type}" bitType="${item.an.bitType}" level="${item.an.level}"></an>
                                        <ae res="${item.ae.res}" fps="${item.ae.fps}" QoI="${item.ae.QoI}" audio="${item.ae.audio}" type="${item.ae.type}" bitType="${item.ae.bitType}" level="${item.ae.level}"></ae>
                                    `
                                } else {
                                    attrXml = rawXml`
                                        <mn res="${item.mn.res}" fps="${item.mn.fps}" QoI="${item.mn.QoI}" audio="${item.mn.audio}" type="${item.mn.type}" bitType="${item.mn.bitType}" level="${item.mn.level}"></mn>
                                        <me res="${item.me.res}" fps="${item.me.fps}" QoI="${item.me.QoI}" audio="${item.me.audio}" type="${item.me.type}" bitType="${item.me.bitType}" level="${item.me.level}"></me>
                                    `
                                }
                            }

                            return rawXml`
                                <item id="${item.id}">
                                    ${attrXml}
                                    ${mainXml}
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            return sendXml
        }

        /**
         * @description 保存数据
         */
        const setData = () => {
            if (!editRows.size()) {
                return
            }
            saveCfg(props.mode)

            const sendXml = getSaveData()
            openLoading()
            editNodeEncodeInfo(sendXml)
                .then((result) => {
                    closeLoading()
                    const $ = queryXml(result)
                    getSystemCaps()
                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        }).then(() => {
                            editRows.toArray().forEach((item) => {
                                editRows.remove(item)
                            })
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        if (errorCode === ErrorCode.USER_ERROR_OVER_LIMIT) {
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'))
                        } else {
                            openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        }
                    }
                })
                .catch(() => {
                    closeLoading()
                })
        }

        /**
         * @description 分辨率弹窗分辨率选项发生变化时，阻止分辨率弹窗消失
         */
        const changeResolutionVisible = () => {
            setTimeout(() => {
                pageData.value.resolutionHeaderVisble = true
            }, 0)
        }

        ctx.expose({
            getRemainRecTime,
            setData,
        })

        onMounted(async () => {
            openLoading()

            await getDevRecParamCfgModule()
            await getSystemCaps()
            await getChlListData()
            await getNetCfgModule()
            await getData()
            doCfg()
            if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                pageData.value.isRecTime = true
                await getRemainRecTime()
            }

            closeLoading()
        })

        watch(
            () => props.mode,
            (_, oldMode) => {
                saveCfg(oldMode)
                doCfg()
            },
        )

        return {
            getFrameRateList,
            getFrameRateSingleList,
            getQualityList,
            getBitRange,
            tableData,
            virtualTableData,
            editRows,
            pageData,
            resolutionTableRef,
            changeVideoEncodeType,
            changeAllVideoEncodeType,
            changeResolution,
            changeAllResolution,
            cancelSetAllResolution,
            changeExpandResolution,
            getRowKey,
            changeAllFrameRate,
            changeBitType,
            changeAllBitType,
            changeAllLevel,
            changeAllVideoQuality,
            changeAllAudio,
            changeAllGOP,
            cancelSetGOP,
            displayStreamType,
            getRemainRecTime,
            setData,
            arrayToOptions,
            changeResolutionVisible,
            isBitTypeDisabled,
            isAudioDisabled,
            isLevelDisabled,
            isAllLevelDisabled,
            isGOPDisabled,
            isVideoQualityDisabled,
        }
    },
})
