/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 11:34:22
 * @Description: 回放弹窗（OCX+H5）
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:41:37
 */
import { type RecPlayList } from '@/types/apiType/rec'
import BaseVideoPlayer from '../../components/player/BaseVideoPlayer.vue'
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import dayjs from 'dayjs'
import { type TVTPlayerWinDataListItem } from '@/utils/wasmPlayer/tvtPlayer'
import { type XmlResult } from '@/utils/xmlParse'

export default defineComponent({
    components: {
        BaseVideoPlayer,
        BaseImgSprite,
    },
    props: {
        playList: {
            type: Array as PropType<RecPlayList[]>,
            require: true,
            default: () => [],
        },
    },
    emits: {
        close() {
            return true
        },
        status(type: string, winList: { winIndex: number; chlId: string }) {
            return type && winList
        },
    },
    setup(prop, ctx) {
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const dateTime = useDateTime()

        // 通道ID与通道类型映射列表
        const chlMapping: Record<
            string,
            {
                chlType: string
            }
        > = {}

        const playerRef = ref<PlayerInstance>()

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
                    startTime: '',
                    endTime: '',
                    eventList: [],
                }
            )
        })

        // 开始时间 （format）
        const startTime = computed(() => {
            return dayjs(current.value.startTime, 'YYYY-MM-DD HH:mm:ss').format(dateTime.timeFormat.value)
        })

        // 结束时间 （format）
        const endTime = computed(() => {
            return dayjs(current.value.endTime, 'YYYY-MM-DD HH:mm:ss').format(dateTime.timeFormat.value)
        })

        // 当前时间 （format）
        const currentTime = computed(() => {
            return dayjs(pageData.value.progress * 1000).format(dateTime.dateTimeFormat.value)
        })

        // 开始时间的时间戳（s）
        const startTimeStamp = computed(() => {
            return dayjs(current.value.startTime, 'YYYY-MM-DD HH:mm:ss').valueOf() / 1000
        })

        // 结束时间的时间戳（s）
        const endTimeStamp = computed(() => {
            return dayjs(current.value.endTime, 'YYYY-MM-DD HH:mm:ss').valueOf() / 1000
        })

        /**
         * @description 播放器ready时的回调
         */
        const handleReady = () => {
            if (playerRef.value?.mode === 'h5') {
                play()
            }

            if (playerRef.value?.mode === 'ocx') {
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(OCX_XML_SetPluginModel('ReadOnly', 'Playback'))
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(
                    OCX_XML_SetProperty({
                        calendarType: userSession.calendarType,
                    }),
                )
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(OCX_XML_SetRecPlayMode('SYNC'))
                playerRef.value.plugin.VideoPluginNotifyEmitter.addListener(ocxNotify)
                play()
            }
        }

        /**
         * @description 播放器播放
         */
        const play = () => {
            if (playerRef.value?.mode === 'h5') {
                pageData.value.progress = startTimeStamp.value
                pageData.value.stop = false
                pageData.value.paused = false
                playerRef.value.player.play({
                    chlID: current.value.chlId,
                    chlName: current.value.chlName,
                    startTime: startTimeStamp.value,
                    endTime: endTimeStamp.value,
                    streamType: 1,
                    winIndex: 0,
                    showPos: current.value.eventList.includes('POS'),
                })
            }
            if (playerRef.value?.mode === 'ocx') {
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
                    current.value.startTime,
                    current.value.endTime,
                    [0],
                    [current.value.chlId],
                    [current.value.chlName],
                    eventList,
                    localToUtc(current.value.startTime, 'YYYY-MM-DD HH:mm:ss'),
                    localToUtc(current.value.endTime, 'YYYY-MM-DD HH:mm:ss'),
                )
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                pageData.value.paused = true
            }
        }

        /**
         * @description 播放器恢复播放
         */
        const resume = () => {
            if (pageData.value.iconDisabled) {
                return
            }
            if (playerRef.value?.mode === 'h5') {
                if (pageData.value.stop) {
                    play()
                } else {
                    playerRef.value.player.resume(0)
                    pageData.value.paused = false
                }
            }
            if (playerRef.value?.mode === 'ocx') {
                if (pageData.value.stop) {
                    play()
                } else {
                    const sendXML = OCX_XML_SetPlayStatus('FORWARDS', 0)
                    playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    pageData.value.paused = false
                }
            }
        }

        /**
         * @description 播放器停止播放
         */
        const stop = () => {
            if (pageData.value.iconDisabled) {
                return
            }

            if (playerRef.value?.mode === 'h5') {
                playerRef.value.player.stop(0)
                pageData.value.progress = startTimeStamp.value
                pageData.value.paused = true
                pageData.value.stop = true
            }
            if (playerRef.value?.mode === 'ocx') {
                const sendXML = OCX_XML_SetPlayStatus('STOP')
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
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
            if (playerRef.value?.mode === 'h5') {
                playerRef.value.player.seek(Math.floor(timestamp))
                pageData.value.paused = false
            }
            if (playerRef.value?.mode === 'ocx') {
                const sendXML = OCX_XML_RecCurPlayTime([
                    {
                        index: 0,
                        time: Math.floor(timestamp),
                    },
                ])
                playerRef.value.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                pageData.value.paused = false
            }
        }

        /**
         * @description 播放器进度回调
         * @param timestamp 时间戳（ms）
         */
        const handleTime = (winIndex: number, data: TVTPlayerWinDataListItem, timestamp: number) => {
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
            if (playerRef.value?.mode === 'ocx') {
                stop()
                playerRef.value.plugin.VideoPluginNotifyEmitter.removeListener(ocxNotify)
            }
            pageData.value.mounted = false
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 打开弹窗
         */
        const open = () => {
            pageData.value.mounted = true
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
                    $('/response/content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        chlMapping[item.attr('id')!] = {
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
        const ocxNotify = ($: (path: string) => XmlResult) => {
            if ($('statenotify[@type="connectstate"]').length > 0) {
                if ($('statenotify[@type="connectstate"]').text() === 'success') {
                    const sendXML = OCX_XML_SetRecPlayMode('SYNC')
                    playerRef.value!.plugin.GetVideoPlugin().ExecuteCmd(sendXML)
                    play()
                }
            }

            if ($('statenotify[@type="RecCurPlayTime"]').length > 0) {
                if (pageData.value.lockSlider) {
                    return
                }
                const seconds = Number($('statenotify[@type="RecCurPlayTime"]/win[@index="0"]').text())
                pageData.value.progress = seconds
            }

            if ($('statenotify[@type="CurrentSelectedWindow"]').length > 0) {
                if ($('statenotify[@type="CurrentSelectedWindow"]/playStatus').text() === 'STOP') {
                    pageData.value.iconDisabled = false
                }
            }

            if ($('statenotify[@type="RecPlay"]/errorCode').length > 0) {
                reset()
            }
            // StartViewChl
            if ($('statenotify[@type="StartViewChl"]').length > 0) {
                const status = $('statenotify[@type="StartViewChl"]/status').text()
                const chlId = $('statenotify[@type="StartViewChl"]/chlId').text()
                const winIndex = Number($('statenotify[@type="StartViewChl"]/winIndex').text())
                if (status.trim() === 'success') {
                    if (systemCaps.supportPOS) {
                        //设置通道是否显示POS信息
                        // TODO
                        ctx.emit('status', 'on', { winIndex, chlId })
                    }
                }
            }
        }

        onMounted(() => {
            dateTime.getTimeConfig()
            getChannelList()
        })

        return {
            playerRef,
            systemCaps,
            pageData,
            dialogWidth,
            startTimeStamp,
            endTimeStamp,
            startTime,
            endTime,
            currentTime,
            handleTime,
            handleSuccess,
            beforeClose,
            close,
            open,
            pause,
            stop,
            play,
            resume,
            seek,
            handleReady,
            handleSliderChange,
            handleSliderMouseDown,
            changeChannel,
            handleSliderMouseUp,
            BaseVideoPlayer,
            BaseImgSprite,
        }
    },
})
