/*
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 15:02:31
 * @Description:
 */
import BaseVideoPlayer from '@/views/UI_PUBLIC/components/player/BaseVideoPlayer.vue'

export default defineComponent({
    components: {
        BaseVideoPlayer,
    },
    setup(prop, { expose }) {
        const userSessionStore = useUserSessionStore()
        const osType = getSystemInfo().platform

        const playerRef = ref<PlayerInstance>()
        const dialogOpened = ref(false)

        let chlId: string
        let chlName: string
        let chlIndex: string
        let chlType: string
        let isOnline: boolean

        const openLiveWin = (_chlId: string, _chlName: string, _chlIndex: string, _chlType: string, _isOnline = true) => {
            chlId = _chlId
            chlName = _chlName
            chlIndex = _chlIndex
            chlType = _chlType
            isOnline = _isOnline // 如果传入isOnline，则使用此状态，否则默认在线
            dialogOpened.value = true
        }

        const play = () => {
            if (!playerRef.value || !playerRef.value.ready) return
            if (playerRef.value.mode === 'ocx') {
                let sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                sendXML = OCX_XML_SetProperty({
                    calendarType: userSessionStore.calendarType,
                    supportRecStatus: false,
                })
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                if (osType == 'mac') {
                    const sendXML = OCX_XML_Preview({
                        winIndexList: [0],
                        chlIdList: [chlId],
                        chlNameList: [chlName],
                        streamType: 'main',
                        chlIndexList: [chlIndex],
                        chlTypeList: [chlType],
                    })
                    playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                } else {
                    playerRef.value.plugin.RetryStartChlView(chlId, chlName)
                }
            } else {
                playerRef.value.player.play({
                    chlID: chlId,
                    streamType: 2,
                    isOnline: isOnline,
                })
                return
            }
        }

        const opened = () => {
            dialogOpened.value = true
        }

        const close = () => {
            dialogOpened.value = false
        }

        const ready = () => {
            play()
        }

        expose({
            openLiveWin,
        })

        return {
            dialogOpened,
            playerRef,
            opened,
            close,
            ready,
        }
    },
})
