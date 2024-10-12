/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:58
 * @Description: 回放-通道视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-12 18:41:06
 */
import ChannelGroupEditPop from '../channel/ChannelGroupEditPop.vue'
import ChannelGroupAddPop from '../channel/ChannelGroupAddPop.vue'
import { ChlGroup } from '@/types/apiType/channel'
import { type PlaybackChlList, type PlaybackChannelGroupList } from '@/types/apiType/playback'

export interface ChannelPanelExpose {
    removeChls(chl: string[]): void
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
            default: 'record',
        },
    },
    emits: {
        ready() {
            return true
        },
        change(chls: PlaybackChlList[]) {
            return Array.isArray(chls)
        },
        play(chls: PlaybackChlList[]) {
            return Array.isArray(chls)
        },
        search(chls: PlaybackChlList[]) {
            return Array.isArray(chls)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()

        // 通道ID与通道名称的映射
        const chlMap = ref<Record<string, string>>({})

        const pageData = ref({
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
            ],
            // 当前选中的菜单索引
            activeChlMenu: 0,
            // 保存一份通道数据用于通道搜索
            cacheChlList: [] as PlaybackChlList[],
            // 输入的关键词
            chlKeyword: '',
            // 已确认，可用于过滤的关键词
            chlConfirmKeyword: '',
            // 选中的通道
            selectedChl: [] as string[],
            // 全选通道
            chlAll: false,
            // 通道组列表
            chlGroupList: [] as PlaybackChannelGroupList[],
            // 当前通道组的通道列表
            chlListOfGroup: [] as PlaybackChlList[],
            // 当前hover的通道组
            activeChlGroup: '',
            // 通道组分割线CSS高度
            chlGroupHeight: '50%',
            // 打开新增通道组弹窗
            isAddChlGroup: false,
            // 打开编辑通道组弹窗
            isEditChlGroup: false,
            // 编辑数据
            editChlGroup: new ChlGroup(),
            // 通道视图是否显示
            isOpen: true,
        })

        const chlGroupElement = ref<HTMLDivElement>()

        // 最大通道数
        const maxChl = computed(() => {
            return Math.min(pageData.value.cacheChlList.length, prop.mode === 'ocx' ? systemCaps.playbackMaxWin : 4)
        })

        // 通道全选
        const isChlAll = computed(() => {
            return pageData.value.selectedChl.length >= maxChl.value
        })

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await queryChlsExistRec()
            const $ = queryXml(result)

            chlMap.value = {}

            if ($('//status').text() === 'success') {
                pageData.value.cacheChlList = $('//content/item').map((item) => {
                    const id = item.attr('id')!

                    // 新获取的通道列表若没有已选中的通道，移除该选中的通道
                    const index = pageData.value.selectedChl.indexOf('id')
                    if (index > -1) {
                        pageData.value.selectedChl.splice(index, 1)
                    }

                    chlMap.value[id] = item.text()

                    return {
                        id,
                        value: item.text(),
                    }
                })
            }
        }

        // 排序的选中的通道列表
        const sortedSelectedChlList = computed(() => {
            const keys = Object.keys(chlMap.value)
            return pageData.value.selectedChl
                .sort((a, b) => keys.indexOf(a) - keys.indexOf(b))
                .map((item) => ({
                    id: item,
                    value: chlMap.value[item],
                }))
        })

        /**
         * @description 根据关键词过滤通道列表
         */
        const searchChl = () => {
            if (!pageData.value.cacheChlList) {
                return
            }
            pageData.value.chlConfirmKeyword = pageData.value.chlKeyword
        }

        /**
         * @description 刷新通道列表
         */
        const refreshChl = async () => {
            openLoading()

            pageData.value.chlKeyword = ''
            await getChlsList()

            closeLoading()
        }

        /**
         * @description 触发左下角搜索选中的通道
         */
        const search = () => {
            if (!pageData.value.selectedChl.length) {
                return
            }
            ctx.emit('search', sortedSelectedChlList.value)
        }

        /**
         * @description 触发左下角播放选中的通道
         */
        const play = () => {
            ctx.emit('play', sortedSelectedChlList.value)
        }

        /**
         * @description 处理全选和取消全选
         * @param {boolean} bool
         */
        const toggleAllChl = (bool: string | number | boolean) => {
            if (bool === false) {
                pageData.value.selectedChl = []
            } else {
                if (pageData.value.selectedChl.length >= maxChl.value) {
                    return
                }
                for (const index in chlList.value) {
                    if (!pageData.value.selectedChl.includes(chlList.value[index])) {
                        pageData.value.selectedChl.push(chlList.value[index])
                        if (pageData.value.selectedChl.length >= maxChl.value) {
                            break
                        }
                    }
                }
            }
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
            const result = await queryChlGroupList(getXmlWrapData(sendXml))
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.chlGroupList = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        value: $item('name').text(),
                        dwellTime: Number($item('dwellTime').text()),
                    }
                })
            } else {
                if (Number($('//errorCode').text()) === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NO_PERMISSION'),
                    })
                }
            }
        }

        /**
         * @description 当前窗口播放选中的通道组
         * @param {String} id
         * @param {Number} dwellTime
         */
        const setWinFromChlGroup = async (id: string) => {
            await getChlListOfGroup(id)
            if (pageData.value.chlListOfGroup.length) {
                ctx.emit('play', pageData.value.chlListOfGroup.slice(0, prop.mode === 'ocx' ? systemCaps.playbackMaxWin : 4))
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
            const result = await queryChlGroup(getXmlWrapData(sendXml))
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                pageData.value.chlListOfGroup = $('//content/chlList/item').map((item) => {
                    return {
                        id: item.attr('id')!,
                        value: item.text(),
                    }
                })
            }
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
                    const result = await delChlGroup(getXmlWrapData(sendXml))
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
                const position = Math.max(20, Math.min(80, ((event.clientY - rect.top) / rect.height) * 100))
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

        // 关键词过滤后的通道组列表
        const chlList = computed(() => {
            return pageData.value.cacheChlList.filter((item) => item.value.indexOf(pageData.value.chlConfirmKeyword) > -1).map((item) => item.id)
        })

        /**
         * @description 切换菜单
         * @param {number} index
         */
        const changeChlMenu = (index: number) => {
            pageData.value.activeChlMenu = index
            if (index === 1 && !pageData.value.chlGroupList.length) {
                getChlGroupList()
            }
        }

        /**
         * @description 移除选中的通道
         * @param {string[]} chls
         */
        const removeChls = (chls: string[]) => {
            const selectedChl = pageData.value.selectedChl.filter((item) => {
                return !chls.includes(item)
            })
            pageData.value.selectedChl = selectedChl
        }

        watch(
            () => pageData.value.selectedChl,
            () => {
                ctx.emit('change', sortedSelectedChlList.value)
            },
        )

        onMounted(async () => {
            await getChlsList()
            if (history.state && history.state.chlId) {
                if (Object.keys(chlMap.value).includes(history.state.chlId as string)) {
                    pageData.value.selectedChl.push(history.state.chlId as string)
                }
            }
            nextTick(() => {
                ctx.emit('ready')
            })
        })

        ctx.expose({
            removeChls,
        })

        return {
            isChlAll,
            chlGroupElement,
            pageData,
            searchChl,
            refreshChl,
            addChlGroup,
            closeAddChlGroup,
            editChlGroup,
            closeEditChlGroup,
            deleteChlGroup,
            mousedownChlGroupPosition,
            chlList,
            changeChlMenu,
            getChlGroupList,
            toggleAllChl,
            getChlListOfGroup,
            setWinFromChlGroup,
            search,
            play,
            ChannelGroupEditPop,
            ChannelGroupAddPop,
        }
    },
})
