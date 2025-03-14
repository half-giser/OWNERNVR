/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 09:59:23
 * @Description: 输出配置
 */
import OutputTemplateItem from './OutputTemplateItem.vue'
import OutputAddViewPop from './OutputAddViewPop.vue'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import ChannelGroupEditPop from '../channel/ChannelGroupEditPop.vue'
import ChannelGroupAddPop from '../channel/ChannelGroupAddPop.vue'
import { type CheckboxValueType } from 'element-plus'

type ChlItem = {
    id: string
    value: string
    dwellTime?: number
}

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        OutputTemplateItem,
        OutputAddViewPop,
        ChannelGroupEditPop,
        ChannelGroupAddPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const cacheChlListOfGroup: Record<string, ChlItem[]> = {}
        // 通道ID和通道名的映射. 用于快速通过ID查询通道名
        const chlNameMaping: Record<string, string> = {}

        const dragTransferData = {
            type: 'single',
            id: '',
            title: '',
        }

        const pageData = ref({
            // 通道菜单，切换通道组和通道
            chlMenu: [Translate('IDCS_CHANNEL'), Translate('IDCS_CHANNEL_GROUP')],
            // 当前通道菜单
            activeChlMenu: 0,
            // 当前通道列表选中的通道
            activeChl: '',
            // 轮询时间选项 （秒）
            dwellTimeOptions: [5, 10, 15, 20, 30, 40, 60].map((value) => {
                return {
                    value,
                    label: getTranslateForSecond(value),
                }
            }),
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
            // 初始Tab选中本机，当前选中的tab(-1 本机0：local，0 解码卡1：decoderCardItem1，1 解码卡2：decoderCardItem2....)
            tabId: -1,
            // 当前选中输出. 主输出为-1，辅输出的索引序号（0，1，2...）
            outputIdx: -1,
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
            editChlGroup: new ChannelGroupDto(),
        })

        const formData = ref(new SystemOutputSettingForm())

        const isDwell = computed(() => {
            if (pageData.value.tabId === -1 && pageData.value.outputIdx === -1) {
                return formData.value.main.isDwell
            }

            if (pageData.value.tabId === -1) {
                return formData.value.sub[pageData.value.outputIdx].isDwell
            } else {
                return formData.value.decoder[pageData.value.tabId].output[pageData.value.decoderIdx].isDwell
            }
        })

        const getCurrentOutput = () => {
            if (isDwell.value) {
                if (pageData.value.tabId === -1) {
                    if (pageData.value.outputIdx === -1) {
                        return formData.value.main.dwell
                    } else {
                        return formData.value.sub[pageData.value.outputIdx].dwell
                    }
                } else {
                    return formData.value.decoder[pageData.value.tabId].output[pageData.value.decoderIdx].dwell
                }
            } else {
                if (pageData.value.tabId === -1) {
                    if (pageData.value.outputIdx === -1) {
                        return formData.value.main.preview
                    } else {
                        return formData.value.sub[pageData.value.outputIdx].preview
                    }
                } else {
                    return formData.value.decoder[pageData.value.tabId].output[pageData.value.decoderIdx].preview
                }
            }
        }

        // 当前窗口项
        const activeViewItem = computed(() => {
            const activeView = isDwell.value ? pageData.value.activeView : 0
            return (
                getCurrentOutput().chlGroups[activeView] || {
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
            const array: ChlItem[] = Array(64).fill({ id: '', value: '' })
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
            if (pageData.value.tabId === -1) {
                return false
            }
            const hdmiINData = formData.value.decoder[pageData.value.tabId].ShowHdmiIn
            // 当前选择的HDMI IN输出和解码卡输出一致，则把当前输出的配置隐藏
            if (hdmiINData === pageData.value.decoderIdx + 1) {
                return true
            } else {
                return false
            }
        })

        // 当前轮询时间
        const currentTimeInterval = computed(() => {
            return getCurrentOutput().timeInterval
        })

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
            const item: SystemOutputSettingChlGroup = {
                segNum: 1,
                chls: [],
            }

            getCurrentOutput().chlGroups.push(item)

            nextTick(() => {
                // 选中最后一个
                changeView(getCurrentOutput().chlGroups.length - 1)
            })
        }

        /**
         * @description 切换视图
         * @param {number} key
         */
        const changeView = (key: number) => {
            pageData.value.activeView = key
            nextTick(() => {
                if (pageData.value.activeWinIndex > getCurrentOutput().chlGroups.length - 1) {
                    changeWinIndex(0)
                }
            })
        }

        /**
         * @description 删除视图
         * @param {number} viewIndex
         */
        const delView = (viewIndex: number) => {
            getCurrentOutput().chlGroups.splice(viewIndex, 1)
        }

        /**
         * @description 收藏当前视图
         */
        const collectView = () => {
            if (!getCurrentOutput().chlGroups.length) {
                return
            }
            pageData.value.isAddView = true
        }

        /**
         * @description 切换分屏视图
         */
        const changeSplit = (segment: number) => {
            if (!getCurrentOutput().chlGroups.length) {
                return
            }
            const activeView = isDwell.value ? pageData.value.activeView : 0
            getCurrentOutput().chlGroups[activeView].segNum = segment
        }

        /**
         * @description 清空视图内容
         */
        const clearAllSplitData = () => {
            if (!getCurrentOutput().chlGroups.length) {
                return
            }
            const activeView = isDwell.value ? pageData.value.activeView : 0
            getCurrentOutput().chlGroups[activeView].chls = []
        }

        /**
         * @description 比较新旧数据，清除某视窗内容
         * @param {SystemOutputSettingChlItem[]} oldChls
         * @param {number} winIndex
         */
        const spliceSplitData = (oldChls: SystemOutputSettingChlItem[], winIndex: number) => {
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
            const activeView = isDwell.value ? pageData.value.activeView : 0
            getCurrentOutput().chlGroups[activeView].chls = spliceSplitData(getCurrentOutput().chlGroups[activeView].chls, winIndex)
        }

        /**
         * @description 比较新旧数据，更新视图内容
         * @param {SystemOutputSettingChlItem[]} oldChls
         * @param {SystemOutputSettingChlItem[]} newChls
         */
        const mergeSplitData = (oldChls: SystemOutputSettingChlItem[], newChls: SystemOutputSettingChlItem[]) => {
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
         * @param {SystemOutputSettingChlItem[]} chls
         */
        const updateSplitData = (chls: SystemOutputSettingChlItem[]) => {
            const activeView = isDwell.value ? pageData.value.activeView : 0
            getCurrentOutput().chlGroups[activeView].chls = mergeSplitData(getCurrentOutput().chlGroups[activeView].chls, chls)
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
                openMessageBox({
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
                    closeLoading()
                    commDelResponseHandler(result, () => {
                        getChlGroupList()
                        pageData.value.chlListOfGroup = []
                    })
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
            if ($('status').text() === 'success') {
                pageData.value.chlList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const id = item.attr('id')
                    const value = $item('name').text()
                    chlNameMaping[id] = value
                    return {
                        id,
                        value,
                    }
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
            if ($('status').text() === 'success') {
                pageData.value.chlGroupList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        value: $item('name').text(),
                        dwellTime: $item('dwellTime').text().num(),
                    }
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

            if ($('status').text() === 'success') {
                cacheChlListOfGroup[id] = $('content/chlList/item').map((item) => {
                    return {
                        id: item.attr('id'),
                        value: item.text(),
                    }
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
            if (!getCurrentOutput().chlGroups.length) {
                return
            }
            pageData.value.activeChlGroup = id
            const result = (await getChlListOfGroup(id)) as ChlItem[]
            const values: SystemOutputSettingChlItem[] = []
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
            if (!getCurrentOutput().chlGroups.length) {
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

            // 解码卡输出
            $('decoderContent/decoder').forEach((decoder) => {
                const $decoder = queryXml(decoder.element)
                const decoderId = decoder.attr('id').num()
                const onlineStatus = decoder.attr('onlineStatus').bool()

                // 设备端刘顺：每张解码卡固定4个输出
                formData.value.decoder.push({
                    id: decoderId,
                    onlineStatus,
                    ShowHdmiIn: -1,
                    output: Array(4)
                        .fill(0)
                        .map((_, index) => {
                            const item = new SystemOutputSettingItem()
                            item.id = index
                            return item
                        }),
                })

                $decoder('item').forEach((outItem) => {
                    const $outItem = queryXml(outItem.element)
                    const outIndex = outItem.attr('outIndex').num()

                    // 表示当前输出是HDMI IN输出
                    const showHdmiIn = outItem.attr('ShowHdmiIn').bool()
                    if (showHdmiIn) {
                        formData.value.decoder[decoderId].ShowHdmiIn = outIndex
                    }

                    // 0/1 表示当前输出是轮询('0')还是预览('1')模式
                    formData.value.decoder[decoderId].output[outIndex].isDwell = outItem.attr('validItem').num() === 0

                    $outItem('item1').forEach((element) => {
                        const $element = queryXml(element.element)
                        const displayMode = $element('displayMode').text()
                        // 表示当前输出是否勾选轮询check框
                        if (displayMode === 'dwell') {
                            formData.value.decoder[decoderId].output[outIndex].dwell = {
                                id: 0,
                                timeInterval: $element('timeInterval').text().num(),
                                chlGroups: $element('chlGroups/item').map((chlGroup) => {
                                    const $chlGroup = queryXml(chlGroup.element)
                                    return {
                                        segNum: $chlGroup('segNum').text().num(),
                                        chls: $chlGroup('chls/item').map((chl) => ({
                                            id: chl.attr('id'),
                                            winindex: chl.text().num(),
                                        })),
                                    }
                                }),
                            }
                        } else {
                            formData.value.decoder[decoderId].output[outIndex].preview.chlGroups = [
                                {
                                    segNum: $element('segNum').text().num() || 1,
                                    chls: $element('chls/item').map((chlItem) => {
                                        return {
                                            id: chlItem.attr('id'),
                                            winindex: chlItem.text().num(),
                                        }
                                    }),
                                },
                            ]
                        }
                    })
                })

                pageData.value.hasDecoder = true
            })

            // 获取主输出的配置
            formData.value.main.isDwell = true
            formData.value.main.dwell = {
                id: 0,
                timeInterval: $('content/item[@outType="Main"]/item1/timeInterval').text().num(),
                chlGroups: $('content/item[@outType="Main"]/item1/chlGroups/item').map((item) => {
                    const $item = queryXml(item.element)

                    return {
                        segNum: $item('segNum').text().num(),
                        chls: $item('chls/item').map((chl) => {
                            return {
                                id: chl.attr('id'),
                                winindex: chl.text().num(),
                            }
                        }),
                    }
                }),
            }

            // 获取副输出的配置
            for (let idx = 0; idx < systemCaps.outputScreensCount - 1; idx++) {
                const item = new SystemOutputSettingItem()
                item.id = idx + 1
                formData.value.sub.push(item)
            }

            $("content/item[contains(@outType,'Sub')]").forEach((item, index) => {
                const $item = queryXml(item.element)
                formData.value.sub[index].id = item.attr('outIndex').num()
                formData.value.sub[index].isDwell = item.attr('validItem').num() === 0

                $item('item1').forEach((element) => {
                    const $element = queryXml(element.element)
                    const displayMode = $element('displayMode').text()
                    if (displayMode === 'dwell') {
                        formData.value.sub[index].dwell = {
                            id: 0,
                            timeInterval: $element('timeInterval').text().num(),
                            chlGroups: $element('chlGroups/item').map((chlGroup) => {
                                const $chlGroup = queryXml(chlGroup.element)
                                return {
                                    segNum: $chlGroup('segNum').text().num(),
                                    chls: $chlGroup('chls/item').map((chl) => ({
                                        id: chl.attr('id'),
                                        winindex: chl.text().num(),
                                    })),
                                }
                            }),
                        }
                    } else {
                        formData.value.sub[index].preview.chlGroups = [
                            {
                                segNum: $element('segNum').text().num() || 1,
                                chls: $element('chls/item').map((chlItem) => {
                                    return {
                                        id: chlItem.attr('id'),
                                        winindex: chlItem.text().num(),
                                    }
                                }),
                            },
                        ]
                    }
                })
            })
        }

        /**
         * @description 查询3535A且支持AI
         */
        const getSystemWorkMode = async () => {
            const result = await querySystemWorkMode()
            const $ = queryXml(result)
            const supportAI = $('content/supportAI').text().bool()
            const is3535A = $('content/openSubOutput').length > 0
            const openSubOutput = $('content/openSubOutput').text().bool()
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
            openMessageBox({
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

            // 开关可编辑只可能是这种情况
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

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuth = false
                pageData.value.configSwitch = !pageData.value.configSwitch
            } else {
                const errorCode = $('errorCode').text().num()
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

                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 提交轮询信息时生成通道组列表字符串
         * @param {SystemOutputSettingChlGroup[]} data
         * @returns {string}
         */
        const getChlGroupXml = (data: SystemOutputSettingChlGroup[]) => {
            return data
                .map((item) => {
                    return rawXml`
                        <item>
                            <segNum>${item.segNum}</segNum>
                            <chls>
                                ${item.chls.map((chl) => `<item id="${chl.id}">${chl.winindex}</item>`).join('')}
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

            const sendXml = rawXml`
                <content>
                    <item outIndex="0" validItem="0" outType="Main">
                        <item1 id="0">
                            <displayMode>dwell</displayMode>
                            <chlGroups>
                                ${getChlGroupXml(formData.value.main.dwell.chlGroups)}
                            </chlGroups>
                        </item1>
                    </item>
                    ${formData.value.sub
                        .map((item) => {
                            return rawXml`
                                <item outIndex="${item.id}" validItem="${item.isDwell ? 0 : 1}" outType="Sub${item.id === 1 ? '' : item.id}">
                                    <item1 id="0">
                                        <displayMode>dwell</displayMode>
                                        <timeInterval>${item.dwell.timeInterval}</timeInterval>
                                        <chlGroups>
                                            ${getChlGroupXml(item.dwell.chlGroups)}
                                        </chlGroups>
                                    </item1>
                                    <item1 id="1">
                                        <displayMode>preview</displayMode>
                                        <segNum>${item.preview.chlGroups[0].segNum}</segNum>
                                        <chls>${item.preview.chlGroups[0].chls.map((chl) => `<item id="${chl.id}">${chl.winindex}</item>`).join('')}</chls>
                                    </item1>
                                </item>
                            `
                        })
                        .join('')}
                </content>
                <decoderContent>
                    ${formData.value.decoder
                        .filter((item) => item.onlineStatus)
                        .map((item) => {
                            return rawXml`
                                <decoder id="${item.id}">
                                    ${item.output
                                        .map((output, index) => {
                                            const ShowHdmiIn = item.ShowHdmiIn === index
                                            return rawXml`
                                                <item outIndex="${output.id}" validItem="${output.isDwell ? 0 : 1}" ${ShowHdmiIn ? ' ShowHdmiIn="true"' : ''}>
                                                    <item1 id="0">
                                                        <displayMode>dwell</displayMode>
                                                        <timeInterval>${output.dwell.timeInterval}</timeInterval>
                                                        <chlGroups>
                                                            ${getChlGroupXml(output.dwell.chlGroups)}
                                                        </chlGroups>
                                                    </item1>
                                                    <item1 id="1">
                                                        <displayMode>preview</displayMode>
                                                        <segNum>${output.preview.chlGroups[0].segNum}</segNum>
                                                        <chls>${output.preview.chlGroups[0].chls.map((chl) => `<item id="${chl.id}">${chl.winindex}</item>`).join('')}</chls>
                                                    </item1>
                                                </item>
                                            `
                                        })
                                        .join('')}
                                </decoder>
                            `
                        })
                        .join('')}
                </decoderContent>
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
            getCurrentOutput().timeInterval = num
        }

        /**
         * @description 更改TabID
         * @param {number} tabId 索引值，从0开始
         */
        const changeTab = (tabId: number) => {
            if (tabId !== -1) {
                if (!formData.value.decoder[tabId].onlineStatus) {
                    return
                }
            }
            pageData.value.tabId = tabId
            changeWinIndex(0)
        }

        /**
         * @description 更改主辅输出
         * @param {number} index
         */
        const changeOutput = (index: number) => {
            pageData.value.outputIdx = index
            changeWinIndex(0)
        }

        /**
         * @description 更改解码卡
         * @param {number} index
         */
        const changeDecoderIndex = (index: number) => {
            pageData.value.decoderIdx = index
        }

        const changeWinIndex = (index: number) => {
            pageData.value.activeWinIndex = index
        }

        /**
         * @description 更新输出类型
         */
        const changeOutputType = (value: CheckboxValueType) => {
            if (pageData.value.tabId === -1 && pageData.value.outputIdx === -1) {
                return
            }

            if (pageData.value.tabId === -1) {
                formData.value.sub[pageData.value.outputIdx].isDwell = value as boolean
            } else {
                formData.value.decoder[pageData.value.tabId].output[pageData.value.decoderIdx].isDwell = value as boolean
            }
        }

        const hdmiInOptions = computed(() => {
            if (pageData.value.tabId === -1) {
                return []
            }
            return [
                {
                    value: -1,
                    label: Translate('IDCS_NULL'),
                },
            ].concat(
                formData.value.decoder[pageData.value.tabId].output.map((_, index) => {
                    return {
                        value: index,
                        label: `${Translate('IDCS_OUTPUT')}${index + 1}`,
                    }
                }),
            )
        })

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
            currentTimeInterval,
            isHDMIShadow,
            activeViewItem,
            getChlGroupList,
            addView,
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
            closeEditChlGroup,
            closeAddChlGroup,
            hdmiInOptions,
            isDwell,
            formData,
            getCurrentOutput,
        }
    },
})
