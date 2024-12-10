/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-15 10:04:36
 * @Description: 录像码流通用组件
 */
import { RecordStreamInfoDto } from '@/types/apiType/record'
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
        initkey: {
            type: String,
            default: '',
            required: false,
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
        // 用于控制下拉菜单的打开关闭
        const resolutionTableRef = ref<TableInstance>()

        type ResolutionGroupReturnsType = {
            res: string
            resGroup: SelectOption<string, string>[]
            chls: { expand: boolean; data: SelectOption<string, string>[] }
        }

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

        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const streamTypeMapping: Record<string, string> = {
            // 码流类型映射
            main: 'IDCS_MAIN_STREAM',
            sub: 'IDCS_SUB_STREAM',
            h264: 'IDCS_VIDEO_ENCT_TYPE_H264',
            h264s: 'IDCS_VIDEO_ENCT_TYPE_H264_SMART',
            h264p: 'IDCS_VIDEO_ENCT_TYPE_H264_PLUS',
            h265: 'IDCS_VIDEO_ENCT_TYPE_H265',
            h265s: 'IDCS_VIDEO_ENCT_TYPE_H265_SMART',
            h265p: 'IDCS_VIDEO_ENCT_TYPE_H265_PLUS',
        }

        const videoEncodeTypeArr = ['h264s', 'h265s', 'h264p', 'h265p'] // 可修改bitType、videoQuality、GOP的码流类型

        const imageLevelMapping: Record<string, string> = {
            // 图像质量映射
            highest: 'IDCS_HIGHEST',
            higher: 'IDCS_HIGHER',
            medium: 'IDCS_MEDIUM',
            low: 'IDCS_LOW',
            lower: 'IDCS_LOWER',
            lowest: 'IDCS_LOWEST',
            '': 'IDCS_LOWEST',
        }

        const recordStreams = [
            // 录像码流
            {
                value: 'main',
                label: Translate('IDCS_MAIN_STREAM'),
            },
            {
                value: 'sub',
                label: Translate('IDCS_SUB_STREAM'),
            },
        ]

        const DevRecParamCfgModule = {
            // 设备录制参数
            doubleStreamRecSwitch: true,
        }

        // 事件录像码流参数
        const RecStreamModule = ref({
            recType: '',
            recType1: '',
            loopRecSwitch: false,
        })

        const pageData = ref({
            videoEncodeTypeUnionList: [] as SelectOption<string, string>[],
            resolutionGroups: [] as ResolutionGroupReturnsType[],
            bitTypeUnionList: [] as string[],
            levelList: [] as SelectOption<string, string>[],
            videoQualityList: [] as SelectOption<string, string>[],
            frameRateList: [] as SelectOption<string, string>[],
            maxFpsMap: {} as Record<string, number>,
            videoQualityListFlag: 0,
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
            smartEncodeFlag: false,
            gopSetAll: undefined as number | undefined,
            count: 0,
            chlName: '',
            maxQoI: 0, // 最大QoI
            poeModeNode: '', // poe模式
            txtBandwidth: ref(''), // 宽带信息
            audioInNum: -1, //支持的音频数量
            mainStreamLimitFps: 1, // 主码流帧率限制

            PredictVisible: false, // 预计录像时间是否显示
            CalculateVisible: false, // 计算按钮是否显示
            recordStreamVisible: false, // 录像码流是否显示

            isAllCBR: true, // 是否全为CBR
            headerVisble: false, // 分辨率下拉框表头是否显示
            levelDropDisable: false, // 图像质量下拉框是否禁用
            bitTypeDropDisable: false, // 码率类型下拉框是否禁用
            recTime: '', // 预计录像时间
            expands: [] as string[], // 展开的行
            firstInit: true, // 是否第一次初始化

            resolutionHeaderVisble: false, // 分辨率下拉框表头是否显示
            gopHeaderVisble: false, // GOP下拉框表头是否显示
        })

        const tableData = ref<RecordStreamInfoDto[]>([])
        const editRows = useWatchEditRows<RecordStreamInfoDto>()
        const virtualTableData = computed(() => {
            return Array(tableData.value.length)
                .fill(1)
                .map((item, index) => item + index)
        })

        // 获取设备录制参数配置
        const getDevRecParamCfgModule = async () => {
            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                DevRecParamCfgModule.doubleStreamRecSwitch = $('content/recMode/doubleStreamRecSwitch').text().bool()
                const isAuto = $('content/recMode/mode').text() === 'auto'
                RecStreamModule.value.loopRecSwitch = $('content/loopRecSwitch').text().bool()
                if (props.mode === 'event') {
                    RecStreamModule.value.recType = isAuto ? 'ae' : 'me'
                    RecStreamModule.value.recType1 = isAuto ? 'an' : 'mn'
                } else if (props.mode === 'timing') {
                    RecStreamModule.value.recType = isAuto ? 'an' : 'mn'
                    RecStreamModule.value.recType1 = isAuto ? 'ae' : 'me'
                }
            }
        }

        // 获取系统宽带容量
        const getSystemCaps = async () => {
            const result = await querySystemCaps()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                const totalBandwidth = $('content/totalBandwidth').text().num()
                let usedBandwidth = 0
                if (props.mode === 'event') {
                    usedBandwidth = $('content/' + (RecStreamModule.value.recType === 'me' ? 'usedManualBandwidth' : 'usedAutoBandwidth'))
                        .text()
                        .num()
                } else if (props.mode === 'timing') {
                    usedBandwidth = $('content/' + (RecStreamModule.value.recType === 'mn' ? 'usedManualBandwidth' : 'usedAutoBandwidth'))
                        .text()
                        .num()
                }
                // 可能要用于bandwidthDetail
                // const singleChannelBandwidth = $('content/singleChannelBandwidth').text()
                // const unit = $('content/singleChannelBandwidth').attr('unit')
                // const bandwidthCalc = singleChannelBandwidth + unit
                let remainBandwidth = (totalBandwidth * 1024 - usedBandwidth) / 1024
                if (remainBandwidth < 0) {
                    remainBandwidth = 0
                }
                pageData.value.txtBandwidth = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
                pageData.value.audioInNum = $('content/audioInNum').text().num()
                pageData.value.mainStreamLimitFps = $('content/mainStreamLimitFps').text().num() || pageData.value.mainStreamLimitFps
            }
            ctx.emit('bandwidth', pageData.value.txtBandwidth)
        }

        // 获取通道列表
        const getChlListData = async () => {
            const res = await getChlList({})
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

        // 获取网络配置信息
        const getNetCfgModule = async () => {
            const result = await queryNetCfgV2()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.poeModeNode = $('content/poeMode').text()
            }
        }

        // 获取表格数据
        const getData = async () => {
            editRows.clear()
            openLoading()

            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <mainCaps/>
                    <main/>
                    <${RecStreamModule.value.recType}/>
                    <${RecStreamModule.value.recType1}/>
                    <mainStreamQualityCaps/>
                    <levelNote/>
                </requireField>
            `
            const result = await queryNodeEncodeInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = []
                // 遍历('//cotent/item')，获取表格数据
                $('content/item').forEach((ele) => {
                    const $item = queryXml(ele.element)
                    const item = new RecordStreamInfoDto()
                    item.id = ele.attr('id').trim()
                    item.name = $item('name').text()
                    item.chlType = $item('chlType').text()
                    item.mainCaps = {
                        supEnct: ($item('mainCaps') && $item('mainCaps').attr('supEnct') ? $item('mainCaps').attr('supEnct').split(',') : []).map((item) => {
                            return {
                                value: item,
                                label: Translate(streamTypeMapping[item]),
                            }
                        }),
                        bitType: $item('mainCaps') && $item('mainCaps').attr('bitType') ? $item('mainCaps').attr('bitType').split(',') : [],
                        res: $item('mainCaps/res').map((element) => {
                            return {
                                fps: element.attr('fps'),
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

                    const $an = $item('an')
                    item.an = {
                        res: $an.attr('res'),
                        fps: $an.attr('fps'),
                        QoI: $an.attr('QoI'),
                        audio: $an.attr('audio'),
                        type: $an.attr('type'),
                        bitType: $an.attr('bitType'),
                        level: $an.attr('level'),
                    }

                    const $ae = $item('ae')
                    item.ae = {
                        res: $ae.attr('res'),
                        fps: $ae.attr('fps'),
                        QoI: $ae.attr('QoI'),
                        audio: $ae.attr('audio'),
                        type: $ae.attr('type'),
                        bitType: $ae.attr('bitType'),
                        level: $ae.attr('level'),
                    }

                    const $mn = $item('mn')
                    item.mn = {
                        res: $mn.attr('res'),
                        fps: $mn.attr('fps'),
                        QoI: $mn.attr('QoI'),
                        audio: $mn.attr('audio'),
                        type: $mn.attr('type'),
                        bitType: $mn.attr('bitType'),
                        level: $mn.attr('level'),
                    }

                    const $me = $item('me')
                    item.me = {
                        res: $me.attr('res'),
                        fps: $me.attr('fps'),
                        QoI: $me.attr('QoI'),
                        audio: $me.attr('audio'),
                        type: $me.attr('type'),
                        bitType: $me.attr('bitType'),
                        level: $me.attr('level'),
                    }

                    item.streamType = 'main'
                    // 获取码率类型
                    $item('mainStreamQualityCaps/item').forEach((element) => {
                        item.mainStreamQualityCaps.push({
                            enct: element.attr('enct'),
                            res: element.attr('res'),
                            digitalDefault: element.attr('digitalDefault'),
                            analogDefault: element.attr('analogDefault'),
                            value: element.text() ? element.text().split(',') : [],
                        })
                        if (element.attr('enct') === 'h264' && element.attr('res') === '0x0' && pageData.value.videoQualityListFlag === 0) {
                            element
                                .text()
                                .split(',')
                                .forEach((ele) => {
                                    pageData.value.maxQoI = Math.max(Number(ele), pageData.value.maxQoI)
                                    if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(ele) <= 6144) {
                                        //为长线模式时，过滤掉6M以上的码率
                                        pageData.value.videoQualityList.push({ value: ele, label: ele + 'Kbps' })
                                    } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === '100') {
                                        pageData.value.videoQualityList.push({ value: ele, label: ele + 'Kbps' })
                                    }
                                })
                            pageData.value.videoQualityListFlag++
                        }
                    })
                    const levelNote = $item('levelNote').text() ? $item('levelNote').text().split(',') : []
                    item.levelNote = levelNote.reverse().map((item) => {
                        return {
                            value: item,
                            label: Translate(imageLevelMapping[item]),
                        }
                    })
                    if (!pageData.value.levelList.length) {
                        pageData.value.levelList = [...item.levelNote]
                    }

                    //遍历item['mainCaps']['supEnct']，获取编码类型并集
                    item.mainCaps.supEnct.forEach((element) => {
                        if (!pageData.value.videoEncodeTypeUnionList.some((find) => find.value === element.value)) {
                            pageData.value.videoEncodeTypeUnionList.push(element)
                        }
                    })

                    item.mainCaps.bitType.forEach((element) => {
                        if (!pageData.value.bitTypeUnionList.includes(element)) {
                            pageData.value.bitTypeUnionList.push(element)
                        }
                    })

                    if (props.mode === 'event') {
                        if (RecStreamModule.value.recType === 'ae') {
                            item.GOP = item.main.aGOP ? Number(item.main.aGOP) : undefined
                            item.resolution = item.ae.res
                            item.frameRate = item.ae.fps
                            item.bitType = item.ae.bitType
                            item.level = item.ae.level
                            item.videoQuality = item.ae.QoI
                            item.audio = item.ae.audio
                            item.recordStream = item.ae.type
                        } else if (RecStreamModule.value.recType === 'me') {
                            item.GOP = item.main.mGOP ? Number(item.main.mGOP) : undefined
                            item.resolution = item.me.res
                            item.frameRate = item.me.fps
                            item.frameRate = item.me.fps
                            item.bitType = item.me.bitType
                            item.level = item.me.level ? item.me.level : Translate('IDCS_LOWEST')
                            item.videoQuality = item.me.QoI
                            item.audio = item.me.audio
                            item.recordStream = item.me.type
                        }
                    } else if (props.mode === 'timing') {
                        if (RecStreamModule.value.recType === 'an') {
                            item.GOP = item.main.aGOP ? Number(item.main.aGOP) : undefined
                            item.resolution = item.an.res
                            item.frameRate = item.an.fps
                            item.bitType = item.an.bitType
                            item.level = item.an.level
                            item.videoQuality = item.an.QoI
                            item.audio = item.an.audio
                            item.recordStream = item.an.type
                        } else if (RecStreamModule.value.recType === 'mn') {
                            item.GOP = item.main.mGOP ? Number(item.main.mGOP) : undefined
                            item.resolution = item.mn.res
                            item.frameRate = item.mn.fps
                            item.frameRate = item.mn.fps
                            item.bitType = item.mn.bitType
                            item.level = item.mn.level ? item.mn.level : Translate('IDCS_LOWEST')
                            item.videoQuality = item.mn.QoI
                            item.audio = item.mn.audio
                            item.recordStream = item.mn.type
                        }
                    }

                    if (!item.frameRate && item.mainCaps.res.length) {
                        item.frameRate = item.mainCaps.res[0].fps
                    }

                    if (item.mainCaps.res.length > 1) {
                        item.mainCaps.res.sort((a, b) => resolutionSort(a, b))
                    }

                    item.bitRange =
                        item.bitType === 'CBR' || item.bitType === ''
                            ? null
                            : getBitrateRange({
                                  resolution: item.resolution,
                                  level: item.level,
                                  fps: item.frameRate,
                                  maxQoI: pageData.value.maxQoI,
                                  videoEncodeType: item.videoEncodeType,
                              })

                    item.supportAudio = true
                    if (pageData.value.audioInNum > 0) {
                        pageData.value.chls.forEach((chl) => {
                            if (chl.id === item.id && chl.chlIndex && Number(chl.chlIndex) >= pageData.value.audioInNum) {
                                item.supportAudio = false
                                return false
                            }
                        })
                    }
                    item.resolutions = getResolutionSingleList(item)
                    item.frameRates = getFrameRateSingleList(item)

                    tableData.value.push(item)
                })
                pageData.value.frameRateList = getFrameRateList(tableData.value)
                // 排序 NT-9768
                pageData.value.videoEncodeTypeUnionList.sort((a, b) => {
                    return a.value.charCodeAt(0) - b.value.charCodeAt(0)
                })

                pageData.value.bitTypeUnionList.map((element) => {
                    return {
                        value: element,
                        text: element,
                    }
                })
                doCfg(tableData.value)
                pageData.value.resolutionGroups = getResolutionGroups(tableData.value)
                if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                    pageData.value.PredictVisible = true
                    pageData.value.CalculateVisible = true
                    getRemainRecTime()
                }
                pageData.value.levelDropDisable = pageData.value.isAllCBR
                pageData.value.firstInit = false

                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        editRows.listen(item)
                    }
                })
            }
        }

        // 查询和显示当前录制状态下剩余的录制时间
        const getRemainRecTime = () => {
            let recType = ''
            if (props.mode === 'event') {
                recType = RecStreamModule.value.recType === 'ae' ? 'auto' : 'manually'
            } else if (props.mode === 'timing') {
                recType = RecStreamModule.value.recType === 'an' ? 'auto' : 'manually'
            }
            const sendXml = rawXml`
                <content>  
                    <recMode type='recModeType'>${recType}</recMode> 
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
            openLoading()
            queryRemainRecTime(sendXml).then((result) => {
                closeLoading()
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    pageData.value.recTime = ''
                    const item = $('content/item')
                    if (item.length >= 2) {
                        const recTimeArray: string[] = []
                        item.forEach((ele) => {
                            const elexml = queryXml(ele.element)
                            const remainRecTime = elexml('remainRecTime').text().num()
                            const recTime =
                                remainRecTime === 0 && RecStreamModule.value.loopRecSwitch
                                    ? Translate('IDCS_CYCLE_RECORD')
                                    : remainRecTime <= 1
                                      ? remainRecTime < 0
                                          ? 0 + ' ' + Translate('IDCS_DAY_TIME')
                                          : remainRecTime + ' ' + Translate('IDCS_DAY_TIME')
                                      : remainRecTime + ' ' + Translate('IDCS_DAY_TIMES')
                            const diskGroupIndex = '(' + Translate('IDCS_REEL_GROUP') + elexml('diskGroupIndex').text() + ')'
                            recTimeArray.push('' + recTime + diskGroupIndex + '')
                        })
                        pageData.value.recTime = recTimeArray.join(';')
                    } else if (!item.length) {
                        pageData.value.PredictVisible = false
                        pageData.value.CalculateVisible = false
                    } else {
                        const remainRecTime = Number($('content/item/remainRecTime').text())
                        const recTime =
                            remainRecTime === 0 && RecStreamModule.value.loopRecSwitch
                                ? Translate('IDCS_CYCLE_RECORD')
                                : remainRecTime <= 1
                                  ? remainRecTime < 0
                                      ? 0 + ' ' + Translate('IDCS_DAY_TIME')
                                      : remainRecTime + ' ' + Translate('IDCS_DAY_TIME')
                                  : remainRecTime + ' ' + Translate('IDCS_DAY_TIMES')
                        pageData.value.recTime = Translate('IDCS_PREDICT_RECORD_TIME') + '' + recTime + ''
                    }
                }
                ctx.emit('recTime', pageData.value.recTime)
            })
        }

        // 获取所有数据
        const fetchData = async () => {
            await getDevRecParamCfgModule()
            await getSystemCaps()
            await getChlListData()
            await getNetCfgModule()
            getData()
        }

        // 设置videoQuality
        const setQuality = (rowData: RecordStreamInfoDto) => {
            rowData.mainStreamQualityCaps.forEach((element) => {
                if (rowData.resolution === element.res && rowData.videoEncodeType === element.enct) {
                    if (rowData.chlType === 'digital') {
                        if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(element.digitalDefault) > 6144) {
                            rowData.videoQuality = '6144'
                        } else {
                            rowData.videoQuality = element.digitalDefault
                        }
                    } else {
                        if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(element.analogDefault) > 6144) {
                            rowData.videoQuality = '6144'
                        } else {
                            rowData.videoQuality = element.analogDefault
                        }
                    }
                }
            })
        }

        // 根据参数变化生成码率范围
        const setBitRange = (rowData: RecordStreamInfoDto) => {
            if (rowData.bitType !== 'CBR' && rowData.bitType) {
                rowData.bitRange = getBitrateRange({
                    resolution: rowData.resolution,
                    level: rowData.level,
                    fps: rowData.frameRate,
                    maxQoI: pageData.value.maxQoI,
                    videoEncodeType: rowData.videoEncodeType,
                })
            } else {
                rowData.bitRange = null
            }
        }

        // 对单个视频编码进行处理
        const handleVideoEncodeTypeChange = (rowData: RecordStreamInfoDto) => {
            const isDisabled = videoEncodeTypeArr.includes(rowData.videoEncodeType)
            rowData.bitTypeDisable = isDisabled
            rowData.videoQualityDisable = isDisabled
            rowData.GOPDisable = isDisabled
            if (!isDisabled) {
                genQualityList(rowData)
                if (rowData.bitType === 'CBR') {
                    setQuality(rowData)
                }
            }
            setBitRange(rowData)
        }

        // 设置整列的视频编码
        const handleVideoEncodeTypeChangeAll = (videoEncodeType: string) => {
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && rowData.mainCaps.supEnct.some((find) => find.value === videoEncodeType) && !rowData.disabled && !rowData.videoEncodeTypeDisable) {
                    rowData.videoEncodeType = videoEncodeType
                    handleVideoEncodeTypeChange(rowData)
                    setBitRange(rowData)
                }
            })
        }

        // 对单个分辨率进行处理
        const handleResolutionChange = (rowData: RecordStreamInfoDto) => {
            rowData.mainCaps.res.forEach((element) => {
                if (element.value === rowData.resolution) {
                    let frameRate = Number(rowData.frameRate)
                    if (frameRate > Number(element.fps)) {
                        frameRate = Number(element.fps)
                    }

                    if (pageData.value.maxFpsMap[rowData.id] !== Number(element.fps)) {
                        //更新ui
                        updateFrameRates(rowData, Number(element.fps), rowData.id, rowData.frameRate)
                        updateHeaderFrameRates()
                    }
                }
            })
            genQualityList(rowData)
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
            setBitRange(rowData)
        }

        // 设置整列的分辨率
        const handleSetResolutionAll = () => {
            pageData.value.resolutionGroups.forEach((rowData) => {
                const resolution = rowData.res
                const ids = rowData.chls.data.map((element) => {
                    return element.value
                })
                const changeRows: RecordStreamInfoDto[] = []
                // 获取tableData中的被修改的数据,设置编辑状态，更新数据
                tableData.value.forEach((element) => {
                    if (element.chlType !== 'recorder' && !element.disabled && !element.resolutionDisable) {
                        if (ids.includes(element.id)) {
                            changeRows.push(element)
                            element.resolution = resolution
                            setBitRange(element)
                        }
                    }
                })
                // 修正帧率上限
                changeRows[0].mainCaps.res.forEach((element) => {
                    if (element.value === resolution) {
                        const frameRate = Number(element.fps)
                        changeRows.forEach((element) => {
                            let currentFrameRate = Number(element.frameRate)
                            if (currentFrameRate > frameRate) {
                                currentFrameRate = frameRate
                            }

                            if (pageData.value.maxFpsMap[element.id] !== frameRate) {
                                //更新ui
                                updateFrameRates(element, frameRate, element.id, currentFrameRate.toString())
                                updateHeaderFrameRates()
                            }
                        })
                        return false
                    }
                })
                // 生成码率范围
                changeRows.forEach((element) => {
                    genQualityList(element)
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

        // 取消分辨率下拉框表头
        const handleSetResolutionCancel = () => {
            pageData.value.resolutionHeaderVisble = false
        }

        // 展开或者收起分辨率下拉框的方法
        const handleExpandChange = (row: { res: string; resGroup: SelectOption<string, string>[]; chls: { expand: boolean; data: { value: string; text: string }[] } }, expandedRows: string[]) => {
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

        // 获取分辨率下拉框的key
        const getRowKey = (row: { res: string; resGroup: SelectOption<string, string>[]; chls: { expand: boolean; data: { value: string; text: string }[] } }) => {
            return row.chls.data[0].value
        }

        // 设置单个设备的帧率
        const handleFrameRateChange = (rowData: RecordStreamInfoDto) => {
            setBitRange(rowData)
        }

        // 设置整列的帧率
        const handleFrameRateChangeAll = (frameRate: string) => {
            tableData.value.forEach((rowData) => {
                let currentFrameRate = frameRate
                if (!rowData.disabled) {
                    if (Number(frameRate) > pageData.value.maxFpsMap[rowData.id]) {
                        currentFrameRate = pageData.value.maxFpsMap[rowData.id].toString()
                    }
                    rowData.frameRate = currentFrameRate
                    setBitRange(rowData)
                }
            })
        }

        // 对单个码率类型进行处理
        const handleBitTypeChange = (rowData: RecordStreamInfoDto) => {
            const isCBR = rowData.bitType === 'CBR'
            rowData.imageLevelDisable = isCBR
            if (isCBR) {
                setQuality(rowData)
            }
            let isAllCBR = true
            tableData.value.forEach((item) => {
                isAllCBR = isAllCBR && (item.disabled || item.bitType === 'CBR')
            })
            pageData.value.levelDropDisable = isAllCBR
            setBitRange(rowData)
        }

        // 设置整列的bitType
        const handleBitTypeChangeAll = (bitType: string) => {
            const isCBR = bitType === 'CBR'
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && !rowData.disabled && rowData.mainCaps.bitType.includes(bitType) && rowData.bitType.length !== 0 && !rowData.bitTypeDisable) {
                    rowData.bitType = bitType
                    rowData.imageLevelDisable = isCBR
                    if (isCBR) {
                        setQuality(rowData)
                    }
                    setBitRange(rowData)
                }
            })
            pageData.value.levelDropDisable = isCBR
        }

        // 设置单个设备的图像质量
        const handleLevelChange = (rowData: RecordStreamInfoDto) => {
            setBitRange(rowData)
        }

        // 设置整列的level
        const handleLevelChangeAll = (level: string) => {
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && !rowData.disabled && rowData.bitType !== 'CBR' && rowData.bitType && !rowData.imageLevelDisable) {
                    rowData.level = level
                    setBitRange(rowData)
                }
            })
        }

        // 设置整列的videoQuality
        const handleVideoQualityChangeAll = (videoQuality: { value: string; label: string }) => {
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && !rowData.disabled && !rowData.videoQualityDisable) {
                    rowData.qualitys.forEach((element) => {
                        if (element.value === videoQuality.value) {
                            rowData.videoQuality = videoQuality.value
                        }
                    })
                }
            })
        }

        // 设置整列的audio
        const handleAudioOptionsChangeAll = (audio: SelectOption<string, string>) => {
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && rowData.supportAudio && !rowData.disabled && !rowData.audioDisable) {
                    rowData.audio = audio.value
                }
            })
        }

        // 设置整列的GOP
        const handleSetGopAll = (gop: number | undefined) => {
            tableData.value.forEach((rowData) => {
                if (!rowData.disabled && typeof rowData.GOP === 'number' && !rowData.GOPDisable) {
                    rowData.GOP = gop
                }
            })
            pageData.value.gopHeaderVisble = false
        }

        // 取消设置整列的GOP
        const handleGopCancel = () => {
            pageData.value.gopSetAll = 0
            pageData.value.gopHeaderVisble = false
        }

        // 设置整列的recordStream
        const handleRecordStreamChangeAll = (recordStream: string) => {
            tableData.value.forEach((rowData) => {
                if (rowData.chlType !== 'recorder' && !rowData.disabled && !rowData.recordStreamDisable) {
                    rowData.recordStream = recordStream
                }
            })
        }

        // 进行整体禁用设置及一些操作
        const doCfg = (tableData: RecordStreamInfoDto[]) => {
            tableData.forEach((rowData) => {
                if (videoEncodeTypeArr.includes(rowData.videoEncodeType)) {
                    rowData.bitTypeDisable = true
                    rowData.videoQualityDisable = true
                    rowData.GOPDisable = true
                }

                if (rowData.chlType === 'recorder' || !rowData.mainCaps.res.length) {
                    rowData.disabled = true
                    rowData.videoEncodeTypeDisable = true
                    rowData.resolutionDisable = true
                    rowData.frameRateDisable = true
                    rowData.bitTypeDisable = true
                    rowData.imageLevelDisable = true
                    rowData.videoQualityDisable = true
                    rowData.bitRangeDisable = true
                    rowData.audioDisable = true
                    rowData.GOPDisable = true
                } else {
                    rowData.disabled = false
                }

                if (!rowData.audio) {
                    rowData.audioDisable = true
                } else {
                    rowData.audioDisable = false
                }

                if (!rowData.bitType) {
                    rowData.bitTypeVisible = false
                }

                if (rowData.bitType === 'CBR' || rowData.bitType === '') {
                    rowData.imageLevelDisable = true
                }

                if (typeof rowData.GOP !== 'number') {
                    rowData.GOPDisable = true
                }
                pageData.value.isAllCBR = pageData.value.isAllCBR && rowData.bitType === 'CBR'
                rowData.mainStreamQualityCaps.sort((item1, item2) => {
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
                genQualityList(rowData)
            })
        }

        // 对码流类型显示进行处理
        const formatDisplayStreamType = (rowData: RecordStreamInfoDto) => {
            const value = rowData.streamType
            return Translate(streamTypeMapping[value])
        }

        // 对码率上限推荐范围显示进行处理
        const formatDisplayBitRange = (rowData: RecordStreamInfoDto) => {
            if (rowData.bitRange) {
                return rowData.bitRange.min + ' ~ ' + rowData.bitRange.max + 'Kbps'
            } else {
                return '- -'
            }
        }

        // 获取全局可选取的帧率范围
        const getFrameRateList = (tableData: RecordStreamInfoDto[]): SelectOption<string, string>[] => {
            let maxFrameRate: number = 0
            tableData.forEach((element) => {
                element.mainCaps.res.forEach((obj) => {
                    if (element.resolution === obj.value && maxFrameRate < Number(obj.fps)) {
                        maxFrameRate = Number(obj.fps)
                    }
                })
            })
            if (maxFrameRate === 0) return []
            const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
            for (let i = minFrameRate; i <= maxFrameRate; i++) {
                pageData.value.frameRateList.push({
                    value: i + '',
                    label: i + '',
                })
            }
            return pageData.value.frameRateList.reverse()
        }

        // 获取单个设备的帧率范围
        const getFrameRateSingleList = (rowData: RecordStreamInfoDto): SelectOption<string, string>[] => {
            const frameRates: SelectOption<string, string>[] = []
            rowData.mainCaps.res.forEach((obj) => {
                if (obj.value === rowData.resolution) {
                    const maxFrameRate = Number(obj.fps)
                    pageData.value.maxFpsMap[rowData.id] = maxFrameRate
                    const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
                    for (let i = minFrameRate; i <= maxFrameRate; i++) {
                        frameRates.push({
                            value: i + '',
                            label: i + '',
                        })
                    }
                }
            })
            return frameRates.reverse()
        }

        // 获取单个设备的分辨率范围
        const getResolutionSingleList = (rowData: RecordStreamInfoDto): SelectOption<string, string>[] => {
            return rowData.mainCaps.res.map((obj) => {
                return {
                    value: obj.value,
                    label: obj.value,
                }
            })
        }

        // 获取整体的分辨率下拉框数据
        const getResolutionGroups = (tableData: RecordStreamInfoDto[]): ResolutionGroupReturnsType[] => {
            // 生成数据
            const rowDatas = tableData.filter((item) => {
                return item.chlType !== 'recorder' && !item.disabled
            })
            const resolutionMapping: Record<string, SelectOption<string, string>[]> = {}
            const resolutionGroups: ResolutionGroupReturnsType[] = []
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

        // 根据其他参数变化生成码率范围
        const genQualityList = (rowData: RecordStreamInfoDto) => {
            // rtsp通道只有声音节点，没有其他
            if (rowData.mainStreamQualityCaps.length) {
                let isQualityCapsMatch = false
                let isQualityCapsEmpty = true
                rowData.qualitys = []
                rowData.mainStreamQualityCaps.forEach((element) => {
                    if (element.enct === rowData.videoEncodeType && element.res === rowData.resolution) {
                        if (element.value[0]) {
                            isQualityCapsEmpty = false
                            const tmp = element.value
                            tmp.forEach((element) => {
                                if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(element) <= 6144) {
                                    rowData.qualitys.push({
                                        value: element,
                                        label: element + 'Kbps',
                                    })
                                } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === '100') {
                                    rowData.qualitys.push({
                                        value: element,
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
                                    if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(element) <= 6144) {
                                        rowData.qualitys.push({ value: element, label: element + 'Kbps' })
                                    } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === '100') {
                                        rowData.qualitys.push({ value: element, label: element + 'Kbps' })
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
                                if (pageData.value.poeModeNode && pageData.value.poeModeNode === '10' && Number(element) <= 6144) {
                                    rowData.qualitys.push({
                                        value: element,
                                        label: element + 'Kbps',
                                    })
                                } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode === '100') {
                                    rowData.qualitys.push({
                                        value: element,
                                        label: element + 'Kbps',
                                    })
                                }
                            })
                        }
                    })
                }
            }
        }

        const getBitrateRange = (options: { resolution: string; level: string; fps: string; maxQoI: number; videoEncodeType: string }) => {
            // 计算分辨率对应参数
            let resolution: string | number = options.resolution
            const videoEncodeType = options.videoEncodeType
            if (typeof resolution === 'string') {
                const resParts = resolution.split('x').map((res) => Number(res))
                const resolutionObj = {
                    width: resParts[0],
                    height: resParts[1],
                }
                resolution = resolutionObj.width * resolutionObj.height
            }

            if (!resolution) {
                return null
            }
            let resParam = Math.floor(resolution / (resolution >= 1920 * 1080 ? 200000 : 150000))
            if (!resParam) {
                resParam = 0.5
            }

            // 计算图像质量对应参数
            const levelParamMapping = {
                highest: 100,
                higher: 67,
                medium: 50,
                lower: 34,
                lowest: 25,
            }
            const levelParam = levelParamMapping[options.level as keyof typeof levelParamMapping]
            if (!levelParam) {
                return null
            }
            // 根据帧率使用不同公式计算下限和上限
            const fps = Number(options.fps)
            const minBase = (768 * resParam * levelParam * (fps >= 10 ? fps : 10)) / 3000
            let min = minBase - (fps >= 10 ? 0 : ((10 - fps) * minBase * 2) / 27)
            const maxBase = (1280 * resParam * levelParam * (fps >= 10 ? fps : 10)) / 3000
            let max = maxBase - (fps >= 10 ? 0 : ((10 - fps) * maxBase * 2) / 27)
            min = options.maxQoI ? (options.maxQoI < min ? options.maxQoI : min) : min
            max = videoEncodeType === 'h265' ? Math.floor(max * 0.55) : Math.floor(max)
            if (videoEncodeType === 'h265' || videoEncodeType === 'h265p' || videoEncodeType === 'h265s') {
                min = Math.floor(min * 0.55)
            } else {
                min = Math.floor(min)
            }

            if (!min || !max) {
                return null
            }

            return { min, max }
        }

        //分辨率选项根据大小排序
        const resolutionSort = (a: { fps: string; value: string }, b: { fps: string; value: string }) => {
            const a1: number = Number(a.value.split('x')[0])
            const b1: number = Number(b.value.split('x')[0])
            return b1 - a1
        }

        // 更新单个设备的可选帧率
        const updateFrameRates = (rowData: RecordStreamInfoDto, maxFrameRate: number, chlId: string, frameRate: string) => {
            const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
            const tmp: SelectOption<string, string>[] = []
            for (let i = maxFrameRate; i >= minFrameRate; i--) {
                tmp.push({
                    value: i + '',
                    label: i + '',
                })
            }
            rowData.frameRates = tmp
            rowData.frameRate = frameRate
            pageData.value.maxFpsMap[chlId] = maxFrameRate
        }

        // 更新表头可选帧率
        const updateHeaderFrameRates = () => {
            const frameRateList = []
            let maxFrameRate = 0
            for (const attr in pageData.value.maxFpsMap) {
                if (pageData.value.maxFpsMap[attr] > maxFrameRate) {
                    maxFrameRate = pageData.value.maxFpsMap[attr]
                }
            }
            const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
            for (let i = minFrameRate; i <= maxFrameRate; i++) {
                frameRateList.push({
                    value: i + '',
                    label: i + '',
                })
            }
            pageData.value.frameRateList = frameRateList.reverse()
        }

        // 计算
        const handleCalculate = () => {
            getRemainRecTime()
        }

        // 编辑请求数据
        const getSaveData = () => {
            const editRowDatas = editRows.toArray()

            let sendXml = rawXml`
                <content type='list' total='${editRowDatas.length}'>
                    ${editRowDatas
                        .map((element) => {
                            let gop = ''
                            if (props.mode === 'event') {
                                gop = RecStreamModule.value.recType === 'ae' ? 'aGOP' : 'mGOP'
                            } else if (props.mode === 'timing') {
                                gop = RecStreamModule.value.recType === 'an' ? 'aGOP' : 'mGOP'
                            }
                            const bitType = element.bitType || 'CBR'

                            let mainXml = ''
                            if (typeof element.GOP !== 'number') {
                                if (props.mode === 'event') {
                                    if (RecStreamModule.value.recType1 === 'an') {
                                        const min = Number(element.frameRate) > Number(element.an.fps) ? Number(element.frameRate) * 4 : Number(element.an.fps) * 4
                                        mainXml = `<main enct="${element.videoEncodeType}" ${gop}="${min}"></main>`
                                    } else if (RecStreamModule.value.recType1 === 'mn') {
                                        const min = Number(element.frameRate) > Number(element.mn.fps) ? Number(element.frameRate) * 4 : Number(element.mn.fps) * 4
                                        mainXml = `<main enct="${element.videoEncodeType}" ${gop}="${min}"></main>`
                                    }
                                } else if (props.mode === 'timing') {
                                    if (RecStreamModule.value.recType1 === 'ae') {
                                        const min = Number(element.frameRate) > Number(element.ae.fps) ? Number(element.frameRate) * 4 : Number(element.ae.fps) * 4
                                        mainXml = `<main enct="${element.videoEncodeType}" ${gop}="${min}"></main>`
                                    } else if (RecStreamModule.value.recType1 === 'me') {
                                        const min = Number(element.frameRate) > Number(element.me.fps) ? Number(element.frameRate) * 4 : Number(element.me.fps) * 4
                                        mainXml = `<main enct="${element.videoEncodeType}" ${gop}="${min}"></main>`
                                    }
                                }
                            } else {
                                sendXml += rawXml`<main enct="${element.videoEncodeType}" ${gop}="${element.GOP}" ></main>`
                            }

                            return rawXml`
                                <item id="${element.id}">
                                    <${RecStreamModule.value.recType}  res="${element.resolution}" fps="${element.frameRate}" QoI="${element.videoQuality}" audio="${element.audio}" type="${element.recordStream}" bitType="${bitType}" level="${element.level}"></${RecStreamModule.value.recType}>
                                    ${mainXml}
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            return sendXml
        }

        const setData = () => {
            const sendXml = getSaveData()
            if (sendXml === '') {
                return
            }
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
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'),
                            })
                        } else {
                            openMessageBox({
                                type: 'info',
                                message: Translate('IDCS_SAVE_DATA_FAIL'),
                            })
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
        const handleResolutionVisibleChange = () => {
            setTimeout(() => {
                pageData.value.resolutionHeaderVisble = true
            }, 0)
        }

        ctx.expose({
            getRemainRecTime,
            setData,
        })

        onMounted(() => {
            fetchData()
        })

        watch([() => props.mode, () => props.initkey], () => {
            if (!pageData.value.firstInit) {
                fetchData()
            }
        })

        return {
            recordStreams,
            tableData,
            virtualTableData,
            editRows,
            pageData,
            streamTypeMapping,
            resolutionTableRef,
            handleVideoEncodeTypeChange,
            handleVideoEncodeTypeChangeAll,
            handleResolutionChange,
            handleSetResolutionAll,
            handleSetResolutionCancel,
            handleExpandChange,
            getRowKey,
            handleFrameRateChange,
            handleFrameRateChangeAll,
            handleBitTypeChange,
            handleBitTypeChangeAll,
            handleLevelChange,
            handleLevelChangeAll,
            handleVideoQualityChangeAll,
            handleAudioOptionsChangeAll,
            handleSetGopAll,
            handleGopCancel,
            handleRecordStreamChangeAll,
            formatDisplayStreamType,
            formatDisplayBitRange,
            handleCalculate,
            setData,
            arrayToOptions,
            handleResolutionVisibleChange,
        }
    },
})
