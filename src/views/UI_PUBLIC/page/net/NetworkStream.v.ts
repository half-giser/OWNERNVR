/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 18:17:14
 * @Description: 网络码流设置
 */
import { type NetSubStreamList, type NetSubStreamResolutionList } from '@/types/apiType/net'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        // 主码流帧率限制
        const MAIN_STREAM_LIMIT_FPS = 1

        const pageData = ref({
            // 支持的音频数量
            audioInNum: -1,
            // 最大码率
            maxQoI: 0,
            // 码率选项
            videoQualityList: [] as SelectOption<number, string>[],
            // 图像质量选项
            levelList: [] as SelectOption<string, string>[],
            // 视频编码类型选项
            videoEcodeTypeList: [] as SelectOption<string, string>[],
            // 码流类型选项
            bitTypeList: [] as string[],
            // 最大帧率
            maxFps: MAIN_STREAM_LIMIT_FPS,
            // 是否显示GOP弹窗
            isGOPPop: false,
            // GOP弹窗输入值
            GOP: 1,
            // 是否显示分辨率弹窗
            isResolutionPop: false,
            // 分辨率选项
            resolutionList: [] as NetSubStreamResolutionList[],
        })

        const tableData = ref<NetSubStreamList[]>([])
        const editRows = useWatchEditRows<NetSubStreamList>()
        const virtualTableData = computed<number[]>(() => {
            return [...Array(tableData.value.length).keys()]
        })

        /**
         * @description 显示码流文本
         * @param {String} key
         * @returns {String}
         */
        const displayStreamType = (key: string) => {
            return Translate(DEFAULT_STREAM_TYPE_MAPPING[key])
        }

        /**
         * @description 更改码流类型
         * @param {Number} index
         */
        const changeStreamType = (index: number) => {
            const item = tableData.value[index]

            if (!item.subCaps.supEnct.some((find) => find.value === item.videoEncodeType)) {
                return
            }
            setDefaultVideoQuality(item)
        }

        /**
         * @description 更改所有项的码流类型
         * @param {String} key
         */
        const changeAllStreamType = (key: string) => {
            tableData.value.forEach(async (item) => {
                if (item.disabled || !item.subCaps.supEnct.some((find) => find.value === key)) {
                    return
                }
                item.videoEncodeType = key
                setDefaultVideoQuality(item)
            })
        }

        /**
         * @description 更改所有项分辨率
         */
        const changeAllResolution = () => {
            pageData.value.isResolutionPop = false
            pageData.value.resolutionList.forEach((item) => {
                item.chlsList.forEach((chl) => {
                    tableData.value[chl.chlIndex].resolution = item.value
                })
            })
        }

        /**
         * @description 更改分辨率
         * @param {Number} index
         */
        const changeResolution = async (index: number) => {
            const item = tableData.value[index]
            const find = item.subCaps.res.find((res) => res.value === item.resolution)
            if (find) {
                if (item.frameRate > find.fps) {
                    item.frameRate = find.fps
                }
            }
            setDefaultVideoQuality(item)
        }

        /**
         * @description 分辨率弹窗分辨率选项发生变化时，阻止分辨率弹窗消失
         */
        const handleResolutionVisibleChange = () => {
            setTimeout(() => {
                pageData.value.isResolutionPop = true
            }, 0)
        }

        /**
         * @description 获取最大帧率
         * @param {Number} index
         */
        const getMaxFps = (index: number) => {
            const item = tableData.value[index]
            const find = item.subCaps.res.find((res) => res.value === item.resolution)
            if (find) {
                const maxFps: number[] = []
                for (let i = Math.max(find.fps, MAIN_STREAM_LIMIT_FPS); i >= MAIN_STREAM_LIMIT_FPS; i--) {
                    maxFps.push(i)
                }
                return maxFps
            }
            return []
        }

        const getFpsOptions = (index: number) => {
            const maxFps = getMaxFps(index)
            return arrayToOptions(maxFps)
        }

        /**
         * @description 更改所有帧率
         * @param {Number} fps
         */
        const changeAllFps = (fps: number) => {
            tableData.value.map((item, index) => {
                const maxFpsArray = getMaxFps(index)
                if (maxFpsArray.length) {
                    const maxFps = maxFpsArray[0]
                    if (fps <= maxFps) {
                        item.frameRate = fps
                    } else {
                        item.frameRate = maxFpsArray[0]
                    }
                }
            })
        }

        // 分析代码后发现 本页面并没有用到此接口的数据
        // const getChannelList = async () => {
        //     const result = await getChlList({})
        //     commLoadResponseHandler(result, ($) => {
        //         pageData.value.chlList = $('content/item').map((item) => {
        //             const $item = queryXml(item.element)
        //             return {
        //                 id: item.attr('id'),
        //                 addType: $item('addType').text(),
        //                 chlType: $item('chlType').text(),
        //                 chlIndex: $item('chlIndex').text(),
        //                 name: $item('name').text(),
        //                 poeIndex: $item('poeIndex').text(),
        //                 productModel: $item('productModel').text(),
        //                 factoryName: $item('productModel').attr('factoryName'),
        //             }
        //         })
        //     })
        // }

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
         * @description 更改所有码率类型
         * @param {String} bitType
         */
        const changeAllBitType = (bitType: string) => {
            tableData.value.map((item, index) => {
                if (!isBitTypeDisabled(index) && item.bitType && item.subCaps.bitType.includes(bitType)) {
                    item.bitType = bitType
                    setDefaultVideoQuality(item)
                }
            })
        }

        /**
         * @description 更改码率类型
         * @param {String} index
         */
        const changeBitType = (index: number) => {
            setDefaultVideoQuality(tableData.value[index])
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
         * @description 更改所有图片质量
         * @param {String} level
         */
        const changeAllLevel = (level: string) => {
            tableData.value.forEach((item, index) => {
                if (!isLevelDisabled(index)) {
                    item.level = level
                }
            })
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
         * @description 设置默认码率
         * @param {Object} item
         */
        const setDefaultVideoQuality = (item: NetSubStreamList) => {
            if (item.bitType === 'CBR') {
                item.subStreamQualityCaps.forEach((cap) => {
                    if (item.resolution === cap.res && item.videoEncodeType === cap.enct) {
                        if (item.chlType === 'digital') {
                            item.videoQuality = cap.digitalDefault
                        } else if (item.chlType === 'analog') {
                            item.videoQuality = cap.analogDefault
                        }
                    }
                })
            }
        }

        /**
         * @description 更改所有码率类型
         * @param {Number} quality
         */
        const changeAllVideoQuality = (quality: number) => {
            tableData.value.forEach((item) => {
                if (item.chlType !== 'recorder' && item.videoQuality) {
                    item.videoQuality = quality
                }
            })
        }

        /**
         * @description 获取推荐码率范围
         * @param {Object} item
         * @returns {String}
         */
        const getBitRange = (item: NetSubStreamList) => {
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
         * @description 获取码率选项
         * @param {Number} index
         */
        const getVideoQualityOptions = (index: number) => {
            const qualityOptions = tableData.value[index].subStreamQualityCaps
            const enct = tableData.value[index].videoEncodeType
            const resolution = tableData.value[index].resolution
            let isQualityCapsMatch = false
            let isQualityCapsEmpty = true
            const options: SelectOption<number, string>[] = []
            qualityOptions.forEach((item) => {
                if (item.enct === enct && item.res === resolution) {
                    if (item.value.length) {
                        isQualityCapsEmpty = false
                        item.value.forEach((quality) => {
                            options.push({
                                label: quality + 'Kbps',
                                value: Number(quality),
                            })
                        })
                    }
                    isQualityCapsMatch = true
                }
            })

            // 没有完全匹配的项就找低于该值的最近的一项
            if (!isQualityCapsMatch) {
                const res = resolution.split('x')
                qualityOptions.forEach((item) => {
                    const curRes = item.res.split('x')
                    if (item.enct === enct && (Number(curRes[0]) < Number(res[0]) || (curRes[0] === res[0] && Number(curRes[1]) < Number(res[1])))) {
                        if (item.value.length) {
                            isQualityCapsEmpty = false
                            item.value.forEach((quality) => {
                                options.push({
                                    label: quality + 'Kbps',
                                    value: Number(quality),
                                })
                            })
                        }
                    }
                })
            }

            // 对应项如果码率列表为空，则取所有支持的码率列表
            if (isQualityCapsEmpty) {
                qualityOptions.forEach((item) => {
                    if (item.enct === enct && item.res === '0x0') {
                        item.value.forEach((quality) => {
                            options.push({
                                label: quality + 'Kbps',
                                value: Number(quality),
                            })
                        })
                    }
                })
            }

            options.sort((a, b) => a.value - b.value)

            return options
        }

        /**
         * @description 是否禁用当前项GOP
         * @param {Number} index
         */
        const isGOPDisabled = (index: number) => {
            const item = tableData.value[index]
            return item.disabled || DEFAULT_VIDEO_ENCODE_TYPE_ARRAY.includes(item.videoEncodeType)
        }

        /**
         * @description 更改所有项GOP
         */
        const changeAllGOP = () => {
            tableData.value.forEach((item) => {
                if (item.disabled) {
                    return
                }
                item.GOP = pageData.value.GOP
            })
            pageData.value.isGOPPop = false
        }

        /**
         * @description 获取数据列表
         */
        const getData = async () => {
            editRows.clear()

            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <chlType/>
                    <subCaps/>
                    <sub/>
                    <subStreamQualityCaps/>
                    <levelNote/>
                </requireField>    
            `
            const result = await queryNetworkNodeEncodeInfo(sendXml)
            commLoadResponseHandler(result, ($) => {
                const resolutionMap: Record<string, NetSubStreamResolutionList> = {}

                tableData.value = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)

                    const chlId = item.attr('id')
                    const chlName = $item('name').text()

                    let frameRate = $item('sub').attr('fps').num()
                    const res = $item('subCaps/res')
                        .map((res) => ({
                            fps: res.attr('fps').num(),
                            value: res.text(),
                            label: res.text(),
                        }))
                        .toSorted((a, b) => {
                            const na = Number(a.value.split('x')[0])
                            const nb = Number(b.value.split('x')[0])
                            return nb - na
                        })
                    if (!frameRate && res.length) {
                        frameRate = res[0].fps
                    }

                    if (res.length) {
                        const chlItem = {
                            chlId,
                            chlName,
                            chlIndex: index,
                        }
                        const resolutionKey = res.map((key) => key.value).join(',')
                        if (resolutionMap[resolutionKey]) {
                            resolutionMap[resolutionKey].chlsList.push(chlItem)
                        } else {
                            resolutionMap[resolutionKey] = {
                                key: resolutionKey,
                                value: res[0].value,
                                resolution: res,
                                chlsList: [chlItem],
                            }
                        }
                    }

                    if (!pageData.value.levelList.length) {
                        pageData.value.levelList = $item('levelNote')
                            .text()
                            .array()
                            .reverse()
                            .map((element) => {
                                return {
                                    value: element,
                                    label: Translate(DEFAULT_IMAGE_LEVEL_MAPPING[element]),
                                }
                            })
                    }

                    const supEnct = $item('subCaps')
                        .attr('supEnct')
                        .array()
                        .sort()
                        .map((item) => {
                            return {
                                value: item,
                                label: Translate(DEFAULT_STREAM_TYPE_MAPPING[item]),
                            }
                        })

                    pageData.value.videoEcodeTypeList.push(...supEnct)

                    const bitTypeList = $item('subCaps').attr('bitType').array()
                    pageData.value.bitTypeList.push(...bitTypeList)

                    const level = $item('sub').attr('level')

                    const bitType = $item('sub').attr('bitType')
                    const resolution = $item('sub').attr('res')
                    const videoEncodeType = $item('sub').attr('enct')

                    const chlType = $item('chlType').text()

                    return {
                        id: chlId,
                        name: chlName,
                        chlType,
                        subCaps: {
                            supEnct,
                            bitType: bitTypeList,
                            res: res,
                        },
                        subStreamQualityCaps: $item('subStreamQualityCaps/item').map((caps) => {
                            const enct = caps.attr('enct')
                            const res = caps.attr('res')
                            const value = caps.text().array().toReversed()
                            if (enct === 'h264' && res === '0x0' && !pageData.value.videoQualityList.length) {
                                pageData.value.videoQualityList = value
                                    .map((quality) => {
                                        return {
                                            label: quality + 'Kbps',
                                            value: Number(quality),
                                        }
                                    })
                                    .sort((a, b) => a.value - b.value)
                            }

                            return {
                                enct,
                                res,
                                digitalDefault: caps.attr('digitalDefault').num(),
                                analogDefault: caps.attr('analogDefault').num(),
                                value,
                            }
                        }),
                        videoEncodeType,
                        streamType: 'sub',
                        GOP: $item('sub').attr('GOP').num(),
                        resolution,
                        frameRate,
                        bitType,
                        level,
                        videoQuality: $item('sub').attr('QoI').num(),
                        disabled: chlType === 'recorder' || !resolution,
                        status: '',
                        statusTip: '',
                    }
                })

                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        editRows.listen(item)
                    }
                })

                pageData.value.maxQoI = Math.max.apply(
                    [],
                    pageData.value.videoQualityList.map((item) => item.value),
                )
                pageData.value.videoEcodeTypeList = Array.from(new Set(pageData.value.videoEcodeTypeList)).toSorted()
                pageData.value.bitTypeList = Array.from(new Set(pageData.value.bitTypeList))

                pageData.value.maxFps = Math.max(MAIN_STREAM_LIMIT_FPS, Math.max.apply([], tableData.value.map((item) => item.subCaps.res.map((item) => item.fps)).flat()))

                pageData.value.resolutionList = Object.values(resolutionMap)
            })
        }

        /**
         * @description 更改修改行的数据
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    ${editRows
                        .toArray()
                        .map((item) => {
                            const res = item.resolution
                            const fps = item.frameRate
                            const qoi = item.videoQuality ? item.videoQuality : ''
                            const bittype = item.bitType || 'CBR'
                            const level = item.level
                            const enct = item.videoEncodeType
                            const gop = item.GOP ? item.GOP : item.frameRate * 4
                            return rawXml`
                                <item id="${item.id}">
                                    <sub res="${res}" fps="${fps}" QoI="${qoi}" bitType="${bittype}" level="${level}" enct="${enct}" GOP="${gop}" />
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            const result = await editNetworkNodeEncodeInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                editRows.toArray().forEach((item) => {
                    editRows.remove(item)
                })
            } else {
                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_NOT_SUPPORTFUNC'))
            }
        }

        onMounted(async () => {
            openLoading()
            await getData()
            closeLoading()
        })

        return {
            pageData,
            tableData,
            virtualTableData,
            editRows,
            displayStreamType,
            changeStreamType,
            changeAllStreamType,
            changeResolution,
            changeAllResolution,
            getMaxFps,
            getFpsOptions,
            changeAllFps,
            isBitTypeDisabled,
            changeBitType,
            changeAllBitType,
            changeAllLevel,
            isLevelDisabled,
            isAllLevelDisabled,
            isVideoQualityDisabled,
            getVideoQualityOptions,
            changeAllVideoQuality,
            getBitRange,
            isGOPDisabled,
            setData,
            changeAllGOP,
            arrayToOptions,
            handleResolutionVisibleChange,
        }
    },
})
