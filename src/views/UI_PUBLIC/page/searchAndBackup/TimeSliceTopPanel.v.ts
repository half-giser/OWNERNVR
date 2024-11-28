/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-14 16:59:30
 * @Description: 时间切片-概览界面(按通道/按时间)
 */
import dayjs from 'dayjs'
import { type PlaybackTimeSliceChlList, type PlaybackTimeSliceList } from '@/types/apiType/playback'
import TimeSliceItem from './TimeSliceItem.vue'
import WebsocketKeyframe, { type WebsocketKeyframeOnMessageParam } from '@/utils/websocket/websocketKeyframe'

export default defineComponent({
    components: {
        TimeSliceItem,
    },
    emits: {
        startTime(time: number) {
            return typeof time === 'number'
        },
        change(mode: string, chlId: string, chlName: string, chlTime: number) {
            return typeof mode === 'string' && typeof chlId === 'string' && typeof chlName === 'string' && typeof chlTime === 'number'
        },
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 允许显示缩略图的最大数量64
        const MAX_THUMBNAIL_SHOW_COUNTS = 64
        // 按时间最大显示数量192,超过此数量时按时间选项禁用
        const MAX_SHOW_COUNTS_BYTIME = 192

        // 通道ID与通道名称的映射
        const chlMap = ref<Record<string, string>>({})
        // taskID与索引值的映射
        const timesliceMap: Record<string, [number, number]> = {}
        // 通道录像数据数组
        const chlTimeSliceMap: { startTime: number; endTime: number; chlId: string; chlName: string }[] = []

        let keyframe: WebsocketKeyframe
        // 时间切片列表加载完成Flag
        let timesliceFlag = false
        // 通道列表加载完成Flag
        let chlFlag = false

        const pageData = ref({
            // 视图选项
            viewOptions: [
                {
                    value: 'time',
                    label: Translate('IDCS_TIME'),
                },
                {
                    value: 'chl',
                    label: Translate('IDCS_CHANNEL'),
                },
            ],
            // 当前视图选项
            viewOption: 'time',
            // 通道列表
            chlList: [] as PlaybackTimeSliceChlList[],
            // 录像时间列表
            recTimeList: [] as number[],
            // 时间切片列表
            chlTimeSliceList: [] as PlaybackTimeSliceList[],
            // 时间切片数量
            timesliceCount: 0,
            // 当前选中的切片
            select: null as null | { chlId: string; chlName: string; startTime: number; taskId: string },
        })

        const viewOptions = computed(() => {
            return pageData.value.viewOptions.map((item) => {
                let disabled = false
                if (item.value !== 'chl') {
                    if (pageData.value.timesliceCount > MAX_SHOW_COUNTS_BYTIME) {
                        disabled = true
                    }
                }
                return {
                    ...item,
                    disabled,
                }
            })
        })

        // 时间切片的卡片样式
        const timeSliceCardMode = computed(() => {
            return pageData.value.timesliceCount > MAX_THUMBNAIL_SHOW_COUNTS ? 'icon' : 'thumbnail'
        })

        // 通道的卡片样式
        const chlCardMode = computed(() => {
            return pageData.value.chlList.length > MAX_THUMBNAIL_SHOW_COUNTS ? 'icon' : 'thumbnail'
        })

        /**
         * @description 获取通道列表
         */
        const getChlsList = async () => {
            const result = await queryChlsExistRec()
            const $ = queryXml(result)

            chlMap.value = {}

            if ($('status').text() === 'success') {
                pageData.value.chlList = $('content/item').map((item) => {
                    const id = item.attr('id')

                    chlMap.value[id] = item.text()

                    return {
                        chlId: id,
                        chlName: item.text(),
                        imgUrl: '',
                        frameTime: 0,
                        taskId: '',
                    }
                })
            }
        }

        /**
         * @description 获取回放时间列表
         * @param {Array} chlList
         */
        const getRecSection = async () => {
            const year = dayjs().year()
            const startTime = dayjs(`${year - 10}-01-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
            const endTime = dayjs(`${year + 10}-01-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
            const spaceTime = 60 * 60 * 24
            const spaceNum = (endTime.valueOf() - startTime.valueOf()) / 1000 / spaceTime

            const sendXml = rawXml`
                <condition>
                    <startTime>${localToUtc(startTime)}</startTime>
                    <spaceTime>${spaceTime}</spaceTime>
                    <spaceNum>${spaceNum}</spaceNum>
                    <chlId type="list">
                        ${pageData.value.chlList.map((item) => `<item>${item.chlId}</item>`).join('')}
                    </chlId>
                </condition>
            `
            const result = await queryRecSection(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.recTimeList = $('content/item').map((item) => {
                    const index = item.text().num()
                    const utcTime = startTime.add(index, 'day')
                    return utcTime.valueOf()
                })
            }
        }

        /**
         * @description 获取分日的通道录像列表数据
         */
        const getRecChlByDates = async () => {
            const items = pageData.value.recTimeList
                .map((timestamp) => {
                    const startTime = dayjs(timestamp).hour(0).minute(0).second(0).valueOf() / 1000
                    const endTime = dayjs(timestamp).hour(23).minute(59).second(59).valueOf() / 1000
                    return `<item start="${startTime}" end="${endTime}"></item>`
                })
                .join('')
            const sendXml = `<condition>${items}</condition>`
            const result = await queryDateListRecChl(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.chlTimeSliceList = $('content/item')
                    .map((item, index) => {
                        const startTime = item.attr('start').num() * 1000
                        const endTime = item.attr('end').num() * 1000
                        if (index === 0) {
                            ctx.emit('startTime', startTime)
                        }
                        const $item = queryXml(item.element)
                        return {
                            startTime,
                            endTime,
                            chlList: $item('chl/item').map((chl) => {
                                const chlId = chl.attr('id')
                                const chlName = chl.text()
                                chlTimeSliceMap.push({
                                    chlId,
                                    chlName,
                                    startTime,
                                    endTime,
                                })
                                return {
                                    chlId,
                                    chlName,
                                    imgUrl: '',
                                    frameTime: 0,
                                    taskId: '',
                                }
                            }),
                        }
                    })
                    .toReversed()

                pageData.value.timesliceCount = $('content/item/chl/item').length
            }
        }

        /**
         * @description 格式化日期
         * @param {Number} timestamp 毫秒 时间戳
         */
        const displayDate = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateFormat)
        }

        /**
         * @description 初始化获取关键帧的websocket
         */
        const createWebsocketKeyframe = () => {
            keyframe = new WebsocketKeyframe({
                onmessage: (data: WebsocketKeyframeOnMessageParam) => {
                    if (timesliceMap[data.taskId.toUpperCase()]) {
                        const [index, chlIndex] = timesliceMap[data.taskId.toUpperCase()]
                        pageData.value.chlTimeSliceList[index].chlList[chlIndex].imgUrl = data.imgUrl
                        pageData.value.chlTimeSliceList[index].chlList[chlIndex].frameTime = data.frameTime
                    }
                },
            })
        }

        /**
         * @description 获取通道缩略图(按时间查看)
         */
        const getThumbnailForTimeSlice = () => {
            if (pageData.value.timesliceCount > MAX_THUMBNAIL_SHOW_COUNTS) {
                // 创建一个虚拟的task id，供组件渲染
                pageData.value.chlTimeSliceList.forEach((item, index) => {
                    item.chlList.forEach((chl, chlIndex) => {
                        chl.taskId = getNonce() + ''
                        timesliceMap[chl.taskId] = [index, chlIndex]
                    })
                })
                return
            }

            if (timesliceFlag) {
                return
            }

            timesliceFlag = true
            keyframe.checkReady(() => {
                pageData.value.chlTimeSliceList.forEach((item, index) => {
                    item.chlList.forEach((chl, chlIndex) => {
                        const startTime = item.startTime / 1000
                        const endTime = item.endTime / 1000
                        chl.taskId = keyframe
                            .start({
                                chlId: chl.chlId,
                                startTime,
                                endTime,
                                frameNum: 1,
                            })
                            .toUpperCase()
                        timesliceMap[chl.taskId] = [index, chlIndex]
                    })
                })
            })
        }

        /**
         * @description 获取通道实时抓拍缩略图
         */
        const getThumbnailForChl = async () => {
            if (pageData.value.chlList.length > MAX_THUMBNAIL_SHOW_COUNTS) {
                return
            }

            if (chlFlag) {
                return
            }
            chlFlag = true
            for (let i = 0; i < pageData.value.chlList.length; i++) {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${pageData.value.chlList[i].chlId}</chlId>
                    </condition>
                `
                try {
                    const result = await snapChlPicture(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        const imgUrl = wrapBase64Img($('content/item').text())
                        pageData.value.chlList[i].imgUrl = imgUrl
                    }
                } catch {}
            }
        }

        /**
         * @description 时间格式化
         * @param {Number} timestamp 毫秒 时间戳
         */
        const displayTime = (timestamp: number) => {
            if (!timestamp) {
                return ''
            }
            return formatDate(timestamp, dateTime.timeFormat)
        }

        /**
         * @description 选中当前切片
         * @param {Object} selectItem
         * @param {Number} startTime
         */
        const handleSelect = (selectItem: PlaybackTimeSliceChlList, startTime = 0) => {
            if (pageData.value.viewOption === 'chl') {
                pageData.value.select = {
                    chlId: selectItem.chlId,
                    chlName: selectItem.chlName,
                    taskId: '',
                    startTime: chlTimeSliceMap.find((item) => item.chlId === selectItem.chlId)!.startTime,
                }
            } else {
                pageData.value.select = {
                    chlId: selectItem.chlId,
                    chlName: selectItem.chlName,
                    taskId: selectItem.taskId,
                    startTime,
                }
            }
        }

        /**
         * @description 查看当前选中的切片
         */
        const handleOpen = () => {
            const select = pageData.value.select!
            const mode = pageData.value.viewOption === 'chl' ? 'month' : 'day'
            ctx.emit('change', mode, select.chlId, select.chlName, select.startTime)
        }

        watch(
            () => pageData.value.viewOption,
            (viewOption) => {
                pageData.value.select = null
                if (viewOption === 'chl') {
                    getThumbnailForChl()
                } else {
                    getThumbnailForTimeSlice()
                }
            },
        )

        onMounted(async () => {
            createWebsocketKeyframe()
            await getChlsList()
            await getRecSection()
            await getRecChlByDates()
            if (pageData.value.timesliceCount > MAX_SHOW_COUNTS_BYTIME) {
                pageData.value.viewOption = 'chl'
            }
            getThumbnailForTimeSlice()
        })

        onBeforeUnmount(() => {
            keyframe?.destroy()
        })

        return {
            pageData,
            displayDate,
            handleSelect,
            handleOpen,
            timeSliceCardMode,
            chlCardMode,
            displayTime,
            viewOptions,
            TimeSliceItem,
        }
    },
})
