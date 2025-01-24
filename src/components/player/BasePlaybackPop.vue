<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 11:34:14
 * @Description: 回放弹窗（OCX+H5）
-->
<template>
    <el-dialog
        :width="dialogWidth"
        :title="Translate('IDCS_REPLAY')"
        @close="beforeClose"
        @opened="open"
    >
        <div class="RecordPop">
            <div class="main">
                <BaseListBox
                    v-show="playList.length > 1"
                    class="chl"
                    border
                >
                    <BaseListBoxItem
                        v-for="(listItem, index) in playList"
                        :key="index"
                        @click="changeChannel(index)"
                    >
                        <BaseImgSprite
                            file="chl_icon"
                            :index="index === pageData.chlIndex ? 1 : 0"
                            :chunk="4"
                        />
                        <span>{{ listItem.chlName }}</span>
                    </BaseListBoxItem>
                </BaseListBox>
                <div class="player">
                    <BaseVideoPlayer
                        v-if="pageData.mounted"
                        ref="playerRef"
                        type="record"
                        :enable-pos="systemCaps.supportPOS"
                        @ready="handleReady"
                        @time="handleTime"
                        @success="handleSuccess"
                        @message="ocxNotify"
                    />
                </div>
            </div>
            <div class="control-bar">
                <span class="start-time">{{ startTime }}</span>
                <el-slider
                    v-model="pageData.progress"
                    :show-tooltip="false"
                    :min="startTimeStamp"
                    :max="endTimeStamp"
                    :disabled="pageData.iconDisabled"
                    @mousedown="handleSliderMouseDown"
                    @mouseup="handleSliderMouseUp"
                    @change="handleSliderChange"
                />
                <span class="end-time">{{ endTime }}</span>
            </div>
            <div class="control-btns">
                <span class="current-time">{{ currentTime }}</span>
                <el-tooltip :content="Translate('IDCS_PAUSE')">
                    <BaseImgSprite
                        v-show="!pageData.paused"
                        class="btn"
                        file="image_preview_pause"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="pageData.iconDisabled"
                        :chunk="4"
                        @click="pause"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_PLAY')">
                    <BaseImgSprite
                        v-show="pageData.paused"
                        class="btn"
                        file="image_preview_play"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="pageData.iconDisabled"
                        :chunk="4"
                        @click="play"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_STOP')">
                    <BaseImgSprite
                        file="image_preview_stop"
                        class="btn"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="pageData.iconDisabled"
                        :chunk="4"
                        @click="stop"
                    />
                </el-tooltip>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button @click="close">{{ Translate('IDCS_CLOSE') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { type XMLQuery } from '@/utils/xmlParse'

const prop = defineProps<{
    /**
     * @property 回放列表
     */
    playList: PlaybackPopList[]
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'status', type: string, winList: { winIndex: number; chlId: string }): void
}>()

const systemCaps = useCababilityStore()
const userSession = useUserSessionStore()
const dateTime = useDateTimeStore()

// 通道ID与通道类型映射列表
const chlMapping: Record<
    string,
    {
        chlType: string
    }
> = {}

const playerRef = ref<PlayerInstance>()

// 播放模式
const mode = computed(() => {
    if (!playerRef.value) {
        return ''
    }
    return playerRef.value.mode
})

const posInfo = usePosInfo(mode)

/**
 * @description 回放窗口宽度
 */
const dialogWidth = computed(() => {
    return prop.playList.length > 1 ? '870px' : '640px'
})

const pageData = ref({
    // 弹窗可用状态
    mounted: false,
    // 当前播放的通道索引
    chlIndex: 0,
    // 当前播放进度的时间戳（单位秒）
    progress: 0,
    // 是否暂停状态
    paused: false,
    // 是否停止状态
    stop: false,
    // 按钮是否置灰
    iconDisabled: true,
    // 播放条是否锁定
    lockSlider: false,
})

/**
 * @description 当前播放的通道
 */
const current = computed(() => {
    return (
        prop.playList[pageData.value.chlIndex] || {
            chlId: '',
            chlName: '',
            startTime: 0,
            endTime: 0,
            eventList: [],
        }
    )
})

// 开始时间 （format）
const startTime = computed(() => {
    return dayjs(current.value.startTime).format(dateTime.timeFormat)
})

// 结束时间 （format）
const endTime = computed(() => {
    return dayjs(current.value.endTime).format(dateTime.timeFormat)
})

// 当前时间 （format）
const currentTime = computed(() => {
    return dayjs(pageData.value.progress * 1000).format(dateTime.dateTimeFormat)
})

// 开始时间的时间戳（s）
const startTimeStamp = computed(() => {
    return current.value.startTime / 1000
})

// 结束时间的时间戳（s）
const endTimeStamp = computed(() => {
    return current.value.endTime / 1000
})

/**
 * @description 播放器ready时的回调
 */
const handleReady = () => {
    if (mode.value === 'h5') {
        play()
    }

    if (mode.value === 'ocx') {
        playerRef.value!.plugin.ExecuteCmd(OCX_XML_SetPluginModel('ReadOnly', 'Playback'))
        playerRef.value!.plugin.ExecuteCmd(
            OCX_XML_SetProperty({
                calendarType: userSession.calendarType,
            }),
        )
        playerRef.value!.plugin.ExecuteCmd(OCX_XML_SetRecPlayMode('SYNC'))
        play()
    }
}

/**
 * @description 播放器播放
 */
const play = () => {
    if (mode.value === 'h5') {
        pageData.value.progress = startTimeStamp.value
        pageData.value.stop = false
        pageData.value.paused = false
        playerRef.value!.player.play({
            chlID: current.value.chlId,
            chlName: current.value.chlName,
            startTime: startTimeStamp.value,
            endTime: endTimeStamp.value,
            streamType: 1,
            winIndex: 0,
            showPos: current.value.eventList.includes('POS'),
        })
    }

    if (mode.value === 'ocx') {
        pageData.value.progress = startTimeStamp.value
        pageData.value.stop = false
        pageData.value.paused = false
        pageData.value.iconDisabled = false
        const eventList = current.value.eventList
        if (eventList.includes('MOTION')) {
            //  NTA1-724 增加SMD人、车事件类型
            eventList.push('SMDHUMAN', 'SMDVEHICLE')
        }
        const sendXML = OCX_XML_SearchRec(
            'RecPlay',
            dayjs(current.value.startTime).calendar('gregory').format(DEFAULT_DATE_FORMAT),
            dayjs(current.value.endTime).calendar('gregory').format(DEFAULT_DATE_FORMAT),
            [0],
            [current.value.chlId],
            [current.value.chlName],
            eventList,
            localToUtc(current.value.startTime, DEFAULT_DATE_FORMAT),
            localToUtc(current.value.endTime, DEFAULT_DATE_FORMAT),
        )
        playerRef.value!.plugin.ExecuteCmd(sendXML)
        seek(startTimeStamp.value)
    }
}

/**
 * @description 播放器暂停
 */
const pause = () => {
    if (pageData.value.iconDisabled) {
        return
    }

    if (playerRef.value?.mode === 'h5') {
        playerRef.value.player.pause(0)
        pageData.value.paused = true
    }

    if (playerRef.value?.mode === 'ocx') {
        const sendXML = OCX_XML_SetPlayStatus('FORWARDS_PAUSE', 0)
        playerRef.value.plugin.ExecuteCmd(sendXML)
        pageData.value.paused = true
    }
}

/**
 * @description 播放器恢复播放
 */
// const resume = () => {
//     if (pageData.value.iconDisabled) {
//         return
//     }
//     if (playerRef.value?.mode === 'h5') {
//         if (pageData.value.stop) {
//             play()
//         } else {
//             playerRef.value.player.resume(0)
//             pageData.value.paused = false
//         }
//     }
//     if (playerRef.value?.mode === 'ocx') {
//         if (pageData.value.stop) {
//             play()
//         } else {
//             const sendXML = OCX_XML_SetPlayStatus('FORWARDS', 0)
//             playerRef.value.plugin.ExecuteCmd(sendXML)
//             pageData.value.paused = false
//         }
//     }
// }

/**
 * @description 播放器停止播放
 */
const stop = () => {
    if (pageData.value.iconDisabled) {
        return
    }

    if (mode.value === 'h5') {
        playerRef.value!.player.stop(0)
        pageData.value.progress = startTimeStamp.value
        pageData.value.paused = true
        pageData.value.stop = true
    }

    if (mode.value === 'ocx') {
        const sendXML = OCX_XML_SetPlayStatus('STOP')
        playerRef.value!.plugin.ExecuteCmd(sendXML)
        pageData.value.progress = startTimeStamp.value
        pageData.value.paused = true
        pageData.value.stop = true
    }
}

/**
 * @description seek回放时间点
 * @param {number} timestamp 时间戳，单位秒
 */
const seek = (timestamp: number) => {
    if (mode.value === 'h5') {
        playerRef.value!.player.seek(Math.floor(timestamp))
        pageData.value.paused = false
    }

    if (mode.value === 'ocx') {
        const sendXML = OCX_XML_RecCurPlayTime([
            {
                index: 0,
                time: Math.floor(timestamp),
            },
        ])
        playerRef.value!.plugin.ExecuteCmd(sendXML)
        pageData.value.paused = false
    }
}

/**
 * @description 播放器进度回调
 * @param timestamp 时间戳（ms）
 */
const handleTime = (_winIndex: number, _data: TVTPlayerWinDataListItem, timestamp: number) => {
    if (pageData.value.lockSlider) {
        return
    }
    nextTick(() => {
        pageData.value.progress = timestamp / 1000
    })
}

/**
 * @description 播放条改变
 */
const handleSliderChange = () => {
    // 设备端判断startTime>=endTime(包括等于)时会报错，所以传参时-1，保证startTime不会等于endTime
    seek(pageData.value.progress - 1)
}

/**
 * @description 播放控制条按下时，阻止更新播放条进度数据
 */
const handleSliderMouseDown = () => {
    pageData.value.lockSlider = true
}

/**
 * @description 播放控制条松开时，继续更新播放条进度数据
 */
const handleSliderMouseUp = () => {
    setTimeout(() => {
        pageData.value.lockSlider = false
    }, 10)
}

/**
 * @description 播放器播放成功
 */
const handleSuccess = () => {
    pageData.value.iconDisabled = false
}

/**
 * @description 弹窗关闭时，停止OCX播放和监听
 */
const beforeClose = () => {
    if (mode.value === 'ocx') {
        stop()
    }
    pageData.value.mounted = false
}

/**
 * @description 关闭弹窗
 */
const close = () => {
    emit('close')
}

/**
 * @description 打开弹窗
 */
const open = () => {
    pageData.value.mounted = true
    pageData.value.progress = startTimeStamp.value
}

/**
 * @description 改变播放的通道
 * @param {number} index
 */
const changeChannel = (index: number) => {
    stop()
    pageData.value.chlIndex = index
    nextTick(() => {
        play()
    })
}

/**
 * @description 获取通道列表
 */
const getChannelList = async () => {
    getChlList({}).then((result) => {
        commLoadResponseHandler(result, ($) => {
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                chlMapping[item.attr('id')] = {
                    chlType: $item('chlType').text(),
                }
            })
        })
    })
}

/**
 * @description 重置播放器
 */
const reset = () => {
    pageData.value.stop = true
    pageData.value.iconDisabled = false
    pageData.value.paused = true
    pageData.value.progress = startTimeStamp.value
}

/**
 * @description OCX通知监听
 * @param {Function} $
 */
const ocxNotify = ($: XMLQuery, stateType: string) => {
    if (stateType === 'connectstate') {
        if ($('statenotify').text() === 'success') {
            const sendXML = OCX_XML_SetRecPlayMode('SYNC')
            playerRef.value!.plugin.ExecuteCmd(sendXML)
            play()
        }
    }

    if (stateType === 'RecCurPlayTime') {
        if (pageData.value.lockSlider) {
            return
        }
        const seconds = $('statenotify/win[@index="0"]').text().num()
        pageData.value.progress = seconds
    }

    if (stateType === 'CurrentSelectedWindow') {
        if ($('statenotify/playStatus').text() === 'STOP') {
            pageData.value.iconDisabled = false
        }
    }

    if (stateType === 'RecPlay') {
        if ($('statenotify/errorCode').length) {
            reset()
        }
    }
    // StartViewChl
    if (stateType === 'StartViewChl') {
        const status = $('statenotify/status').text()
        const chlId = $('statenotify/chlId').text()
        const winIndex = $('statenotify/winIndex').text().num()
        if (status.trim() === 'success') {
            if (systemCaps.supportPOS) {
                //设置通道是否显示POS信息
                playerRef.value!.plugin.ExecuteCmd(posInfo(true, chlId, winIndex))
            }
        }
    }
}

onMounted(() => {
    getChannelList()
})
</script>

<script lang="ts">
export class PlaybackPopList {
    chlId = ''
    chlName = ''
    eventList: string[] = []
    startTime = 0 // 时间戳 （毫秒）
    endTime = 0 // 时间戳 （毫秒）
}
</script>

<style lang="scss" scoped>
.RecordPop {
    .main {
        width: 100%;
        display: flex;
        height: 350px;
    }

    .chl {
        width: 230px;
        height: 350px;
        border: 1px solid var(--content-border);
    }

    .player {
        width: 600px;
        height: 350px;
        flex-shrink: 0;
    }

    .control-bar {
        margin-top: 10px;
        width: 100%;
        display: flex;
        align-items: center;
        height: 22px;
    }

    .start-time,
    .end-time {
        padding: 5px;
        font-size: 12px;
        width: 80px;
        flex-shrink: 0;
        text-align: left;
        line-height: 1;
    }

    .end-time {
        text-align: right;
    }

    .control-btns {
        margin-top: 10px;
        width: 100%;
        height: 58px;
        display: flex;
        align-items: center;
    }

    .current-time {
        font-size: 18px;
        margin-left: 15px;
        margin-right: 70px;
    }

    .btn {
        margin-right: 30px;
    }
}
</style>
