/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-13 09:25:37
 * @Description: 智能分析 - 人脸搜索 - 轨迹
 */
import IntelFaceSearchTrackMapColorPop from './IntelFaceSearchTrackMapColorPop.vue'

export default defineComponent({
    components: {
        IntelFaceSearchTrackMapColorPop,
    },
    props: {
        /**
         * @property 播放列表
         */
        data: {
            type: Array as PropType<IntelFaceTrackMapList[]>,
            required: true,
        },
        /**
         * @property 是否打开此视图
         */
        visible: {
            type: Boolean,
            default: false,
        },
    },
    emits: {
        stop() {
            return true
        },
        play(data: IntelFaceTrackMapList) {
            return !!data
        },
        pause() {
            return true
        },
        resume() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        // 通道与通道名的映射
        const chlMap: Record<string, string> = {}
        // 通道与录像数的映射
        let countMap: Record<string, number> = {}
        // 保存一份数据
        let cachePointList: Points[] = []
        // 轨迹数组
        let trackMap: { X: number; Y: number; chlId: string }[] = []

        const canvas = ref<HTMLCanvasElement>()
        const arrowImg = new Image()
        arrowImg.src = '/track_direction.png'

        let context: CanvasRenderingContext2D

        type Points = {
            X: number
            Y: number
            hotPointId: string
            count: number
            chlName: string
        }

        let movingPoint = -1
        let movingX = 0
        let movingY = 0

        const pageData = ref({
            // 播放状态
            playStatus: 'stop',
            // 轨迹状态
            trackStatus: 'play',
            // 编辑状态
            isEdit: false,
            // 通道选项
            chlOptions: [] as SelectOption<string, string>[],
            // 背景图
            emap: '',
            // 文本颜色
            fontColor: '#000',
            // 线条颜色
            lineColor: '#000',
            // 颜色选项
            colorOptions: [] as string[],
            // 画布宽度
            width: 960,
            // 画布高度
            height: 500,
            // IPC列表
            points: [] as Points[],
            // 是否打开颜色弹窗
            isColorPop: false,
            // 是否打开通道弹窗
            isChlPop: false,
            // 当前播放的录像索引
            playingIndex: 0,
        })

        // 去除掉已添加至画布的通道
        const filterChlOptions = computed(() => {
            const selectedChl = pageData.value.points.map((item) => item.hotPointId)
            return pageData.value.chlOptions.filter((item) => !selectedChl.includes(item.value))
        })

        /**
         * @description 获取通道列表
         */
        const getChannelList = async () => {
            const result = await getChlList({
                isContainsDeletedItem: true,
                authList: '@spr,@bk',
            })
            const $ = queryXml(result)
            pageData.value.chlOptions = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                const text = $item('name').text()
                const id = item.attr('id')
                chlMap[id] = text
                return {
                    label: text,
                    value: id,
                }
            })
        }

        /**
         * @description 移动IPC
         * @param {MonseEvent} e
         * @param {number} index
         */
        const handleMouseDown = (e: MouseEvent, index: number) => {
            if (!pageData.value.isEdit) {
                return
            }
            movingPoint = index
            movingX = e.clientX
            movingY = e.clientY
        }

        /**
         * @description 移动IPC
         * @param {MouseEvent} e
         */
        const handleMouseMove = (e: MouseEvent) => {
            if (movingPoint < 0) {
                return
            }
            const deltaX = clamp(e.clientX - movingX + pageData.value.points[movingPoint].X, 0, pageData.value.width)
            const deltaY = clamp(e.clientY - movingY + pageData.value.points[movingPoint].Y, 0, pageData.value.height)
            const element = document.querySelector('.map-point-' + movingPoint) as HTMLElement
            element.style.transform = `translate(${deltaX}px,${deltaY}px)`
        }

        /**
         * @description 移动IPC
         * @param {MouseEvent} e
         */
        const handleMouseUp = (e: MouseEvent) => {
            if (movingPoint < 0) {
                return
            }
            pageData.value.points[movingPoint].X = e.clientX - movingX + pageData.value.points[movingPoint].X
            pageData.value.points[movingPoint].Y = e.clientY - movingY + pageData.value.points[movingPoint].Y
            movingX = 0
            movingY = 0
            movingPoint = -1
        }

        /**
         * @description 播放
         */
        const play = () => {
            if (pageData.value.playStatus === 'pasue') {
                ctx.emit('resume')
            } else {
                ctx.emit('play', prop.data[pageData.value.playingIndex])
            }
            pageData.value.playStatus = 'play'
        }

        /**
         * @description 停止播放
         */
        const stop = () => {
            pageData.value.playStatus = 'stop'
            ctx.emit('stop')
        }

        /**
         * @description 暂停播放
         */
        const pause = () => {
            pageData.value.playStatus = 'pause'
            ctx.emit('pause')
        }

        // 禁用上一个录像按钮
        const prevFrameDisabled = computed(() => {
            return pageData.value.playStatus === 'stop' || pageData.value.playingIndex === 0
        })

        // 禁用下一个录像按钮
        const nextFrameDisabled = computed(() => {
            return pageData.value.playStatus === 'stop' || pageData.value.playingIndex >= prop.data.length - 1
        })

        /**
         * @description 播放上一个录像
         */
        const prevFrame = () => {
            pageData.value.playingIndex--
            play()
        }

        /**
         * @description 播放下一个录像
         */
        const nextFrame = () => {
            pageData.value.playingIndex++
            play()
        }

        /**
         * @description 获取旋转后的坐标值
         * @param {number} x
         * @param {number} y
         * @param {number} theta
         * @returns {Object}
         */
        const scrollXOY = (x: number, y: number, theta: number) => {
            return {
                x: x * Math.cos(theta) + y * Math.sin(theta),
                y: y * Math.cos(theta) - x * Math.sin(theta),
            }
        }

        const ARRAOW_SIZE = 0.05
        const ARROW_SHARP = 0.025

        /**
         * @description 绘制箭头
         * @param {number} startX
         * @param {number} startY
         * @param {number} endX
         * @param {number} endY
         */
        const paintArrow = (startX: number, startY: number, endX: number, endY: number) => {
            const count = Math.ceil(Math.max(Math.abs(startX - endX), Math.abs(startY - endY)) / 10)
            const tickX = (endX - startX) / count
            const tickY = (endY - startY) / count
            startX = startX + tickX * 1.5
            startY = startY + tickY * 1.5
            endX -= tickX * 1.5
            endY -= tickY * 1.5
            // 画箭头主线
            context.beginPath()
            context.moveTo(startX, startY)
            context.lineTo(endX, endY)
            // 画箭头头部
            const theta = Math.atan((endX - startX) / (endY - startY))
            const cep = scrollXOY(endX, endY, -theta)
            const csp = scrollXOY(startX, startY, -theta)
            const l = cep.y - csp.y
            const x1 = cep.x + l * ARROW_SHARP
            const y1 = cep.y - l * ARRAOW_SIZE
            const x2 = cep.x - l * ARROW_SHARP
            const y2 = cep.y - l * ARRAOW_SIZE
            const h1 = scrollXOY(x1, y1, theta)
            const h2 = scrollXOY(x2, y2, theta)
            context.moveTo(endX, endY)
            context.lineTo(h1.x, h1.y)
            context.moveTo(endX, endY)
            context.lineTo(h2.x, h2.y)

            context.strokeStyle = pageData.value.lineColor
            context.stroke()
        }

        /**
         * @description 生成轨迹列表
         */
        const getTrack = () => {
            // 获取通道与坐标的映射
            const pointsMap: Record<string, { X: number; Y: number }> = {}
            pageData.value.points.forEach((item) => {
                pointsMap[item.hotPointId] = {
                    X: item.X,
                    Y: item.Y,
                }
            })

            // 获取轨迹数据
            trackMap = []
            let lastChlId = ''
            prop.data.map((item) => {
                if (item.chlId !== lastChlId && pointsMap[item.chlId]) {
                    const lastX = lastChlId ? pointsMap[lastChlId].X : Infinity
                    const lastY = lastChlId ? pointsMap[lastChlId].Y : Infinity
                    const X = pointsMap[item.chlId].X + 14
                    const Y = pointsMap[item.chlId].Y + 18
                    lastChlId = item.chlId
                    if (lastX !== X || lastY !== Y) {
                        trackMap.push({
                            chlId: item.chlId,
                            X: pointsMap[item.chlId].X + 14,
                            Y: pointsMap[item.chlId].Y + 18,
                        })
                    }
                }
            })
        }

        /**
         * @description 绘制轨迹
         */
        const paintTrack = () => {
            context.clearRect(0, 0, pageData.value.width, pageData.value.height)
            for (let i = 1; i <= trackMap.length - 1; i++) {
                const start = trackMap[i - 1]
                const end = trackMap[i]
                paintArrow(start.X, start.Y, end.X, end.Y)
            }
        }

        let trackTimer: number = 0

        /**
         * @description 播放轨迹
         */
        const playTrack = () => {
            pageData.value.trackStatus = 'play'

            let frame = 0
            let trackIndex = 0
            let tickIndex = 0
            let tickCount = 0
            let tickRotation = 0

            const animate = () => {
                frame++
                if (frame === 20) {
                    frame = 0
                    if (tickIndex >= tickCount - 1) {
                        tickIndex = 0
                        trackIndex++
                        if (trackIndex > trackMap.length - 1) {
                            stopTrack()
                            return
                        }
                        const itemEnd = trackMap[trackIndex]
                        const itemStart = trackMap[trackIndex - 1]
                        tickCount = Math.min(50, Math.ceil(Math.max(Math.abs(itemStart.X - itemEnd.X), Math.abs(itemStart.Y - itemEnd.Y)) / 10))
                        tickRotation = Math.atan2(itemEnd.Y - itemStart.Y, itemEnd.X - itemStart.X)
                    } else {
                        tickIndex++
                    }

                    paintTrack()

                    // 绘制箭头
                    const itemEnd = trackMap[trackIndex]
                    const itemStart = trackMap[trackIndex - 1]
                    const x = itemStart.X + ((itemEnd.X - itemStart.X) / tickCount) * tickIndex
                    const y = itemStart.Y + ((itemEnd.Y - itemStart.Y) / tickCount) * tickIndex
                    context.save()
                    context.translate(x, y)
                    context.rotate(tickRotation)
                    context.translate(-x, -y)
                    context.drawImage(arrowImg, x - 10, y - 10, 20, 20)
                    context.restore()
                }
                trackTimer = requestAnimationFrame(animate)
            }

            animate()
        }

        /**
         * @description 停止播放轨迹
         */
        const stopTrack = () => {
            pageData.value.trackStatus = 'stop'
            cancelAnimationFrame(trackTimer)
            paintTrack()
        }

        /**
         * @description 渲染IPC位置
         */
        const initPointPosition = () => {
            nextTick(() => {
                pageData.value.points.forEach((item, index) => {
                    const element = document.querySelector('.map-point-' + index) as HTMLElement
                    element.style.transform = `translate(${item.X}px, ${item.Y}px)`
                })
            })
        }

        /**
         * @description 获取背景图
         */
        const getEMap = async () => {
            const result = await queryEMap()
            const $ = queryXml(result)
            const content = $('content/mapImageFile').text()
            if (content) {
                pageData.value.emap = wrapBase64Img(content)
            }
        }

        /**
         * @description 获取IPC位置数据
         */
        const getEMapParam = async () => {
            const result = await queryEMapParam()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.colorOptions = $('types/color/enum').map((item) => item.text())
                pageData.value.fontColor = $('content/fontColor').text()
                pageData.value.lineColor = $('content/lineColor').text()

                pageData.value.points = $('content/hotPointList/item').map((item) => {
                    const $item = queryXml(item.element)
                    const chlId = item.attr('hotPointId')
                    return {
                        hotPointId: chlId,
                        X: ($item('X').text().num() / 10000) * pageData.value.width,
                        Y: ($item('Y').text().num() / 10000) * pageData.value.height,
                        count: countMap[chlId] || 0,
                        chlName: chlMap[chlId] || Translate('IDCS_HISTORY_CHANNEL'),
                    }
                })

                initPointPosition()
                cachePointList = cloneDeep(pageData.value.points)
            }
        }

        /**
         * @description 保存编辑的数据
         */
        const setEMapParam = async () => {
            const pointXml = pageData.value.points
                .map((item) => {
                    return rawXml`
                        <item hotPointId="${item.hotPointId}">
                            <hotPointType>channel</hotPointType>
                            <X>${Math.floor((item.X / pageData.value.width) * 10000)}</X>
                            <Y>${Math.floor((item.Y / pageData.value.height) * 10000)}</Y>
                        </item>
                    `
                })
                .join('')
            const sendXml = rawXml`
                <types>
                    <hotPointType>
                        <enum>channel</enum>
                    </hotPointType>
                </types>
                <content type="list">
                    <hotPointList>
                        <itemType>
                            <hotPointType type="hotPointType" />
                            <X min="0" max="10000" />
                            <Y min="0" max="10000" />
                        </itemType>
                        ${pointXml}
                        <fontColor>${pageData.value.fontColor}</fontColor>
                        <lineColor>${pageData.value.lineColor}</lineColor>
                    </hotPointList>
                </content>
            `
            await editEMapParam(sendXml)
            cachePointList = cloneDeep(pageData.value.points)
        }

        /**
         * @description 开启/关闭编辑时的回调
         */
        const changeEditMap = () => {
            if (!pageData.value.isEdit) {
                setEMapParam()
                getTrack()
                paintTrack()
            } else {
                context.clearRect(0, 0, pageData.value.width, pageData.value.height)
            }
        }

        /**
         * @description 更改文本和线条颜色
         * @param {string} lineColor
         * @param {string} fontColor
         */
        const changeColor = (lineColor: string, fontColor: string) => {
            pageData.value.isColorPop = false
            pageData.value.lineColor = lineColor
            pageData.value.fontColor = fontColor
            setEMapParam()
        }

        /**
         * @description 增加IPC的初始X坐标
         * @param {number} index
         */
        const calcX = (index: number) => {
            return (index % 8) * 100 + 30
        }

        /**
         * @description 增加IPC的初始Y坐标
         * @param {number} index
         */
        const calcY = (index: number) => {
            return Math.floor(index / 8) * 100 + 30
        }

        /**
         * @description 增加IPC
         * @param {SelectOption<string, string>[]} chl
         */
        const changeChl = (chl: SelectOption<string, string>[]) => {
            chl.forEach((item, index) => {
                pageData.value.points.push({
                    hotPointId: item.value,
                    chlName: item.label,
                    X: calcX(index),
                    Y: calcY(index),
                    count: countMap[item.value] || 0,
                })
            })
            initPointPosition()
        }

        /**
         * @description 删除IPC
         * @param {number} key
         */
        const deletePoint = (key: number) => {
            pageData.value.points.splice(key, 1)
            initPointPosition()
        }

        onMounted(async () => {
            await getChannelList()
            await getEMap()
            await getEMapParam()
            context = canvas.value!.getContext('2d')!
        })

        onBeforeUnmount(() => {
            stopTrack()
        })

        watch(
            () => prop.data,
            () => {
                if (pageData.value.playStatus === 'play' || pageData.value.playStatus === 'pause') {
                    stop()
                }

                stopTrack()
                pageData.value.playingIndex = 0

                // 获取各通道的录像数量
                countMap = {}
                prop.data.forEach((item) => {
                    if (!countMap[item.chlId]) {
                        countMap[item.chlId] = 1
                    } else {
                        countMap[item.chlId]++
                    }
                })

                // 把录像数据添加至画布中的通道
                const existChlId: string[] = []
                pageData.value.points = cloneDeep(cachePointList)
                pageData.value.points.forEach((item) => {
                    item.count = countMap[item.hotPointId] || 0
                    existChlId.push(item.hotPointId)
                })

                // 将有录像数据但未有预置点的通道添加至画布
                const newChl = Object.keys(countMap)
                    .filter((item) => {
                        return !existChlId.includes(item)
                    })
                    .map((item) => ({
                        value: item,
                        label: chlMap[item],
                    }))
                if (newChl.length) {
                    changeChl(newChl)
                }

                if (!pageData.value.isEdit) {
                    getTrack()
                    paintTrack()
                }
            },
        )

        watch(
            () => prop.visible,
            (visible) => {
                if (!visible) {
                    if (pageData.value.playStatus === 'play' || pageData.value.playStatus === 'pause') {
                        stop()
                    }
                }
            },
        )

        return {
            pageData,
            play,
            stop,
            pause,
            prevFrame,
            nextFrame,
            playTrack,
            stopTrack,
            prevFrameDisabled,
            nextFrameDisabled,
            changeEditMap,
            canvas,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
            deletePoint,
            changeColor,
            changeChl,
            filterChlOptions,
        }
    },
})
