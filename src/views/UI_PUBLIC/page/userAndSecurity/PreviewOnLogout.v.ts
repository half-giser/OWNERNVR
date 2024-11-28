/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:43:27
 * @Description: 登出后预览
 */
import { type UserPreviewOnLogoutChannelList } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    setup() {
        const { openMessageBox } = useMessageBox()
        const { closeLoading, openLoading } = useLoading()
        const { Translate } = useLangStore()

        const playerRef = ref<PlayerInstance>()

        const channelList = ref<UserPreviewOnLogoutChannelList[]>([])

        const pageData = ref({
            // 通道选项
            channelOptions: getSwitchOptions(),
            // 当前选中的通道
            activeChannelIndex: 0,
            // 是否可提交
            buttonDisabled: true,
        })

        const chlOptions = computed(() => {
            return channelList.value.map((item, value) => {
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
            pageData.value.buttonDisabled = false
            channelList.value.forEach((item) => {
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
                channelList.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        name: $item('name').text(),
                        switch: $item('switch').text(),
                    }
                })
                play()
            }
        }

        /**
         * @description 切换播放通道
         */
        const play = () => {
            if (!channelList.value[pageData.value.activeChannelIndex]) return
            if (!playerRef.value || !playerRef.value.ready) return
            const { id, name } = channelList.value[pageData.value.activeChannelIndex]
            if (playerRef.value.mode === 'ocx') {
                playerRef.value.plugin.RetryStartChlView(id, name)
            }

            if (playerRef.value.mode === 'h5') {
                playerRef.value.player.play({
                    chlID: id,
                    streamType: 2,
                })
                return
            }
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            openLoading()

            const sendXML = rawXml`
                <content>
                    ${channelList.value
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
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                pageData.value.buttonDisabled = true
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_SAVE_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 视频插件ready回调
         */
        const onReady = () => {
            if (playerRef.value?.mode === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
            play()
        }

        /**
         * @description 更改选中的用户
         * @param {UserPreviewOnLogoutChannelList} row
         */
        const handleChangeUser = (row: UserPreviewOnLogoutChannelList) => {
            pageData.value.activeChannelIndex = channelList.value.findIndex((item) => item.id === row.id)
        }

        onMounted(() => {
            getData()
        })

        onBeforeUnmount(() => {
            if (playerRef.value && playerRef.value.mode === 'ocx' && playerRef.value.ready) {
                const sendXML = OCX_XML_StopPreview('ALL')
                playerRef.value?.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        })

        return {
            playerRef,
            onReady,
            channelList,
            pageData,
            chlOptions,
            changeAllChannel,
            setData,
            handleChangeUser,
        }
    },
})
