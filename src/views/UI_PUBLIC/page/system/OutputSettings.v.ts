/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 09:59:23
 * @Description: 输出配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-21 14:19:31
 */
import { type XmlResult } from '@/utils/xmlParse'
import OutputSplitTemplate from './OutputSplitTemplate.vue'
import OutputAddViewPop, { type ChlsDto, type ChlGroupData } from './OutputAddViewPop.vue'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import ChannelGroupEditPop from '../channel/ChannelGroupEditPop.vue'
import ChannelGroupAddPop from '../channel/ChannelGroupAddPop.vue'
import { ChlGroup } from '@/types/apiType/channel'
import type { UserCheckAuthForm } from '@/types/apiType/user'

type ChlItem = {
    id: string
    value: string
    dwellTime?: number
}

interface DwellData {
    displayMode: string
    timeInterval: number
    isCheckDwell: boolean
    chlGroups: ChlGroupData[]
    mode: string // dwell | 'preview'
}

interface PreviewData {
    displayMode: string
    chlGroups: ChlGroupData[]
}

interface DecoderCardData {
    decoderDwellData: {
        [outIndex: number]: DwellData
    }
    decoderPreviewData: {
        [outIndex: number]: PreviewData
    }
    ShowHdmiIn: number // outIndex：0表示输出1、1表示输出2...
    onlineStatus: boolean
}

class MainOutputData {
    displayMode = ''
    timeInterval = 0
    chlGroups: ChlGroupData[] = []
}

interface SubOutputDwellData {
    [outIndex: number]: DwellData
}

interface SubOutputPreviewData {
    [outIndex: number]: PreviewData
}

interface DecoderCardMap {
    [id: number]: DecoderCardData
}
export default defineComponent({
    components: {
        BaseCheckAuthPop,
        OutputSplitTemplate,
        OutputAddViewPop,
        ChannelGroupEditPop,
        ChannelGroupAddPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        const cacheChlListOfGroup: Record<string, ChlItem[]> = {}
        // 通道ID和通道名的映射. 用于快速通过ID查询通道名
        const chlNameMaping: Record<string, string> = {}

        const dragTransferData = {
            type: 'single',
            id: '',
            title: '',
        }

        // 解码卡的数据
        const decoderCardMap = ref<DecoderCardMap>({})
        // 主输出的数据
        const mainOutputData = ref(new MainOutputData())
        // 副输出轮询数据
        const subOutputDwellData = ref<SubOutputDwellData>({})
        // 副输出预览数据
        const subOutputPreviewData = ref<SubOutputPreviewData>({})

        const pageData = ref({
            // 通道菜单，切换通道组和通道
            chlMenu: [Translate('IDCS_CHANNEL'), Translate('IDCS_CHANNEL_GROUP')],
            // 当前通道菜单
            activeChlMenu: 0,
            // 当前通道列表选中的通道
            activeChl: '',
            // 轮询时间选项 （秒）
            dwellTimeOptions: [5, 10, 15, 20, 30, 40, 60],
            // 是否轮询复选框
            dwellCheckbox: false,
            // 轮询开关
            configSwitch: false,
            // 是否显示开关
            isConfigSwitch: false,
            // 分屏选项
            segList: [1, 4, 6, 8, 9, 13, 16, 25, 32, 36, 64],
            // 当前视图列表选中的视图
            activeView: 0,
            // 当前视图中选中的分屏
            activeWinIndex: -1,
            // 初始Tab选中本机，当前选中的tab(本机0：local，解码卡1：decoderCardItem1，解码卡2：decoderCardItem2....)
            tabId: 0, //'local',
            // 当前选中输出. 主输出为0，辅输出的索引序号（1，2，3...）
            outputIdx: 0,
            // 当前选择中的解码卡输出的索引序号（输出1：0，输出2：1，输出3：2，输出4：3）
            decoderIdx: 0,
            // 通道组列表
            chlGroupList: [] as ChlItem[],
            // 当前选中的通道组
            activeChlGroup: '',
            // 当前通道组的通道列表
            chlListOfGroup: [] as ChlItem[],
            // 所有通道列表
            chlList: [] as ChlItem[],
            // 最大的输出分屏数
            outputScreenCount: 0,
            // 当前选中的
            // activeOutputScreen: 0,
            // 是否有解码卡
            hasDecoder: false,
            // 打开新增通道组弹窗
            isAddChlGroup: false,
            // 打开编辑通道组弹窗
            isEditChlGroup: false,
            // 是否打开授权弹窗
            isCheckAuth: false,
            // 是否打开收藏弹窗
            isAddView: false,
            editChlGroup: new ChlGroup(),
        })

        // 当前左侧缩略图的数据
        const currentViewList = computed(() => {
            if (outputType.value === 'main') {
                return mainOutputData.value
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId === 0) {
                    if (subOutputDwellData.value[pageData.value.outputIdx]) {
                        return subOutputDwellData.value[pageData.value.outputIdx]
                    }
                } else {
                    if (decoderCardMap.value[pageData.value.tabId]?.decoderDwellData[pageData.value.decoderIdx]) {
                        return decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx]
                    }
                }
            } else {
                if (pageData.value.tabId === 0) {
                    if (subOutputPreviewData.value[pageData.value.outputIdx]) {
                        return subOutputPreviewData.value[pageData.value.outputIdx]
                    }
                } else {
                    if (decoderCardMap.value[pageData.value.tabId]?.decoderPreviewData[pageData.value.decoderIdx]) {
                        return decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx]
                    }
                }
            }
            return {
                chlGroups: [] as ChlGroupData[],
            }
        })

        // 输出类型 'main' | 'dwell' | 'preview'
        const outputType = computed(() => {
            if (pageData.value.tabId === 0 && pageData.value.outputIdx === 0) {
                return 'main'
            }
            if (pageData.value.tabId === 0) {
                return subOutputDwellData.value[pageData.value.outputIdx].mode
            } else {
                return decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].mode
            }
        })

        // 当前窗口项
        const activeViewItem = computed(() => {
            return (
                currentViewList.value.chlGroups[pageData.value.activeView] || {
                    segNum: 1,
                    chls: [],
                }
            )
        })

        // 当前视图窗口的数据
        const currentSegment = computed(() => {
            return activeViewItem.value.segNum
        })

        // 当前视窗通道数据
        const currentViewData = computed(() => {
            const array = Array(64).fill({ id: '', value: '' }) as ChlItem[]
            activeViewItem.value.chls.forEach((item) => {
                array[item.winindex] = {
                    id: item.id,
                    value: displayWinChlName(item.id),
                }
            })
            return array
        })

        // 根据HDMI输出，是否显示遮罩层
        const isHDMIShadow = computed(() => {
            if (pageData.value.tabId === 0) {
                return false
            }
            const hdmiINData = decoderCardMap.value[pageData.value.tabId].ShowHdmiIn
            // 当前选择的HDMI IN输出和解码卡输出一致，则把当前输出的配置隐藏
            if (hdmiINData === pageData.value.decoderIdx + 1) {
                return true
            } else {
                return false
            }
        })

        // 当前轮询时间
        const currentTimeInterval = computed(() => {
            const value = currentViewList.value as DwellData
            if (value.timeInterval) {
                return value.timeInterval
            } else return 0
        })

        /**
         * @description 轮询选项的文本显示
         * @param {number} value
         * @returns {string}
         */
        const displayDwellTimeLabel = (value: number) => {
            return getTranslateForSecond(value)
        }

        /**
         * @description 根据通道id与通道名的映射，回显窗口的通道名
         * @param {string} id 通道ID
         */
        const displayWinChlName = (id: string) => {
            return chlNameMaping[id]
        }

        /**
         * @description 更新左侧视图缩略图
         */
        const addView = () => {
            const item: ChlGroupData = {
                segNum: 1,
                chls: [],
            }
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups.push(item)
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups.push(item)
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups.push(item)
                }
            }
            nextTick(() => {
                // 选中最后一个
                changeView(currentViewList.value.chlGroups.length - 1)
            })
        }

        /**
         * @description 切换视图
         * @param {number} key
         */
        const changeView = (key: number) => {
            pageData.value.activeView = key
            nextTick(() => {
                if (pageData.value.activeWinIndex > currentViewList.value.chlGroups.length - 1) {
                    changeWinIndex(0)
                }
            })
        }

        /**
         * @description 删除视图
         * @param {number} viewIndex
         */
        const delView = (viewIndex: number) => {
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups.splice(viewIndex, 1)
                if (mainOutputData.value.chlGroups.length && pageData.value.activeView >= mainOutputData.value.chlGroups.length - 1) {
                    changeView(mainOutputData.value.chlGroups.length - 1)
                }
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups.splice(viewIndex, 1)
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups.splice(viewIndex, 1)
                }
            }
        }

        /**
         * @description 收藏当前视图
         */
        const collectView = () => {
            if (!currentViewList.value.chlGroups.length) {
                return
            }
            pageData.value.isAddView = true
        }

        /**
         * @description 切换分屏视图
         */
        const changeSplit = (segment: number) => {
            if (!currentViewList.value.chlGroups.length) {
                return
            }
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups[pageData.value.activeView].segNum = segment
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].segNum = segment
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].segNum = segment
                }
            } else {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].segNum = segment
                } else {
                    subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].segNum = segment
                }
            }
        }

        /**
         * @description 清空视图内容
         */
        const clearAllSplitData = () => {
            if (!currentViewList.value.chlGroups.length) {
                return
            }
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups[pageData.value.activeView].chls = []
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].chls = []
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].chls = []
                }
            } else {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].chls = []
                } else {
                    subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].chls = []
                }
            }
        }

        /**
         * @description 比较新旧数据，清除某视窗内容
         * @param {ChlsDto[]} oldChls
         * @param {number} winIndex
         */
        const spliceSplitData = (oldChls: ChlsDto[], winIndex: number) => {
            const findIndex = oldChls.findIndex((item) => item.winindex === winIndex)
            if (findIndex > -1) {
                oldChls.splice(findIndex, 1)
            }
            return oldChls
        }

        /**
         * @description 清除某视窗内容
         * @param {number} winIndex
         */
        const clearSplitData = (winIndex: number) => {
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups[pageData.value.activeView].chls = spliceSplitData(mainOutputData.value.chlGroups[pageData.value.activeView].chls, winIndex)
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].chls = spliceSplitData(
                        decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].chls,
                        winIndex,
                    )
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].chls = spliceSplitData(
                        subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].chls,
                        winIndex,
                    )
                }
            } else {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].chls = spliceSplitData(
                        decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].chls,
                        winIndex,
                    )
                } else {
                    subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].chls = spliceSplitData(subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].chls, winIndex)
                }
            }
        }

        /**
         * @description 比较新旧数据，更新视图内容
         * @param {ChlsDto[]} oldChls
         * @param {ChlsDto[]} newChls
         */
        const mergeSplitData = (oldChls: ChlsDto[], newChls: ChlsDto[]) => {
            const keys = oldChls.map((item) => item.winindex)
            newChls.forEach((item) => {
                const index = keys.indexOf(item.winindex)
                if (index === -1) {
                    oldChls.push(item)
                } else {
                    oldChls[index].id = item.id
                }
            })
            return oldChls
        }

        /**
         * @description 更新视图内容
         * @param {ChlsDto[]} chls
         */
        const updateSplitData = (chls: ChlsDto[]) => {
            if (outputType.value === 'main') {
                mainOutputData.value.chlGroups[pageData.value.activeView].chls = mergeSplitData(mainOutputData.value.chlGroups[pageData.value.activeView].chls, chls)
            } else if (outputType.value === 'dwell') {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].chls = mergeSplitData(
                        decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].chlGroups[pageData.value.activeView].chls,
                        chls,
                    )
                } else {
                    subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].chls = mergeSplitData(
                        subOutputDwellData.value[pageData.value.outputIdx].chlGroups[pageData.value.activeView].chls,
                        chls,
                    )
                }
            } else {
                if (pageData.value.tabId !== 0) {
                    decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].chls = mergeSplitData(
                        decoderCardMap.value[pageData.value.tabId].decoderPreviewData[pageData.value.decoderIdx].chlGroups[0].chls,
                        chls,
                    )
                } else {
                    subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].chls = mergeSplitData(subOutputPreviewData.value[pageData.value.outputIdx].chlGroups[0].chls, chls)
                }
            }
        }

        /**
         * @description 新增通道组
         */
        const addChlGroup = () => {
            pageData.value.isAddChlGroup = true
        }

        /**
         * @description 关闭新增通道组弹窗
         */
        const closeAddChlGroup = () => {
            pageData.value.isAddChlGroup = false
        }

        /**
         * @description 编辑通道组
         */
        const editChlGroup = () => {
            const find = pageData.value.chlGroupList.find((item) => item.id === pageData.value.activeChlGroup)
            if (find) {
                pageData.value.editChlGroup.id = find.id
                pageData.value.editChlGroup.name = find.value
                pageData.value.editChlGroup.dwellTime = find.dwellTime!

                pageData.value.isEditChlGroup = true
            }
        }

        /**
         * @description 关闭编辑通道组
         */
        const closeEditChlGroup = () => {
            pageData.value.isEditChlGroup = false
        }

        /**
         * @description 根据通道组ID删除通道组
         */
        const deleteChlGroup = () => {
            const id = pageData.value.activeChlGroup
            const findItem = pageData.value.chlGroupList.find((item) => item.id === id)
            if (findItem) {
                openMessageTipBox({
                    type: 'question',
                    message: Translate('IDCS_DELETE_MP_GROUP_S').formatForLang(getShortString(findItem.value, 10)),
                }).then(async () => {
                    openLoading()
                    const sendXml = rawXml`
                        <condition>
                            <chlGroupIds type="list">
                                <item id="${id}"></item>
                            </chlGroupIds>
                        </condition>
                    `
                    const result = await delChlGroup(sendXml)
                    const $ = queryXml(result)
                    closeLoading()
                    if ($('//status').text() === 'success') {
                        openMessageTipBox({
                            type: 'success',
                            message: Translate('IDCS_DELETE_SUCCESS'),
                        }).then(() => {
                            getChlGroupList()
                            pageData.value.chlListOfGroup = []
                        })
                    }
                })
            }
        }

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await getChlList({
                nodeType: 'chls',
                requireField: ['name'],
            })
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.chlList = []
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const id = item.attr('id')!
                    const value = $item('name').text()
                    pageData.value.chlList.push({
                        id,
                        value,
                    })
                    chlNameMaping[id] = value
                })
            }
        }

        /**
         * @description 获取通道组列表
         */
        const getChlGroupList = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name />
                </requireField>
            `
            const result = await queryChlGroupList(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.chlGroupList = []
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    pageData.value.chlGroupList.push({
                        id: item.attr('id')!,
                        value: $item('name').text(),
                        dwellTime: Number($item('dwellTime').text()),
                    })
                })
            }
        }

        /**
         * @description 获取当前通道组的通道列表
         * @param {string} id 通道组ID
         */
        const getChlListOfGroup = async (id: string) => {
            pageData.value.activeChlGroup = id

            if (cacheChlListOfGroup[id]) {
                pageData.value.chlListOfGroup = cacheChlListOfGroup[id]
                return cacheChlListOfGroup[id]
            }

            openLoading()

            const sendXml = rawXml`
                <condition>
                    <chlGroupId>${id}</chlGroupId>
                </condition>
            `
            const result = await queryChlGroup(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                cacheChlListOfGroup[id] = [] as ChlItem[]
                $('//content/chlList/item').forEach((item) => {
                    // const $item = queryXml(item.element)
                    cacheChlListOfGroup[id].push({
                        id: item.attr('id')!,
                        value: item.text(),
                    })
                })
                pageData.value.chlListOfGroup = cacheChlListOfGroup[id]
            } else {
                pageData.value.chlListOfGroup = []
            }
            return cacheChlListOfGroup[id]
        }

        /**
         * @description 双击通道组，往视图注入通道列表
         * @param {string} id 通道组ID
         */
        const setWinFromChlGroup = async (id: string) => {
            if (!currentViewList.value.chlGroups.length) {
                return
            }
            pageData.value.activeChlGroup = id
            const result = (await getChlListOfGroup(id)) as ChlItem[]
            const values: ChlsDto[] = []
            result.forEach((item, index) => {
                const winindex = pageData.value.activeWinIndex + index
                if (winindex >= systemCaps.ipChlMaxCount) {
                    return
                }
                values.push({
                    winindex,
                    id: item.id,
                })
                updateSplitData(values)
            })
        }

        /**
         * @description 双击通道，往视图注入通道
         * @param {string} id 通道组ID
         */
        const setWinFromChl = (id: string) => {
            if (!currentViewList.value.chlGroups.length) {
                return
            }
            updateSplitData([
                {
                    winindex: pageData.value.activeWinIndex,
                    id,
                },
            ])
        }

        /**
         * @description 拖拽通道组
         * @param {string} id
         * @param {string} title
         */
        const handleDragChlGroup = (id: string) => {
            dragTransferData.type = 'multiple'
            dragTransferData.id = id
            pageData.value.activeChlGroup = id
        }

        /**
         * @description 拖拽通道
         * @param {string} id
         * @param {string} title
         */
        const handleDragChl = (id: string) => {
            dragTransferData.type = 'single'
            dragTransferData.id = id
            pageData.value.activeChl = id
        }

        /**
         * @description 请求轮询信息
         */
        const getDwellData = async () => {
            const result = await queryDwell()
            const $ = queryXml(result)

            // 解码卡排序
            const decoderResXml = $('//decoderContent/decoder')
            decoderResXml.sort((a, b) => {
                return Number(a.attr('id')) - Number(b.attr('id'))
            })
            const decorderOutputXml: Record<number, XmlResult> = {}
            // 解码卡输出排序
            decoderResXml.forEach((item) => {
                const $item = queryXml(item.element)
                const decoderId = Number(item.attr('id'))
                const onlineStatus = item.attr('onlineStatus')!.toBoolean()
                decoderCardMap.value[decoderId].onlineStatus = onlineStatus
                const currDecoderOut = $item('item').sort((a, b) => {
                    return Number(a.attr('outIndex')) - Number(b.attr('outIndex'))
                })
                if (!decorderOutputXml[decoderId]) {
                    decorderOutputXml[decoderId] = currDecoderOut // 用id区分属于哪一解码卡的输出
                }
            })
            // 获取解码卡各输出的配置
            Object.keys(decorderOutputXml).forEach((key) => {
                const id = Number(key)
                const outItemXml = decorderOutputXml[id] // 获取每张解码卡的各个输出数据
                outItemXml.forEach((item) => {
                    const $item = queryXml(item.element)
                    const outIndex = Number(item.attr('outIndex'))
                    // 0/1 表示当前输出是轮询('0')还是预览('1')模式
                    const isDecoderCheckDwell = Number(item.attr('validItem')) === 0
                    // 表示当前输出是HDMI IN输出
                    const showHdmiIn = item.attr('ShowHdmiIn')!.toBoolean()
                    if (showHdmiIn) {
                        // outIndex：0表示输出1、1表示输出2...
                        decoderCardMap.value[id].ShowHdmiIn = outIndex * 1 + 1
                    }
                    decoderCardMap.value[id].decoderDwellData = {}
                    decoderCardMap.value[id].decoderPreviewData = {}
                    $item('item1').forEach((element) => {
                        const $element = queryXml(element.element)
                        const displayMode = $element('displayMode').text()
                        if (displayMode === 'dwell') {
                            decoderCardMap.value[id].decoderDwellData[outIndex] = {
                                displayMode,
                                timeInterval: Number($element('timeInterval').text()),
                                // 表示当前输出是否勾选轮询check框
                                isCheckDwell: isDecoderCheckDwell,
                                chlGroups: [],
                                mode: 'preview',
                            }
                            // 表示当前输出是否勾选轮询check框
                            $element('chlGroups/item').forEach((chlGroup) => {
                                const $chlGroup = queryXml(chlGroup.element)
                                const segNum = Number($chlGroup('segNum').text())
                                const chlsData: ChlsDto[] = []
                                $chlGroup('chls/item').forEach((chlItem) => {
                                    chlsData.push({
                                        id: chlItem.attr('id')!,
                                        winindex: Number(chlItem.text()),
                                    })
                                })
                                decoderCardMap.value[id].decoderDwellData[outIndex].chlGroups.push({
                                    segNum: segNum,
                                    chls: chlsData,
                                })
                            })
                        } else {
                            decoderCardMap.value[id].decoderPreviewData[outIndex] = {
                                displayMode,
                                chlGroups: [],
                            }
                            const segNum = Number($element('segNum').text())
                            const chlsData: ChlsDto[] = []
                            $element('chls/item').forEach((chl) => {
                                chlsData.push({
                                    id: chl.attr('id')!,
                                    winindex: Number(chl.text()),
                                })
                            })
                            decoderCardMap.value[id].decoderPreviewData[outIndex].chlGroups[0].segNum = segNum
                            decoderCardMap.value[id].decoderPreviewData[outIndex].chlGroups[0].chls = chlsData
                        }
                    })
                })
            })

            // 获取主输出的配置
            mainOutputData.value = new MainOutputData()
            mainOutputData.value.displayMode = $('//content/item[@outType="Main"]/item1/displayMode').text()
            mainOutputData.value.timeInterval = Number($('//content/item[@outType="Main"]/item1/timeInterval').text())
            mainOutputData.value.chlGroups = []
            $('//content/item[@outType="Main"]/item1/chlGroups/item').forEach((item) => {
                const $item = queryXml(item.element)
                const segNum = Number($item('segNum').text())
                const chlsData: ChlsDto[] = []
                $item('chls/item').forEach((chl) => {
                    chlsData.push({
                        id: chl.attr('id')!,
                        winindex: Number(chl.text()),
                    })
                })
                mainOutputData.value.chlGroups.push({
                    segNum: segNum,
                    chls: chlsData,
                })
            })

            // 获取副输出的配置
            subOutputDwellData.value = {}
            subOutputPreviewData.value = {}
            for (let idx = 1; idx < systemCaps.outputScreensCount; idx++) {
                // 辅输出-轮询数据
                subOutputDwellData.value[idx] = {
                    displayMode: 'dwell',
                    timeInterval: 5,
                    isCheckDwell: false,
                    chlGroups: [],
                    mode: 'preview',
                }
                // 辅输出-预览数据
                subOutputPreviewData.value[idx] = {
                    displayMode: 'preview',
                    chlGroups: [{ segNum: 1, chls: [] }],
                }
            }

            $("//content/item[contains(@outType,'Sub')]").forEach((item) => {
                const $item = queryXml(item.element)
                // 每个辅输出对应的索引序号（1，2，3...）
                const outIndex = Number(item.attr('outIndex'))
                // validItem：0/1表示当前辅输出是轮询('0')还是预览('1')模式
                const isSubCheckDwell = Number(item.attr('validItem')) === 0
                $item('item1').forEach((element) => {
                    const $element = queryXml(element.element)
                    const displayMode = $element('displayMode').text()
                    if (displayMode === 'dwell') {
                        subOutputDwellData.value[outIndex].displayMode = displayMode
                        subOutputDwellData.value[outIndex].timeInterval = Number($element('timeInterval').text())
                        // 表示当前输出是否勾选轮询check框
                        subOutputDwellData.value[outIndex].isCheckDwell = isSubCheckDwell
                        $element('chlGroups/item').forEach((chlGroup) => {
                            const $chlGroup = queryXml(chlGroup.element)
                            const segNum = Number($chlGroup('segNum').text())
                            const chlsData: ChlsDto[] = []
                            $chlGroup('chls/item').forEach((chlItem) => {
                                chlsData.push({
                                    id: chlItem.attr('id')!,
                                    winindex: Number(chlItem.text()),
                                })
                            })
                            subOutputDwellData.value[outIndex].chlGroups.push({
                                segNum: segNum,
                                chls: chlsData,
                            })
                        })
                    } else {
                        subOutputPreviewData.value[outIndex].displayMode = displayMode
                        const segNum = Number($element('segNum').text())
                        const chlsData: ChlsDto[] = []
                        $element('chls/item').forEach((chl) => {
                            chlsData.push({
                                id: chl.attr('id')!,
                                winindex: Number(chl.text()),
                            })
                        })
                        subOutputPreviewData.value[outIndex].chlGroups[0].segNum = segNum
                        subOutputPreviewData.value[outIndex].chlGroups[0].chls = chlsData
                    }
                })
            })

            if (decoderResXml.length) {
                pageData.value.hasDecoder = true
            } else {
                pageData.value.hasDecoder = false
            }
        }

        /**
         * @description 查询3535A且支持AI
         */
        const getSystemWorkMode = async () => {
            const result = await querySystemWorkMode()
            const $ = queryXml(result)
            const supportAI = $('//content/supportAI').text().toBoolean()
            const is3535A = $('//content/openSubOutput').length > 0
            const openSubOutput = $('//content/openSubOutput').text().toBoolean()
            // 只有3535A且支持AI的机型才会有辅输出开关
            if (supportAI && is3535A) {
                pageData.value.isConfigSwitch = true
                pageData.value.configSwitch = openSubOutput
            } else {
                pageData.value.isConfigSwitch = false
            }
        }

        /**
         * @description 辅输出开关状态改变，弹出鉴权弹窗
         */
        const handleConfigSwitchChange = () => {
            pageData.value.configSwitch = !pageData.value.configSwitch
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_OPEN_SUBOUTPUT_TIP'),
            }).then(() => {
                pageData.value.isCheckAuth = true
            })
        }

        /**
         * @description 鉴权通过后，更新辅输出开关状态
         * @param {UserCheckAuthForm} e
         */
        const handleCheckAuthByConfigSwitchChange = async (e: UserCheckAuthForm) => {
            openLoading()

            // TODO: 原项目注释说“开关可编辑只可能是这种情况”，但关闭时，开关并没有隐藏
            // 开关可编辑只可能是这种情况async
            const sendXml = rawXml`
                <content>
                    <supportAI>false</supportAI>
                    <openSubOutput>true</openSubOutput>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editSystemWorkMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.isCheckAuth = false
                pageData.value.configSwitch = !pageData.value.configSwitch
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''

                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_USER_NOTEXIST')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                        break
                }

                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 提交轮询信息时生成通道组列表字符串
         * @param {ChlGroupData[]} data
         * @returns {string}
         */
        const getChlGroupXml = (data: ChlGroupData[]) => {
            return data
                .map((item) => {
                    return rawXml`
                    <item>
                        <segNum>${String(item.segNum)}</segNum>
                        <chls>
                            ${item.chls.map((chl) => `<item id="${chl.id}">${String(chl.winindex)}</item>`).join('')}
                        </chls>
                    </item>
                `
                })
                .join('')
        }

        /**
         * @description 提交轮询信息
         */
        const setDwellData = async () => {
            openLoading()

            // 副输出
            const subOutDataXml: string[] = []
            if (systemCaps.outputScreensCount > 1) {
                for (let idx = 1; idx < systemCaps.outputScreensCount; idx++) {
                    const outType = idx > 1 ? 'Sub' + idx : 'Sub'
                    const validItem = subOutputDwellData.value[idx].isCheckDwell ? '0' : '1'
                    const timeInterval = subOutputDwellData.value[idx].timeInterval
                    const xml = rawXml`
                        <item outIndex="${String(idx)}" validItem="${validItem}" outType="${outType}">
                            <item1 id="0">
                                <displayMode>dwell</displayMode>
                                <timeInterval>${String(timeInterval)}</timeInterval>
                                <chlGroups>
                                    ${getChlGroupXml(subOutputDwellData.value[idx].chlGroups)}
                                </chlGroups>
                            </item1>
                            <item1 id="1">
                                <displayMode>preview</displayMode>
                                <segNum>${String(subOutputPreviewData.value[idx].chlGroups[0].segNum)}</segNum>
                                <chls>${subOutputPreviewData.value[idx].chlGroups[0].chls.map((chl) => `<item id="${chl.id}">${String(chl.winindex)}</item>`).join('')}</chls>
                            </item1>
                        </item>
                    `
                    subOutDataXml.push(xml)
                }
            }

            // 解码卡
            const decoderDataXml: string[] = []
            Object.keys(decoderCardMap.value).forEach((key) => {
                const item = decoderCardMap.value[Number(key)]
                const cardID = Number(key)
                let itemXml = ''
                // 解码卡不在线，则无需下发配置信息
                if (decoderCardMap.value[cardID].onlineStatus) {
                    Object.keys(item.decoderDwellData).forEach((key2) => {
                        const outputIndex = Number(key2)
                        const dwellItem = item.decoderDwellData[outputIndex]
                        let previewXml = ''
                        if (item.decoderPreviewData[outputIndex].chlGroups.length) {
                            previewXml = rawXml`
                                <item1 id="1">
                                    <displayMode>preview</displayMode>
                                    <segNum>${String(item.decoderPreviewData[outputIndex].chlGroups[0].segNum)}</segNum>
                                    <chls>${item.decoderPreviewData[outputIndex].chlGroups[0].chls.map((chl) => `<item id="${chl.id}">${String(chl.winindex)}</item>`).join('')}</chls>
                                </item1>
                            `
                        }
                        itemXml = rawXml`
                            <item outIndex="${key2}" ${item.ShowHdmiIn ? 'ShowHdmiIn="true"' : ''} validItem="${dwellItem.isCheckDwell ? '0' : '1'}">
                                <item1 id="0">
                                    <displayMode>dwell</displayMode>
                                    <timeInterval>${String(dwellItem.timeInterval)}</timeInterval>
                                    <chlGroups>
                                    ${getChlGroupXml(dwellItem.chlGroups)}
                                    </chlGroups>
                                </item1>
                                ${previewXml}
                            </item>
                        `
                    })
                }
                const xml = rawXml`
                    <decoder id="${key}">
                        ${itemXml}
                    </decoder>
                `
                decoderDataXml.push(xml)
            })

            const sendXml = rawXml`
                <content>
                    <item outIndex="0" validItem="0" outType="Main">
                        <item1 id="0">
                            <displayMode>dwell</displayMode>
                            <chlGroups>
                                ${getChlGroupXml(mainOutputData.value.chlGroups)}
                            </chlGroups>
                        </item1>
                    </item>
                    ${subOutDataXml.join('')}
                    <decoderContent>
                        ${decoderDataXml.join('')}
                    </decoderContent>
                </content>
            `

            await editDwell(sendXml)
            closeLoading()
        }

        /**
         * @description Drop事件触发
         * @param {Event} e
         * @param {number} winIndex 窗口索引
         */
        const handleDrop = (winIndex: number) => {
            pageData.value.activeWinIndex = winIndex
            if (dragTransferData.type === 'single') {
                updateSplitData([
                    {
                        id: dragTransferData.id,
                        winindex: winIndex,
                    },
                ])
            } else {
                setWinFromChlGroup(dragTransferData.id)
            }
        }

        /**
         * @description 获取支持的最大分屏数
         */
        const showSecondaryOutput = () => {
            pageData.value.outputScreenCount = systemCaps.outputScreensCount
        }

        /**
         * @description Tab名称文本显示
         * @param {number} i 索引，从1开始
         */
        const displayTabName = (i: number) => {
            if (i === 1) {
                return Translate('IDCS_MAIN_SCREEN')
            }
            if (i === 2 && pageData.value.outputScreenCount === 2) {
                return Translate('IDCS_SECOND_SCREEN')
            }
            return Translate('IDCS_SECOND_SCREEN') + (i - 1)
        }

        /**
         * @description 更改轮询时间
         * @param {number} num 秒
         */
        const changeTimeInterval = (num: number) => {
            if (pageData.value.tabId === 0) {
                subOutputDwellData.value[pageData.value.outputIdx].timeInterval = num
            } else {
                decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].timeInterval = num
            }
        }

        /**
         * @description 更改TabID
         * @param {number} id 索引值，从0开始
         */
        const changeTab = (index: number) => {
            pageData.value.tabId = index
            if (index !== 0) {
                pageData.value.dwellCheckbox = decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].mode === 'dwell'
            }
            decoderCardMap.value = decoderCardMap.value
            changeWinIndex(0)
        }

        /**
         * @description 更改主辅输出
         * @param {number} index
         */
        const changeOutput = (index: number) => {
            pageData.value.outputIdx = index
            if (index !== 0) {
                pageData.value.dwellCheckbox = subOutputDwellData.value[pageData.value.outputIdx].mode === 'dwell'
            }
            subOutputDwellData.value = subOutputDwellData.value
            changeWinIndex(0)
        }

        /**
         * @description 更改解码卡
         * @param {number} index
         */
        const changeDecoderIndex = (index: number) => {
            pageData.value.decoderIdx = index
            if (index !== 0) {
                pageData.value.dwellCheckbox = decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].mode === 'dwell'
            }
            decoderCardMap.value = decoderCardMap.value
        }

        const changeWinIndex = (index: number) => {
            pageData.value.activeWinIndex = index
        }

        /**
         * @description 更新输出类型
         */
        const changeOutputType = () => {
            if (pageData.value.tabId === 0 && pageData.value.outputIdx === 0) {
                return
            }
            if (pageData.value.dwellCheckbox) {
                if (pageData.value.tabId === 0) {
                    subOutputDwellData.value[pageData.value.outputIdx].mode = 'dwell'
                } else {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].mode = 'dwell'
                }
            } else {
                if (pageData.value.tabId === 0) {
                    subOutputDwellData.value[pageData.value.outputIdx].mode = 'preview'
                } else {
                    decoderCardMap.value[pageData.value.tabId].decoderDwellData[pageData.value.decoderIdx].mode = 'preview'
                }
            }
        }

        onMounted(async () => {
            openLoading()
            await getChlsList()
            await getChlGroupList()

            await getDwellData()

            // 3535A是否显示辅输出控制开关
            await getSystemWorkMode()

            // 是否支持显示辅输出
            showSecondaryOutput()

            closeLoading()
        })

        return {
            pageData,
            currentSegment,
            currentViewData,
            decoderCardMap,
            currentTimeInterval,
            isHDMIShadow,
            currentViewList,
            activeViewItem,
            getChlGroupList,
            addView,
            displayDwellTimeLabel,
            changeSplit,
            collectView,
            clearSplitData,
            clearAllSplitData,
            addChlGroup,
            editChlGroup,
            deleteChlGroup,
            getChlListOfGroup,
            setWinFromChlGroup,
            handleDragChlGroup,
            handleDragChl,
            handleDrop,
            displayTabName,
            handleConfigSwitchChange,
            handleCheckAuthByConfigSwitchChange,
            setDwellData,
            delView,
            displayWinChlName,
            changeTimeInterval,
            changeOutput,
            changeOutputType,
            changeTab,
            changeWinIndex,
            setWinFromChl,
            changeView,
            changeDecoderIndex,
            outputType,
            closeEditChlGroup,
            closeAddChlGroup,

            BaseCheckAuthPop,
            OutputSplitTemplate,
            OutputAddViewPop,
            ChannelGroupEditPop,
            ChannelGroupAddPop,
        }
    },
})
