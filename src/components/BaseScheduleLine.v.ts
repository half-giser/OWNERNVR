/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:11:40
 * @Description: 排程单时间条控件
 */

import CanvasBase from '@/utils/canvas/canvasBase'
import { ref } from 'vue'

export default defineComponent({
    props: {
        //时间条控件的宽度
        width: {
            type: Number,
            require: true,
            default: 300,
        },
        //时间条控件的宽度
        timeMode: {
            type: Number, // 12|24
            require: false,
            default: 24,
        },
        scaleColor: {
            type: String,
            require: false,
            default: '#000',
        },
        scaleFont: {
            type: String,
            require: false,
            default: '11px Arial',
        },
        timeSpanColor: {
            type: String,
            require: false,
            default: '#18C0DD',
        },
        timeSpanSelectingColor: {
            type: String,
            require: false,
            default: '#89E9F9',
        },
        timeSpanBgColor: {
            type: String,
            require: false,
            default: '#F2F2F3',
        },
        //拖选时的操作类型：添加|删除: add|del
        dragAction: {
            type: String,
            require: false,
            default: 'add',
            validator(value) {
                return value === 'add' || value === 'del'
            },
        },
    },
    setup(props) {
        const { Translate } = inject('appGlobalProp') as appGlobalProp

        //时间段显示风格符号，精度到分钟，如 02:30-05:10
        const timeSpanSplit = '-'
        //最大时间分钟数
        const maxTimeNum = 24 * 60 - 1
        const scaleRef = ref<HTMLCanvasElement>()
        const timeSelectorRef = ref<HTMLCanvasElement>()
        let scaleCanvasBase: CanvasBase, timeSelectorCanvasBase: CanvasBase

        //时间条控件中画布的宽度和高度
        const canvasWidth = props.width - 2 //减去左右border的宽度
        //时间条控件中画布的高度
        let canvasHeight: number
        //Canvas的X轴两边留白的空间，为了让收个刻度上的文字可以显示在刻度线中间
        let headSpace: number
        //最左侧刻度的坐标
        let leftX: number
        //最右侧刻度的坐标
        let rightX: number
        //刻度的总长度
        let scaleWidth: number
        //单位刻度的长度
        let scaleUnitWidth: number

        //当前是否在拖拽选择状态
        const isSelecting = ref(false)
        //当前选择的开始X坐标
        let selectStartX = -1
        //当前选择的结束X坐标
        let selectEndX = -1
        //鼠标拖选时实时显示选择时间段的TIP
        const selectTip = ref('')
        //手动选择时间段
        const menaulTimeSpan = ref<[Date, Date]>([new Date(2016, 9, 10, 0, 0), new Date(2016, 9, 10, 23, 59)])
        //手动选择时间段面板显示状态
        const manualTimeInputShow = ref(false)

        /**
         * 挂载完成后设置基础元素和属性
         */
        const setBasicProp = () => {
            scaleCanvasBase = new CanvasBase(scaleRef.value as HTMLCanvasElement)
            timeSelectorCanvasBase = new CanvasBase(timeSelectorRef.value as HTMLCanvasElement)
            canvasHeight = timeSelectorRef.value?.height as number
            //Canvas的X轴两边留白的空间，为了让收个刻度上的文字可以显示在刻度线中间
            headSpace = (() => {
                let padding = canvasWidth * 0.05
                padding = (padding > 35 ? 35 : padding) + 0.5
                return padding //减去左右border宽度和留空
            })()
            leftX = headSpace
            rightX = canvasWidth - headSpace
            scaleWidth = rightX - leftX
            scaleUnitWidth = scaleWidth / 24
        }

        onMounted(() => {
            //挂载完成后设置基础元素和属性
            setBasicProp()
            //画刻度
            drawScale()
        })

        //当前选中的时间段数据内部存储格式，时间字符串转换为从0点0分开始的分钟数:[[60-]]
        const selectedTimeSpans: Ref<Array<[number, number]>> = ref([])

        const valueShowText = computed(() => {
            return getValue()
                .map((item) => {
                    return timeStrSpanShowText(item)
                })
                .join(',\r\n')
        })

        /**
         * 时间数字数组排序和合并，多个有相交，包含等关系的时间区间合并成一个大的区间
         * @param timeNumArr 原始时间数字数组
         * @returns
         */
        const timeNumArrSortedAndMerge = (timeNumArr: Array<[number, number]>) => {
            if (!timeNumArr || timeNumArr.length === 0) return timeNumArr
            //按开始时间排序
            timeNumArr.sort((a, b) => {
                return a[0] - b[0]
            })

            function getMax(a: number, b: number) {
                return a > b ? a : b
            }

            const mergedValue = [timeNumArr[0]]
            for (let i = 1; i < timeNumArr.length; i++) {
                let j = mergedValue.length - 1
                while (j >= 0 && timeNumArr[i][0] <= mergedValue[j][1]) {
                    j--
                }
                let newLastMergeItem: [number, number]
                if (j === mergedValue.length - 1) {
                    newLastMergeItem = timeNumArr[i]
                } else {
                    newLastMergeItem = [mergedValue[j + 1][0], getMax(mergedValue[j + 1][1], timeNumArr[i][1])]
                }
                mergedValue.splice(j + 1, mergedValue.length, newLastMergeItem)
            }

            return mergedValue
        }

        const checkAndInsertTimeNumSpan = (timeSpan: [number, number]) => {
            if (timeSpan[0] > timeSpan[1]) {
                throw `checkAndInsertTimeNumSpan: start time > end time`
            }
            selectedTimeSpans.value.push([timeSpan[0], timeSpan[1]])
        }

        /**
         * 删除时间段
         * @param timeSpan
         */
        const delTimeNumSpan = (timeSpan: [number, number]) => {
            if (timeSpan[0] > timeSpan[1]) {
                throw `checkAndInsertTimeNumSpan: start time > end time`
            }

            const timeNumArr = selectedTimeSpans.value
            const resultArr: Array<[number, number]> = []

            for (let i = 0; i < timeNumArr.length; i++) {
                const item = timeNumArr[i]
                if (item[1] <= timeSpan[0]) {
                    resultArr.push(item)
                } else if (item[0] < timeSpan[1]) {
                    if (item[0] < timeSpan[0]) {
                        resultArr.push([item[0], timeSpan[0]])
                    }

                    if (item[1] > timeSpan[1]) {
                        resultArr.push([timeSpan[1], item[1]])
                    }
                } else if (timeSpan[1] <= item[0]) {
                    resultArr.push(item)
                }
            }

            selectedTimeSpans.value = resultArr
            drawTimeSpan()
        }

        const checkAndInsertTimeSpan = (timeSpan: [string, string]) => {
            checkAndInsertTimeNumSpan([timeStrToNum(timeSpan[0]), timeStrToNum(timeSpan[1])])
        }

        /**
         * 重置时间段数据
         * @param newValue 时间段字符串数组，示例：[['00:30','02:00'],['05:18','18:30']]
         */
        const resetValue = (newValue: Array<[string, string]> | Array<[number, number]>) => {
            selectedTimeSpans.value.length = 0
            if (newValue && newValue.length > 0) {
                if (typeof newValue[0][0] === 'number') {
                    newValue.forEach((item) => {
                        checkAndInsertTimeNumSpan(item as [number, number])
                    })
                } else {
                    newValue.forEach((item) => {
                        checkAndInsertTimeSpan(item as [string, string])
                    })
                }
            }
            mergeAnddrawTimeSpan()
        }

        /**
         * 添加时间段
         * @param timeSpan 时间段
         */
        const addTimeSpan = (timeSpan: [string, string]) => {
            checkAndInsertTimeSpan(timeSpan)
            mergeAnddrawTimeSpan()
        }

        /**
         * 反选
         */
        const invert = () => {
            const reuslt = []
            let num1 = 0
            selectedTimeSpans.value.forEach((item) => {
                if (item[0] > num1) {
                    reuslt.push([num1, item[0]])
                }
                num1 = item[1]
            })
            if (selectedTimeSpans.value[selectedTimeSpans.value.length - 1][1] < maxTimeNum) {
                reuslt.push([selectedTimeSpans.value[selectedTimeSpans.value.length - 1][1], maxTimeNum])
            }
            resetValue(reuslt as Array<[number, number]>)
        }

        const dateToTimeNum = (time: Date) => {
            return time.getHours() * 60 + time.getMinutes()
        }

        const manualTimeInputClose = (event: Event | null) => {
            if (event == null || event.target != manualTimeInputTarget) {
                manualTimeInputShow.value = false
                document.removeEventListener('click', manualTimeInputClose)
            }
        }

        /**
         * 记录当前打开手动输入的按钮（在周排程时，打开一个手动输入/复制到，需要关闭其他天的手动输入/复制到，不能阻止冒泡，导致document点击时间不触发）
         */
        let manualTimeInputTarget: EventTarget | null = null
        /**
         * 手动设置时间段确定事件
         */
        const manualTimeInputOpen = (event: Event) => {
            manualTimeInputTarget = event.target
            manualTimeInputShow.value = true
            document.addEventListener('click', manualTimeInputClose)
        }

        /**
         * 手动设置时间段确定事件
         */
        const manualTimeInputOk = () => {
            checkAndInsertTimeNumSpan([dateToTimeNum(menaulTimeSpan.value[0]), dateToTimeNum(menaulTimeSpan.value[1])])
            mergeAnddrawTimeSpan()
            manualTimeInputTarget = null
            manualTimeInputClose(null)
        }

        /**
         * 获取时间段字符串数组数据
         * @returns 示例：[['00:30','02:00'],['05:18','18:30']]
         */
        const getValue: () => [string, string][] = () => {
            const result = [] as [string, string][]
            selectedTimeSpans.value.forEach((item) => {
                result.push([numToTimeStr(item[0]), numToTimeStr(item[1])])
            })
            return result
        }

        /**
         * 时间字符串转数字（从00:00开始的分钟数）
         * @param timeStr 时间字符串，如： 02:30
         * @returns
         */
        const timeStrToNum = (timeStr: string) => {
            if (timeStr === '24:00') timeStr = '23:59'
            if (!timeStr) {
                throw 'timeStr can not be empty: ' + timeStr
            }
            const regTime = /^(2[0-3]|[01]?\d):([0-5]?\d)$/
            const matchArr = timeStr.match(regTime)
            if (!matchArr || matchArr.length !== 3) {
                throw 'timeStr format error: ' + timeStr
            }
            return Number(matchArr[1]) * 60 + Number(matchArr[2]) * 1
        }

        /**
         * 时间区间字符串数组字符串表示
         * @param timeStrSpan 时间区间字符串数组
         * @returns
         */
        const timeStrSpanShowText = (timeStrSpan: Array<string>) => {
            return timeStrSpan.join(timeSpanSplit)
        }

        /**
         * 时间数字转时间字符串
         * @param timeNum 时间数字（从00:00开始的分钟数）
         * @returns
         */
        const numToTimeStr = (timeNum: number) => {
            if (timeNum === null || timeNum === undefined) {
                throw 'timeNum can not be empty: ' + timeNum
            }
            if (timeNum < 0 || timeNum > maxTimeNum) {
                throw `timeNum should in [0-${maxTimeNum}]: ${timeNum}`
            }
            const hour = Math.floor(timeNum / 60)
            const min = timeNum % 60
            if (hour === 23 && min === 59) {
                return '24:00'
            } else {
                return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
            }
        }

        /**
         * X轴坐标转时间数字
         * @param x X轴坐标
         * @returns
         */
        const xToTime = (x: number) => {
            if (x < leftX) return 0
            else if (x > rightX) return maxTimeNum
            else return Math.ceil((maxTimeNum * (x - leftX)) / scaleWidth)
        }

        const timeToX = (time: number) => {
            if (time < 0) return leftX + 0.5
            else if (time > maxTimeNum) return maxTimeNum + 0.5
            else return leftX + Math.ceil((scaleWidth * time) / maxTimeNum) + 0.5
        }

        //0-24序列
        const scaleArr24 = [...new Array(25).keys()]

        //24小时制刻度文本数组
        const scaleTextArr24 = scaleArr24.map((o) => o.toString())

        //12小时制刻度文本数组
        const scaleTextArr12 = (() => {
            const arr = [] as string[]
            scaleArr24.forEach((item) => {
                if (item == 0 || item == 24) arr.push('12A')
                else if (item == 12) arr.push('12P')
                else if (item < 12) arr.push(item.toString())
                else arr.push((item - 12).toString())
            })
            return arr
        })()

        /**
         * 画刻度
         */
        const drawScale = () => {
            const ctx = scaleCanvasBase.getContext()
            const lineStyle = {
                lineWidth: 1,
                strokeStyle: props.scaleColor,
            }

            const scaleTextArr = props.timeMode === 12 ? scaleTextArr12 : scaleTextArr24

            scaleCanvasBase.Line(0, 19.5, canvasWidth, 19.5, lineStyle)
            for (let i = 0; i < 25; i++) {
                //偏移0.5，避免出现模糊
                const x = Math.floor(leftX + i * scaleUnitWidth) + 0.5
                if (i % 2 === 0) {
                    scaleCanvasBase.Text({
                        text: scaleTextArr[i],
                        startX: x - ctx.measureText(scaleTextArr[i]).width / 2,
                        startY: 2,
                        fillStyle: props.scaleColor,
                        font: props.scaleFont,
                    })
                    scaleCanvasBase.Line(x, 13, x, canvasHeight, lineStyle)
                } else {
                    scaleCanvasBase.Line(x, 16, x, canvasHeight, lineStyle)
                }
            }
        }

        /**
         * 画时间段
         */
        const drawTimeSpan = () => {
            timeSelectorCanvasBase.ClearRect(0, 0, canvasWidth, canvasHeight)
            selectedTimeSpans.value.forEach((item) => {
                const x1 = timeToX(item[0])
                const x2 = timeToX(item[1]) - x1
                timeSelectorCanvasBase.FillRect(x1, 0, x2, canvasHeight, props.timeSpanColor)
            })
        }

        /**
         * 合并并画时间段
         */
        const mergeAnddrawTimeSpan = () => {
            selectedTimeSpans.value = timeNumArrSortedAndMerge(selectedTimeSpans.value)
            drawTimeSpan()
        }

        const getValidX = (x: number) => {
            return x < leftX ? leftX : x > rightX ? rightX : x
        }

        const selectStart = (event: MouseEvent) => {
            isSelecting.value = true
            selectStartX = getValidX(event.offsetX)
        }

        const selecting = (event: MouseEvent) => {
            if (!isSelecting.value) return
            selectEndX = getValidX(event.offsetX)
            const timeNum1 = xToTime(selectStartX)
            const timeNum2 = xToTime(selectEndX)
            selectTip.value = timeStrSpanShowText(timeNum1 > timeNum2 ? [numToTimeStr(timeNum2), numToTimeStr(timeNum1)] : [numToTimeStr(timeNum1), numToTimeStr(timeNum2)])
            drawTimeSpan()
            timeSelectorCanvasBase.FillRect(selectStartX, 0, selectEndX - selectStartX, canvasHeight, props.timeSpanSelectingColor)
        }

        const selectEnd = (event: MouseEvent) => {
            if (!isSelecting.value) return
            isSelecting.value = false
            selectEndX = getValidX(event.offsetX)
            const timeNum1 = xToTime(selectStartX)
            const timeNum2 = xToTime(selectEndX)
            if (timeNum1 === timeNum2) return
            const timeSpan: [number, number] = timeNum1 > timeNum2 ? [timeNum2, timeNum1] : [timeNum1, timeNum2]
            if (props.dragAction === 'add') {
                checkAndInsertTimeNumSpan(timeSpan)
                mergeAnddrawTimeSpan()
            } else {
                delTimeNumSpan(timeSpan)
            }
        }

        return {
            canvasWidth,
            scaleRef,
            timeSelectorRef,
            resetValue,
            getValue,
            addTimeSpan,
            invert,
            selectStart,
            selecting,
            selectEnd,
            valueShowText,
            menaulTimeSpan,
            manualTimeInputShow,
            manualTimeInputOpen,
            manualTimeInputOk,
            Translate,
            isSelecting,
            selectTip,
        }
    },
})
