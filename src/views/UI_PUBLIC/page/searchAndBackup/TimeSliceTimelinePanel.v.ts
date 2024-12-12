/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 16:50:21
 * @Description: 时间切片-时间线界面
 */
import dayjs from 'dayjs'
import TimeSliceItem from './TimeSliceItem.vue'
import WebsocketKeyframe from '@/utils/websocket/websocketKeyframe'
import { type WebsocketKeyframeOnMessageParam } from '@/utils/websocket/websocketKeyframe'
import { type PlaybackChlTimeSliceList, type PlaybackRecList, type PlaybackBackUpRecList } from '@/types/apiType/playback'
import BackupPop from '../searchAndBackup/BackupPop.vue'
import BackupLocalPop from '../searchAndBackup/BackupLocalPop.vue'
import { type TVTPlayerWinDataListItem } from '@/utils/wasmPlayer/tvtPlayer'
import TimeSliceTimeRangePop from './TimeSliceTimeRangePop.vue'

export default defineComponent({
    components: {
        TimeSliceItem,
        TimeSliceTimeRangePop,
        BackupPop,
        BackupLocalPop,
    },
    props: {
        /**
         * @property 当前面包屑模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
        /**
         * @property 通道名称
         */
        chlName: {
            type: String,
            required: true,
        },
        /**
         * @property 通道录像开始时间
         */
        chlStartTime: {
            type: Number,
            required: true,
        },
        /**
         * @property 录像开始时间
         */
        recStartTime: {
            type: Number,
            required: true,
        },
    },
    emits: {
        change(mode: string, timestamp: number) {
            return typeof timestamp === 'number' && typeof mode === 'string'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const router = useRouter()
        const systemCaps = useCababilityStore()
        const userAuth = useUserChlAuth()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 模式选项
            modeOptions: [
                {
                    value: 'year',
                    label: Translate('IDCS_YEAR_ALL'),
                    hidden: 'day',
                    options: [
                        {
                            value: 'month',
                            label: Translate('IDCS_MONTH_ALL'),
                        },
                    ],
                    disabled: true,
                },
                {
                    value: 'month',
                    label: Translate('IDCS_MONTH_ALL'),
                    hidden: 'month',
                    options: [
                        {
                            value: 'day',
                            label: Translate('IDCS_DAY_ALL'),
                        },
                    ],
                    disabled: true,
                },
                {
                    value: 'day',
                    label: Translate('IDCS_DAY_ALL'),
                    hidden: 'year',
                    options: [
                        {
                            value: 'hour',
                            label: Translate('IDCS_HOUR_ALL'),
                        },
                        {
                            value: 'minute',
                            label: Translate('IDCS_MINUTE_ALL'),
                        },
                    ],
                    disabled: false,
                },
            ],
            // 当前模式
            mode: 'year',
            // 当前切片
            sliceType: 'month',
            // 事件图例
            legend: [
                {
                    value: 'MANUAL',
                    name: Translate('IDCS_MANUAL'),
                    children: [],
                    color: '#00FF00',
                },
                {
                    value: 'SENSOR',
                    name: Translate('IDCS_SENSOR'),
                    children: [],
                    color: '#FF0000',
                },
                {
                    value: 'INTELLIGENT',
                    name: Translate('IDCS_AI_ALL'),
                    children: ['FACEDETECTION', 'FACEMATCH', 'VEHICLE', 'TRIPWIRE', 'INVADE', 'AOIENTRY', 'AOILEAVE', 'FIREPOINT', 'TEMPERATURE'],
                    color: '#02B4B4',
                },
                {
                    value: 'MOTION',
                    name: Translate('IDCS_MOTION_DETECTION'),
                    children: ['MOTION', 'SMDHUMAN', 'SMDVEHICLE'],
                    color: '#fefc0b',
                },
                {
                    value: 'POS',
                    name: Translate('IDCS_POS'),
                    children: [],
                    color: '#8000ff',
                },
                {
                    value: 'SCHEDULE',
                    name: Translate('IDCS_SCHEDULE'),
                    children: [],
                    color: '#0080FF',
                },
            ],
            // 时间轴是否开启遮罩 （mode=day时候开启）
            timelineEnableMask: false,
            // 时间切片列表
            timeSliceList: [] as PlaybackChlTimeSliceList[],
            // 当前时间切片的TaskID
            activeTimeSlice: '',
            // 有效的时间切片数
            timeSliceCount: 0,
            // 录像日志列表
            recList: [] as PlaybackRecList[],
            // 是否打开本地备份弹窗（H5）
            isLocalBackUpPop: false,
            // 是否打开备份弹窗
            isBackUpPop: false,
            // 录像备份列表
            backupRecList: [] as PlaybackBackUpRecList[],
            // 是否打开选择时间范围弹窗
            isTimeRangePop: false,
        })

        const formData = ref({
            // 备份开始时间
            startTime: 0,
            // 备份结束时间
            endTime: 0,
            // 备份文件大小
            size: 0,
        })

        const playerData = ref({
            // 播放开始时间
            startTime: 0,
            // 播放结束时间
            endTime: 0,
            // 播放当前时间
            currentTime: 0,
            // 是否锁定滑块
            lockSlider: false,
        })

        // 备份事件列表
        const EVENTS = ['MANUAL', 'SENSOR', 'MOTION', 'SCHEDULE']
        if (systemCaps.ipChlMaxCount) {
            EVENTS.push('INTELLIGENT')
        }

        if (systemCaps.supportPOS) {
            EVENTS.push('POS')
        }

        const timelineRef = ref<TimelineInstance>()
        const playerRef = ref<PlayerInstance>()

        const plugin = setupPlugin({
            onReady: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Playback')
                    plugin.ExecuteCmd(sendXML)
                }
            },
            onDestroy: (mode, plugin) => {
                if (mode.value === 'ocx') {
                    const sendXML = OCX_XML_StopPreview('ALL')
                    plugin.ExecuteCmd(sendXML)
                }
            },
        })

        // 播放器模式
        const mode = computed(() => {
            return plugin.IsSupportH5() ? 'h5' : 'ocx'
        })

        /**
         * @description 日期时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 时间格式化
         * @param {number} timestamp 毫秒
         * @returns {String}
         */
        const displayTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.timeFormat)
        }

        // 时长
        const duration = computed(() => {
            const seconds = (formData.value.endTime - formData.value.startTime) / 1000
            if (seconds >= 3600) {
                return getTranslateForMin(Math.floor(seconds / 60))
            } else {
                return getTranslateForSecond(seconds)
            }
        })

        let keyframe: WebsocketKeyframe

        // 当前模式项
        const modeItem = computed(() => {
            const find = pageData.value.modeOptions.find((item) => item.value === pageData.value.mode)
            if (find) {
                return find
            }
            return pageData.value.modeOptions[0]
        })

        watch(modeItem, () => {
            pageData.value.sliceType = modeItem.value.options[0].value
        })

        watch(
            () => formData.value.startTime,
            () => {
                recSizeTimer.repeat()
            },
        )

        watch(
            () => formData.value.endTime,
            () => {
                recSizeTimer.repeat()
            },
        )

        /**
         * @description 获取时间范围内录像文件大小
         */
        const recSizeTimer = useRefreshTimer(() => {
            getRecDataSize()
        }, 200)

        /**
         * @description 获取时间范围内录像文件大小
         */
        const getRecDataSize = async () => {
            const startTime = formData.value.startTime
            const endTime = formData.value.endTime
            if (startTime === 0 || endTime === 0) {
                formData.value.size = 0
                return
            }
            const sendXml = rawXml`
                <condition>
                    <chlId>${prop.chlId}</chlId>
                    <startTime>${Math.floor(formData.value.startTime / 1000)}</startTime>
                    <endTime>${Math.floor(formData.value.endTime / 1000)}</endTime>
                    <eventType>all</eventType>
                </condition>
            `
            const result = await queryRecDataSize(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                if (formData.value.startTime === startTime && formData.value.endTime === endTime) {
                    const size = $('content/dataSize').text().num()
                    formData.value.size = size
                }
            } else {
                formData.value.size = 0
            }
        }

        /**
         * @description 格式化备份文件的大小值
         * @param {Number} size
         * @returns {String}
         */
        const displaySize = (size: number) => {
            if (size > 1024) {
                return (size / 1024).toFixed(2) + 'GB'
            }
            return size + 'MB'
        }

        /**
         * @description 格式化切片的时间显示
         * @param {Number} time
         * @returns {String}
         */
        const displayThumbnailTime = (time: number) => {
            if (pageData.value.mode === 'year') {
                return formatDate(time, dateTime.yearMonthFormat)
            }

            if (pageData.value.mode === 'month') {
                return formatDate(time, dateTime.dateFormat)
            }
            return formatDate(time, dateTime.timeFormat)
        }

        /**
         * @description 播放
         * @param {Number} startTime 毫秒
         */
        const play = (startTime: number) => {
            stop()

            playerData.value.startTime = startTime
            playerData.value.endTime = startTime + 30 * 60 * 1000

            timelineRef.value!.setTime(playerData.value.startTime)

            playerRef.value?.player.play({
                chlID: prop.chlId,
                chlName: prop.chlName,
                startTime: Math.floor(playerData.value.startTime / 1000),
                endTime: Math.floor(playerData.value.endTime / 1000),
                streamType: 1, // 0主码流，其他子码流
                winIndex: 0,
                showPos: EVENTS.includes('POS'),
            })
        }

        /**
         * @description 停止播放
         */
        const stop = () => {
            playerRef.value?.player.stop(0)
            playerData.value.startTime = 0
            playerData.value.endTime = 0
            playerData.value.currentTime = 0
        }

        /**
         * @description seek回放时间点
         * @param {number} timestamp 时间戳，单位 毫秒
         */
        const seek = (timestamp: number) => {
            const currentTime = Math.floor(timestamp / 1000)
            playerRef.value!.player.seek(currentTime)
            timelineRef.value?.setTime(currentTime)
        }

        /**
         * @description 按下播放器控制条
         */
        const handleSliderMouseDown = () => {
            playerData.value.lockSlider = true
        }

        /**
         * @description 松开播放器控制条
         */
        const handleSliderMouseUp = () => {
            setTimeout(() => {
                playerData.value.lockSlider = false
            }, 10)
        }

        /**
         * @description 控制条发生变化
         */
        const handleSliderChange = () => {
            seek(playerData.value.currentTime - 1)
        }

        /**
         * @description 播放器TimeUpdate回调
         * @param {Number} index
         * @param {TVTPlayerWinDataListItem} data
         * @param {Number} timestamp
         */
        const handlePlayerTimeUpdate = (_index: number, _data: TVTPlayerWinDataListItem, timestamp: number) => {
            if (playerData.value.lockSlider) {
                return
            }
            timelineRef.value?.setTime(timestamp / 1000)
            playerData.value.currentTime = timestamp
        }

        /**
         * @description 获取录像开始时间
         * @param {string} mode
         * @param {number} timestamp
         * @returns {number}
         */
        const getRecTime = (mode: string, timestamp: number) => {
            if (!pageData.value.recList.length || !pageData.value.recList[0].records.length) {
                return 0
            }

            let startTime = 0

            if (mode === 'year') {
                return pageData.value.recList[0].records[0].startTime
            }

            if (mode === 'month') {
                if (pageData.value.mode === 'day') {
                    return timestamp
                }

                const month = dayjs(timestamp).month()
                pageData.value.recList[0].records.some((item) => {
                    const startMonth = dayjs(item.startTime).month()
                    const endMonth = dayjs(item.endTime).month()
                    if (month >= startMonth && month <= endMonth) {
                        startTime = item.startTime
                        return true
                    }
                    return false
                })
                return startTime
            }

            const date = dayjs(timestamp).local().date()
            pageData.value.recList[0].records.some((item) => {
                const startDate = dayjs(item.startTime).local().date()
                const endDate = dayjs(item.endTime).local().date()
                if (date >= startDate && date <= endDate) {
                    startTime = item.startTime
                    return true
                }
                return false
            })
            return startTime
        }

        /**
         * @description 没有数据时弹窗
         */
        const handleNoData = () => {
            openMessageBox({
                type: 'info',
                message: Translate('IDCS_NO_RECORD_DATA'),
            })
        }

        /**
         * @description 时间轴跳转播放
         */
        const handleTimelineSeek = () => {
            if (pageData.value.sliceType === 'minute') {
                getTimeSliceList()
            }
        }

        /**
         * @description 时间轴双击 下钻
         * @param {Number} pointerTime
         */
        const handleTimelineDblclick = (pointerTime: number) => {
            if (pageData.value.mode === 'day') {
                return
            }

            const mode = pageData.value.mode === 'month' ? 'day' : 'month'
            const currentTime = getRecTime(mode, pointerTime * 1000)
            if (!currentTime) {
                handleNoData()
                return
            }
            updateMode(mode, currentTime)
        }

        /**
         * @description 时间轴遮罩改变回调
         * @param {Array} value
         */
        const handleTimelineChangeMask = (value: [number, number]) => {
            const startTime = Math.min(...value)
            const endTime = Math.max(...value)
            formData.value.startTime = startTime * 1000
            formData.value.endTime = endTime * 1000
        }

        /**
         * @description 时间轴遮罩清除回调
         */
        const handleTimelineClearMask = () => {
            formData.value.startTime = 0
            formData.value.endTime = 0
        }

        /**
         * @description 改变切片模式
         */
        const changeMode = () => {
            const mode = pageData.value.mode
            const pointerTime = timelineRef.value!.getPointerTime() * 1000
            const currentTime = getRecTime(mode, pointerTime)
            if (!currentTime) {
                handleNoData()
                return
            }
            updateMode(mode, currentTime)
        }

        const timeSliceTimer = useRefreshTimer(() => {}, 300)

        /**
         * @description 播放当前切片
         * @param {number} startTime
         * @param {number} endTime
         * @param {string} taskId
         */
        const playTimeSlice = (startTime: number, endTime: number, taskId: string) => {
            timeSliceTimer.update(() => {
                play(startTime)
                pageData.value.activeTimeSlice = taskId
                if (pageData.value.mode === 'day') {
                    formData.value.startTime = startTime
                    formData.value.endTime = endTime
                    timelineRef.value!.drawTimeRangeMask(startTime / 1000, endTime / 1000)
                }
            })
            timeSliceTimer.repeat()
        }

        /**
         * @description 双击当前切片 改变切片模式
         * @param {number} pointerTime
         */
        const changeTimeSlice = (pointerTime: number) => {
            timeSliceTimer.stop()
            if (pageData.value.mode === 'day') {
                if (pageData.value.sliceType === 'hour') {
                    pageData.value.sliceType = 'minute'
                    getTimeSliceList()
                }
                return
            }
            const mode = pageData.value.mode === 'month' ? 'day' : 'month'
            const currentTime = getRecTime(mode, pointerTime)
            if (!currentTime) {
                handleNoData()
                return
            }
            updateMode(mode, currentTime)
        }

        /**
         * @description 更新切片模式
         * @param {string} mode
         * @param {number} currentTime
         */
        const updateMode = (mode: string, currentTime: number) => {
            ctx.emit('change', mode, currentTime)
        }

        watch(
            () => prop.mode,
            (mode) => {
                stop()

                if (mode === 'chl') {
                    return
                }

                nextTick(async () => {
                    pageData.value.mode = mode

                    timelineRef.value!.clearTimeRangeMask()
                    formData.value.startTime = 0
                    formData.value.endTime = 0

                    if (mode === 'year') {
                        timelineRef.value!.setMode({
                            mode,
                            startDate: dayjs(prop.recStartTime).subtract(3, 'month').format('YYYY/MM/DD'),
                            monthNum: 5,
                        })
                    } else if (mode === 'month') {
                        timelineRef.value!.setMode({
                            mode,
                            startDate: dayjs(prop.chlStartTime).format('YYYY/MM/DD'),
                        })
                    } else if (mode === 'day') {
                        timelineRef.value!.setMode({
                            mode,
                            startDate: dayjs(prop.chlStartTime).format('YYYY/MM/DD'),
                        })
                    }

                    pageData.value.timelineEnableMask = mode === 'day'

                    await getRecList()
                    getTimeSliceList()

                    timelineRef.value!.updateChlList(pageData.value.recList, true, 'live')
                    if (pageData.value.recList.length && pageData.value.recList[0].records.length) {
                        timelineRef.value!.setTime(pageData.value.recList[0].records[0].startTime / 1000)
                    }
                })
            },
        )

        watch(
            () => pageData.value.sliceType,
            () => {
                stop()
            },
        )

        /**
         * @description 获取录像日志列表
         */
        const getRecList = async () => {
            const startTime = timelineRef.value!.getMinTime() * 1000
            const endTime = timelineRef.value!.getMaxTime() * 1000

            const sendXml = rawXml`
                <types>
                    <recType>${wrapEnums(['MOTION', 'SCHEDULE', 'SENSOR', 'MANUAL', 'INTELLIGENT', 'POS', 'NORMALALL', 'FACEDETECTION', 'FACEMATCH', 'VEHICLE', 'TRIPWIRE', 'INVADE', 'AOIENTRY', 'AOILEAVE', 'ITEMCARE', 'CROWDDENSITY', 'EXCEPTION'])}</recType>
                </types>
                <requireField>
                    <chl/>
                    <recList>
                        <item>
                            <recType/>
                            <startTime/>
                            <endTime/>
                            <size/>
                        </item>
                    </recList>
                </requireField>
                <condition>
                    <modeType>modeOne</modeType>
                    <startTime>${formatDate(startTime, 'YYYY-MM-DD HH:mm:ss')}</startTime>
                    <endTime>${formatDate(endTime, 'YYYY-MM-DD HH:mm:ss')}</endTime>
                    <startTimeEx>${localToUtc(startTime)}</startTimeEx>
                    <endTimeEx>${localToUtc(endTime)}</endTimeEx>
                    <recType type='list'>
                        <itemType type='recType'/>
                        ${pageData.value.legend.map((item) => `<item>${item.value}</item>`).join('')}
                    </recType>
                    <chl type='list'>
                        <item id="${prop.chlId}"></item>
                    </chl>
                </condition>
            `
            const result = await queryChlRecLog(sendXml)
            const $ = queryXml(result)
            if ($('status').text() !== 'success') {
                return
            }

            if (startTime !== timelineRef.value!.getMinTime() * 1000) {
                return
            }
            pageData.value.recList = $('content/chl/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    chlId: item.attr('id'),
                    chlName: $item('name').text(),
                    records: $item('recList/item').map((rec) => {
                        const $rec = queryXml(rec.element)
                        const startTime = dayjs.utc($rec('startTime').text()).valueOf()
                        const endTime = dayjs.utc($rec('endTime').text()).valueOf()
                        const size = $rec('size').text()
                        const recType = $rec('recType').text()
                        const recSubType = $rec('recSubType').text()

                        return {
                            startTime,
                            endTime,
                            event: recType,
                            recSubType,
                            size: size ? size + 'MB' : '--',
                            duration: dayjs.utc(endTime - startTime).format('HH:mm:ss'),
                        }
                    }),
                    timeZone: $item('recList').attr('timeZone'),
                }
            })
        }

        /**
         * @description 创建Websocket连接
         */
        const createWebsocket = () => {
            keyframe = new WebsocketKeyframe({
                onmessage: (data: WebsocketKeyframeOnMessageParam) => {
                    pageData.value.timeSliceList.forEach((item) => {
                        if (data.taskId.toUpperCase() === item.taskId) {
                            item.imgUrl = data.imgUrl
                            item.frameTime = data.frameTime * 1000
                            pageData.value.timeSliceCount++
                        }
                    })
                },
            })
        }

        /**
         * @description 获取时间切片列表
         */
        const getTimeSliceList = () => {
            let timeList: { startTime: number; endTime: number }[] = []
            if (pageData.value.sliceType === 'minute') {
                timeList = timelineRef.value!.getMinuteSplitList()
            } else {
                timeList = timelineRef.value!.getTimeSplitList()
            }

            pageData.value.timeSliceCount = 0
            keyframe.checkReady(() => {
                pageData.value.timeSliceList = []
                keyframe.stopAll()
                timeList.forEach((item) => {
                    const taskId = keyframe
                        .start({
                            chlId: prop.chlId,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            frameNum: 1,
                        })
                        .toUpperCase()
                    pageData.value.timeSliceList.push({
                        startTime: item.startTime * 1000,
                        endTime: item.endTime * 1000,
                        taskId,
                        frameTime: 0,
                        imgUrl: '',
                    })
                })
            })
        }

        /**
         * @description 改变时间切片 小时/分
         */
        const changeSliceType = () => {
            stop()
            if (pageData.value.sliceType === 'minute') {
                const find = pageData.value.timeSliceList.find((item) => !!pageData.value.activeTimeSlice && pageData.value.activeTimeSlice === item.taskId)
                if (find) {
                    timelineRef.value!.setTime(find.startTime / 1000)
                }
            }
            getTimeSliceList()
        }

        /**
         * @description 备份
         */
        const backUp = () => {
            if (mode.value === 'ocx' && plugin.BackUpTask.isExeed(1)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(plugin.BackUpTask.limit),
                })
                return
            }
            pageData.value.backupRecList = [
                {
                    chlId: prop.chlId,
                    chlName: prop.chlName,
                    events: EVENTS,
                    startTime: formData.value.startTime,
                    endTime: formData.value.endTime,
                    streamType: 1,
                },
            ]

            pageData.value.isBackUpPop = true
        }

        /**
         * @description 确认备份
         * @param {string} type
         * @param {string} path
         * @param {string} format
         */
        const confirmBackUp = (type: string, path: string, format: string) => {
            if (type === 'local') {
                if (mode.value === 'h5') {
                    pageData.value.isLocalBackUpPop = true
                }

                if (mode.value === 'ocx') {
                    plugin.BackUpTask.addTask(pageData.value.backupRecList, path, format)
                    router.push({
                        path: '/search-and-backup/backup-state',
                    })
                }
                pageData.value.isBackUpPop = false
            } else {
                pageData.value.isBackUpPop = false
            }
        }

        /**
         * @description 打开选取时间范围弹窗
         */
        const showTimeRange = () => {
            pageData.value.isTimeRangePop = true
        }

        /**
         * @description 确认选取时间范围，关闭弹窗
         * @param {number} startTime
         * @param {number} endTime
         */
        const confirmTimeRange = (startTime: number, endTime: number) => {
            formData.value.startTime = startTime
            formData.value.endTime = endTime
            pageData.value.isTimeRangePop = false
        }

        onMounted(() => {
            createWebsocket()
        })

        onBeforeUnmount(() => {
            keyframe?.destroy()
        })

        return {
            dateTime,
            pageData,
            playerData,
            formData,
            modeItem,
            changeTimeSlice,
            playTimeSlice,
            changeMode,
            timelineRef,
            playerRef,
            displayTime,
            displayDateTime,
            displaySize,
            displayThumbnailTime,
            duration,
            handleTimelineSeek,
            handleTimelineClearMask,
            handleTimelineChangeMask,
            handleTimelineDblclick,
            handleSliderMouseDown,
            handleSliderMouseUp,
            handleSliderChange,
            changeSliceType,
            handlePlayerTimeUpdate,
            play,
            userAuth,
            backUp,
            confirmBackUp,
            showTimeRange,
            confirmTimeRange,
        }
    },
})
