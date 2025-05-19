/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-26 17:03:07
 * @Description: 现场预览-通道视图
 */
import ChannelGroupEditPop from '../channel/ChannelGroupEditPop.vue'
import ChannelGroupAddPop from '../channel/ChannelGroupAddPop.vue'

export interface ChannelPanelExpose {
    getOnlineChlList: () => string[]
    getOfflineChlList: () => string[]
    setOnlineChlList: (chls: string[]) => void
    getChlMap: () => Record<string, LiveChannelList>
    switchChl: (split: number) => void
}

export default defineComponent({
    components: {
        ChannelGroupEditPop,
        ChannelGroupAddPop,
    },
    props: {
        /**
         * @property 播放模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property 播放类型
         */
        type: {
            type: String as PropType<'live' | 'record'>,
            default: 'live',
        },
        /**
         * @property 正在播放的通道列表
         */
        playingList: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: {
        ready(chlMap: Record<string, LiveChannelList>) {
            return typeof chlMap === 'object'
        },
        play(chlID: string) {
            return typeof chlID === 'string'
        },
        polling(chls: { id: string; value: string }[], groupId: string, dwellTime: number) {
            return chls.length && typeof dwellTime === 'number' && typeof groupId === 'string'
        },
        refresh(chlMap: Record<string, LiveChannelList>) {
            return typeof chlMap === 'object'
        },
        custom(arr: LiveCustomViewChlList[], segNum: number) {
            return (arr.length || !arr.length) && !isNaN(segNum)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 通道列表是否初始化完毕
            ready: false,
            // 通道菜单
            chlMenu: [
                {
                    tab: 0,
                    file: 'live_channel',
                    label: Translate('IDCS_CHANNEL'),
                },
                {
                    tab: 1,
                    file: 'live_channel_group',
                    label: Translate('IDCS_CHANNEL_GROUP'),
                },
                {
                    tab: 2,
                    file: 'live_view',
                    label: Translate('IDCS_CUSTOM_VIEW'),
                },
            ],
            // 当前选中的菜单索引
            activeChlMenu: 0,
            // 保存一份通道数据用于通道搜索
            cacheChlList: [] as LiveChannelList[],
            // 在线通道列表
            onlineChlList: [] as string[],
            // 输入的关键词
            chlKeyword: '',
            // 已确认，可用于过滤的关键词
            chlConfirmKeyword: '',
            // 当前hover的通道
            activeChl: '',
            // 通道组列表
            chlGroupList: [] as LiveChannelGroupList[],
            // 当前hover的通道组
            activeChlGroup: '',
            // 当前通道组的通道列表
            chlListOfGroup: [] as LiveChlOfChannelGroupList[],
            // 通道组分割线CSS高度
            chlGroupHeight: '50%',
            // 自定义视图列表
            customViewList: [] as LiveCustomViewList[],
            // 当前hover的自定义视图
            activeCustomView: -1,
            // 打开新增通道组弹窗
            isAddChlGroup: false,
            // 打开编辑通道组弹窗
            isEditChlGroup: false,
            // 编辑数据
            editChlGroup: new ChannelGroupDto(),
            // 通道视图是否显示
            isOpen: true,
        })

        // 从代码逻辑上看 ocx模式和h5模式一样，都可以通过WebSocketState获取通道状态，无需前端定时器不断发起http请求
        // 通道树状态刷新时间间隔
        // const CHL_REFRESH_INTERVAL = 3000
        // let refreshTimer: NodeJS.Timeout | number = 0

        // 通道ID与通道数据的映射
        const chlMap: Record<string, LiveChannelList> = {}

        const chlGroupElement = ref<HTMLDivElement>()

        // 关键词过滤后的通道组列表
        const chlList = computed(() => {
            return pageData.value.cacheChlList.filter((item) => item.value.indexOf(pageData.value.chlConfirmKeyword) > -1)
        })

        /**
         * @description 切换菜单
         * @param {number} index
         */
        const changeChlMenu = (index: number) => {
            pageData.value.activeChlMenu = index
            pageData.value.activeCustomView = -1
            if (index === 1 && !pageData.value.chlGroupList.length) {
                getChlGroupList()
            } else if (index === 2 && !pageData.value.customViewList.length) {
                getCustomView()
            }
        }

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await getChlList({
                requireField: ['protocolType', 'supportPtz', 'supportIntegratedPtz', 'supportAZ', 'supportIris', 'supportPTZGroupTraceTask', 'supportAccessControl', 'supportWiper'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.cacheChlList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const result = {
                        id: item.attr('id'),
                        value: $item('name').text(),
                        chlType: $item('chlType').text(),
                        protocolType: $item('chlType').text(),
                        supportPtz: $item('supportPtz').text().bool(),
                        supportPTZGroupTraceTask: $item('supportPTZGroupTraceTask').text().bool(),
                        supportAccessControl: $item('supportAccessControl').text().bool(),
                        supportTalkback: false, // $item('supportTalkback').text().bool(),
                        supportAZ: $item('supportAZ').text().bool(),
                        supportIris: $item('supportIris').text().bool(),
                        // supportPtz: $("supportPtz").text().bool(),
                        MinPtzCtrlSpeed: $item('supportPtz').attr('MinPtzCtrlSpeed').num(),
                        MaxPtzCtrlSpeed: $item('supportPtz').attr('MaxPtzCtrlSpeed').num(),
                        supportIntegratedPtz: $item('supportIntegratedPtz').text().bool(),
                        supportWiper: $item('supportWiper').text().bool(),
                        chlIp: '',
                        poeSwitch: false,
                    }
                    if (item.attr('id')) {
                        chlMap[item.attr('id')] = result
                    }
                    return result
                })
            }
        }

        /**
         * @description 获取支持对讲的通道列表，并更新至通道列表
         */
        const getSupportTalkbackChlList = async () => {
            const indexes = pageData.value.cacheChlList.map((item) => item.id)
            const result = await getChlList({
                isSupportTalkback: true,
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const id = item.attr('id')
                    const chlType = $item('productModel').attr('factoryName')
                    const index = indexes.indexOf(id)
                    if (index > -1 && chlType !== 'Recorder') {
                        pageData.value.cacheChlList[index].supportTalkback = true
                        chlMap[id].supportTalkback = true
                    }
                })
            }
        }

        /**
         * @description 返回通道与通道能力的映射
         */
        const getChlMap = () => {
            return chlMap
        }

        /**
         * @description 刷新通道树状态
         */
        const getChlTreeStatus = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                // 查询出所有在线的通道
                pageData.value.onlineChlList = $('content/item').map((item) => {
                    return item.attr('id')
                })
            }
        }

        const getChlIconStatus = (id: string) => {
            if (prop.playingList.includes(id)) {
                return 2
            }

            if (!pageData.value.onlineChlList.includes(id)) {
                return 3
            }

            if (pageData.value.activeChl === id) {
                return 1
            }
            return 0
        }

        /**
         * @description 返回在线通道列表
         */
        const getOnlineChlList = () => {
            return [...pageData.value.onlineChlList]
        }

        /**
         * @description 返回离线通道列表
         */
        const getOfflineChlList = () => {
            return pageData.value.cacheChlList.map((item) => item.id).filter((id) => !pageData.value.onlineChlList.includes(id))
        }

        /**
         * @description 更新在线通道列表
         * @param {Array} chlList
         */
        const setOnlineChlList = (chlList: string[]) => {
            pageData.value.onlineChlList = [...chlList]
        }

        /**
         * @description 根据关键词过滤通道列表
         */
        const searchChl = () => {
            if (!pageData.value.cacheChlList) {
                return
            }
            pageData.value.chlConfirmKeyword = pageData.value.chlKeyword
            getChlTreeStatus()
        }

        /**
         * @description 刷新通道列表
         */
        const refreshChl = async () => {
            openLoading()

            pageData.value.chlKeyword = ''
            await getChlsList()
            await getSupportTalkbackChlList()
            await getChlTreeStatus()
            ctx.emit('refresh', chlMap)

            closeLoading()
        }

        /**
         * @description 获取通道组列表
         */
        const getChlGroupList = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name/>
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
                        nameMaxByteLen: $('content/itemType/name').attr('maxByteLen').num() || nameByteMaxLen,
                        dwellTime: $item('dwellTime').text().num(),
                    }
                })
            } else {
                if ($('errorCode').text().num() === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageBox(Translate('IDCS_NO_PERMISSION'))
                }
            }
        }

        /**
         * @description 获取当前通道组的通道列表
         * @param {string} id 通道组ID
         */
        const getChlListOfGroup = async (id: string) => {
            pageData.value.activeChlGroup = id

            const sendXml = rawXml`
                <condition>
                    <chlGroupId>${id}</chlGroupId>
                </condition>
            `
            const result = await queryChlGroup(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.chlListOfGroup = $('content/chlList/item').map((item) => {
                    return {
                        id: item.attr('id'),
                        value: item.text(),
                    }
                })
            }
        }

        /**
         * @description 当前窗口播放选中的通道
         * @param {string} id
         */
        const setWinFromChl = (id: string) => {
            if (!pageData.value.onlineChlList.includes(id)) {
                return
            }
            ctx.emit('play', id)
        }

        /**
         * @description 当前窗口播放选中的通道组
         * @param {String} id
         * @param {Number} dwellTime
         */
        const setWinFromChlGroup = async (id: string, dwellTime: number) => {
            await getChlListOfGroup(id)
            if (pageData.value.chlListOfGroup.length > 1) {
                ctx.emit('polling', pageData.value.chlListOfGroup, id, dwellTime)
            } else {
                ctx.emit('play', pageData.value.chlListOfGroup[0].id)
            }
        }

        /**
         * @description 当前窗口播放选中通道组的选中通道
         * @param {string} id
         */
        const setWinFormChlOfGroup = (id: string) => {
            ctx.emit('play', id)
        }

        /**
         * @description 打开新增通道组弹窗
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
         * @description 打开编辑通道组弹窗
         */
        const editChlGroup = () => {
            const find = pageData.value.chlGroupList.find((item) => item.id === pageData.value.activeChlGroup)
            if (find) {
                pageData.value.editChlGroup.id = find.id
                pageData.value.editChlGroup.name = find.value
                pageData.value.editChlGroup.dwellTime = find.dwellTime
                pageData.value.editChlGroup.nameMaxByteLen = find.nameMaxByteLen

                pageData.value.isEditChlGroup = true
            }
        }

        /**
         * @description 关闭编辑通道组弹窗
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
         * @description 移动通道组的分割线
         */
        let mousedown = false

        const mousedownChlGroupPosition = () => {
            mousedown = true
            document.body.style.setProperty('cursor', 'n-resize')
        }

        const mousemoveChlGroupPosition = (event: MouseEvent) => {
            if (mousedown) {
                const rect = chlGroupElement.value!.getBoundingClientRect()
                const position = clamp(((event.clientY - rect.top) / rect.height) * 100, 20, 80)
                pageData.value.chlGroupHeight = `${position}%`
            }
        }

        const mouseupChlGroupPosition = () => {
            if (mousedown) {
                mousedown = false
                document.body.style.setProperty('cursor', 'default')
            }
        }

        useEventListener(document.body, 'mousemove', mousemoveChlGroupPosition, false)
        useEventListener(document.body, 'mouseup', mouseupChlGroupPosition, false)

        /**
         * @description 获取自定义视图列表
         */
        const getCustomView = async () => {
            const result = await queryCustomerView()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                pageData.value.customViewList = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    return {
                        chlArr: $item('chls/item').map((chl) => ({
                            chlId: chl.attr('id'),
                            chlIndex: chl.text().num(),
                        })),
                        historyPlay: $item('historyPlay').text(),
                        segNum: $item('segNum').text().num(),
                        value: $item('name').text(),
                        id: index,
                    }
                })
            }
        }

        /**
         * @description 当前通道播放选中的自定义视图
         * @param {Object} item
         */
        const setWinFormCustomView = (item: LiveCustomViewList) => {
            pageData.value.activeCustomView = item.id

            if ((prop.mode === 'h5' && item.segNum > 4) || (prop.mode === 'ocx' && item.segNum > systemCaps.previewMaxWin)) {
                openMessageBox(Translate('IDCS_NO_SUPPORT_SEGMENTATION').formatForLang(item.segNum))
                return
            }

            ctx.emit('custom', item.chlArr, item.segNum)
        }

        /**
         * @description 获取设备IP和POE开关
         */
        const getDeviceList = async () => {
            const sendXml = rawXml`
                <requireField>
                    <name/>
                    <ip/>
                </requireField>
            `
            const result = await queryDevList(sendXml)
            const $ = queryXml(result)
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const id = item.attr('id')
                if (chlMap[id]) {
                    chlMap[id].poeSwitch = $item('addType').text() === 'poe'
                    chlMap[id].chlIp = $item('ip').text()
                }
            })
        }

        /**
         * @description 切换通道
         * @param split
         */
        const switchChl = (split: number) => {
            const onlineChl = chlList.value.filter((chl) => pageData.value.onlineChlList.includes(chl.id))
            let lastIndex = Math.max(...prop.playingList.map((chlId) => onlineChl.findIndex((chl) => chl.id === chlId)))
            if (lastIndex === onlineChl.length - 1) {
                lastIndex = -1
            }
            ctx.emit(
                'custom',
                onlineChl.splice(lastIndex + 1, split).map((item, index) => ({
                    chlId: item.id,
                    chlIndex: index,
                })),
                split,
            )
        }

        // const stopRefreshChlStatus = () => {
        //     clearInterval(refreshTimer)
        // }

        // const startRefreshChlStatus = () => {
        //     refreshTimer = setInterval(() => {
        //         getChlTreeStatus()
        //     }, CHL_REFRESH_INTERVAL)
        // }

        // watch(
        //     () => prop.mode,
        //     (newVal) => {
        //         if (newVal === 'ocx') {
        //             stopRefreshChlStatus()
        //             startRefreshChlStatus()
        //         }
        //     },
        //     {
        //         immediate: true,
        //     },
        // )

        onMounted(async () => {
            await getChlsList()
            await getSupportTalkbackChlList()
            if (import.meta.env.VITE_UI_TYPE === 'UI1-E') {
                await getDeviceList()
            }
            await getChlTreeStatus()
            nextTick(() => {
                pageData.value.ready = true
                ctx.emit('ready', chlMap)
            })
        })

        // onBeforeUnmount(() => {
        //     stopRefreshChlStatus()
        // })

        ctx.expose({
            getOnlineChlList,
            setOnlineChlList,
            getOfflineChlList,
            getChlMap,
            switchChl,
        })

        return {
            pageData,
            chlList,
            changeChlMenu,
            searchChl,
            refreshChl,
            setWinFromChl,
            addChlGroup,
            editChlGroup,
            deleteChlGroup,
            getChlGroupList,
            closeAddChlGroup,
            closeEditChlGroup,
            getChlListOfGroup,
            setWinFromChlGroup,
            setWinFormChlOfGroup,
            setWinFormCustomView,
            getChlIconStatus,
            chlGroupElement,
            mousedownChlGroupPosition,
        }
    },
})
