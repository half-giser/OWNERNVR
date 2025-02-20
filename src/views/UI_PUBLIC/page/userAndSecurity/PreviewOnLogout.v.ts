/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:43:27
 * @Description: 登出后预览
 */
import { type UserPreviewOnLogoutChannelList } from '@/types/apiType/userAndSecurity'
import type { TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const playerRef = ref<PlayerInstance>()

        const tableRef = ref<TableInstance>()
        const tableData = ref<UserPreviewOnLogoutChannelList[]>([])
        const watchEdit = useWatchEditData(tableData)

        const pageData = ref({
            // 通道选项
            channelOptions: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 当前选中的通道
            activeChannelIndex: 0,
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const chlOptions = computed(() => {
            return tableData.value.map((item, value) => {
                return {
                    value,
                    label: item.name,
                }
            })
        })

        watch(
            () => pageData.value.activeChannelIndex,
            () => play(),
        )

        /**
         * @description 一次性设置预览开关
         * @param {string} value
         */
        const changeAllChannel = (value: string) => {
            tableData.value.forEach((item) => {
                item.switch = value
            })
        }

        /**
         * @description 获取页面数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryLogoutChlPreviewAuth()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        name: $item('name').text(),
                        switch: $item('switch').text(),
                    }
                })
                watchEdit.listen()
            }
        }

        /**
         * @description 准备就绪后开始播放
         */
        const stopWatchFirstPlay = watchEffect(() => {
            if (tableData.value.length && ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        /**
         * @description 切换播放通道
         */
        const play = () => {
            const { id, name } = tableData.value[pageData.value.activeChannelIndex]

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(id, name)
            }

            if (mode.value === 'h5') {
                player.play({
                    chlID: id,
                    streamType: 2,
                })
            }
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            openLoading()

            const sendXML = rawXml`
                <content>
                    ${tableData.value
                        .map((item) => {
                            return rawXml`
                                <item id="${item.id}">
                                    <name>${wrapCDATA(item.name)}</name>
                                    <switch>${item.switch}</switch>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            const result = await editLogoutChlPreviewAuth(sendXML)

            closeLoading()
            commSaveResponseHandler(result, () => {
                watchEdit.update()
            })
        }

        /**
         * @description 视频插件ready回调
         */
        const onReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const changeChl = () => {
            tableRef.value!.setCurrentRow(tableData.value[pageData.value.activeChannelIndex])
        }

        /**
         * @description 更改选中的用户
         * @param {UserPreviewOnLogoutChannelList} row
         */
        const changeUser = (row: UserPreviewOnLogoutChannelList) => {
            pageData.value.activeChannelIndex = tableData.value.findIndex((item) => item.id === row.id)
        }

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            tableRef,
            onReady,
            tableData,
            pageData,
            watchEdit,
            chlOptions,
            changeAllChannel,
            setData,
            changeUser,
            changeChl,
        }
    },
})
