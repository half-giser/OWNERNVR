<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 13:58:06
 * @Description:
-->
<template>
    <el-dialog
        v-model="dialogOpened"
        :title="Translate('IDCS_CHANNEL_PREVIEW')"
        width="642"
        @opened="opened"
        @close="close"
    >
        <div class="playerWrap">
            <BaseVideoPlayer
                v-if="playerOpened"
                ref="playerRef"
                @ready="ready"
            />
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
const userSessionStore = useUserSessionStore()

const playerRef = ref<PlayerInstance>()
const dialogOpened = ref(false)
const playerOpened = ref(false)

let chlId: string
let chlName: string
let isOnline: boolean

/**
 * @description 打开直播弹窗 并播放
 * @param {String} _chlId
 * @param {string} _chlName
 * @param {Boolean} _isOnline
 */
const openLiveWin = (_chlId: string, _chlName: string, _isOnline = true) => {
    chlId = _chlId
    chlName = _chlName
    isOnline = _isOnline // 如果传入isOnline，则使用此状态，否则默认在线
    dialogOpened.value = true
}

/**
 * @description 播放
 */
const play = () => {
    if (!playerRef.value || !playerRef.value.ready) return
    if (playerRef.value.mode === 'ocx') {
        let sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
        playerRef.value.plugin.ExecuteCmd(sendXML)
        sendXML = OCX_XML_SetProperty({
            calendarType: userSessionStore.calendarType,
            supportRecStatus: false,
        })
        playerRef.value.plugin.ExecuteCmd(sendXML)
        playerRef.value!.plugin.RetryStartChlView(chlId, chlName)
    } else {
        playerRef.value.player.play({
            chlID: chlId,
            streamType: 2,
            isOnline: isOnline,
        })
        return
    }
}

/**
 * @description 打开弹窗
 */
const opened = () => {
    playerOpened.value = true
}

/**
 * @description 关闭弹窗
 */
const close = () => {
    playerOpened.value = false
    if (playerRef.value && playerRef.value.ready) {
        if (playerRef.value.mode === 'ocx') {
            const sendXML = OCX_XML_StopPreview('CURRENT')
            playerRef.value.plugin.ExecuteCmd(sendXML)
        }
    }
    playerOpened.value = false
    dialogOpened.value = false
}

/**
 * @description 播放器Ready时回调
 */
const ready = () => {
    play()
}

defineExpose<LivePopInstance>({
    openLiveWin,
})
</script>

<style scoped lang="scss">
.playerWrap {
    width: 600px;
    height: 450px;
    background-color: var(--table-stripe);
}
</style>
