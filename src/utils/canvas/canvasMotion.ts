/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 16:04:34
 * @Description: canvas移动侦测配置（网格线）
 */

import CanvasBase, { type CanvasBaseLineStyleOption } from './canvasBase'

interface CanvasMotionOption {
    el?: HTMLCanvasElement
    rowNum?: number
    colNum?: number
    lineStyle?: Partial<CanvasBaseLineStyleOption>
    netArr?: string[][]
    onchange?: (netArr: string[][]) => void
}

export default function CanvasMotion(option: CanvasMotionOption = {}) {
    const DEFAULT_COLOR = '#0f0' // 默认网格颜色
    const DEFAULT_LINE_WIDTH = 1 // 默认网格线宽
    const DEFAULT_ROWS = 15 // 默认网格行数
    const DEFAULT_COLS = 22 // 默认网格列数
    const STATUS_ON = '1' // 坐标点对应状态为1时绘制
    const STATUS_OFF = '0' // 坐标点对应状态为0时不绘制

    let w = 0
    let h = 0
    let scaleW = 0
    let scaleH = 0
    let rowNum = option.rowNum || DEFAULT_ROWS // 网格行数
    let colNum = option.colNum || DEFAULT_COLS // 网格列数
    let netArr: string[][] = []

    const lineStyle = {
        strokeStyle: DEFAULT_COLOR,
        lineWidth: DEFAULT_LINE_WIDTH,
        ...option.lineStyle,
    }
    const lineWidth = lineStyle.lineWidth || DEFAULT_LINE_WIDTH
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const onchange = option.onchange

    /**
     * @description 初始化
     */
    const init = () => {
        w = canvas.width // canvas宽
        h = canvas.height // canvas高
        scaleW = w / colNum // 每个格子的宽度(算上边框)
        scaleH = h / rowNum // 每个格子的高度(算上边框)
        setArea(netArr)
    }

    /**
     * @description 设置参数 { column, row, areaInfo } areaInfo: ['00000000', '11111111', ...]
     * @param option
     */
    const setOption = (option: { column: number; row: number; areaInfo: string[] }) => {
        const areaInfo = option.areaInfo
        if (!areaInfo.length) return
        rowNum = option.row || rowNum
        colNum = option.column || colNum
        const arr = []
        for (let i = 0; i < areaInfo.length; i++) {
            const item = areaInfo[i].split('')
            arr.push(item)
        }
        netArr = arr
        init()
    }

    /**
     * @description 根据行列数生成网格数组, status: 0表示网格未绘制 1表示网格已绘制
     * @param rowNum
     * @param colNum
     * @param status
     * @returns {string[][]}
     */
    const buildNetArr = (rowNum: number, colNum: number, status: string) => {
        const arr: string[][] = []
        for (let i = 0; i < rowNum; i++) {
            arr.push([])
            for (let j = 0; j < colNum; j++) {
                arr[i].push(status)
            }
        }
        return arr
    }

    const onMouseDown = (e: MouseEvent) => {
        const startX = e.offsetX
        const startY = e.offsetY
        const clientX = e.clientX
        const clientY = e.clientY

        document.body.style.setProperty('user-select', 'none')
        const onMouseMove = (e1: MouseEvent) => {
            const endX = clamp(e1.clientX - clientX + startX, 0, w)
            const endY = clamp(e1.clientY - clientY + startY, 0, h)

            let status = STATUS_ON
            if (startX > endX && startY > endY) {
                status = STATUS_OFF
            }
            setNetArrByRect(startX, startY, endX, endY, status)
            setArea(netArr)
            onchange && onchange(netArr)
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            document.body.style.setProperty('user-select', 'unset')
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    /**
     * @description 绑定事件
     */
    const bindEvent = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
        canvas.addEventListener('mousedown', onMouseDown)
    }

    /**
     * @description 根据网格x坐标计算网格所在列索引
     * @param x
     * @returns {number}
     */
    // const getColIndexByNetX = (x: number) => {
    //     return Math.floor(x / scaleW)
    // }

    /**
     * @description 根据网格y坐标计算网格所在行索引
     * @param y
     * @returns {number}
     */
    // const getRowIndexByNetY = (y: number) => {
    //     return Math.floor(y / scaleH)
    // }

    /**
     * @description 根据网格所在列索引计算网格x坐标
     * @param colIndex
     * @returns {number}
     */
    const getNetXByColIndex = (colIndex: number) => {
        return colIndex * scaleW
    }

    /**
     * @description 根据网格所在行索引计算网格y坐标
     * @param rowIndex
     * @returns {number}
     */
    const getNetYByRowIndex = (rowIndex: number) => {
        return rowIndex * scaleH
    }

    /**
     * @description 根据单个网格坐标及绘制状态更新网格数组
     * @param x
     * @param y
     * @param status
     */
    // const updateNetArrByPosition = (x: number, y: number, status: string) => {
    //     const rowIndex = getRowIndexByNetY(y)
    //     const colIndex = getColIndexByNetX(x)
    //     netArr[rowIndex][colIndex] = status
    // }

    /**
     * @description 根据矩形区域生成包含的网格坐标集合
     * @param startX
     * @param startY
     * @param endX
     * @param endY
     * @param status
     */
    const setNetArrByRect = (startX: number, startY: number, endX: number, endY: number, status: string) => {
        // 计算矩形区域内格子的行数和列数
        const rowNum = Math.ceil(Math.abs(endY - startY) / scaleH)
        const colNum = Math.ceil(Math.abs(endX - startX) / scaleW)
        const _startX = Math.min(startX, endX)
        const _startY = Math.min(startY, endY)
        for (let i = 0; i < rowNum; i++) {
            for (let j = 0; j < colNum; j++) {
                const rowIndex = Math.floor((_startY + i * scaleH) / scaleH)
                const colIndex = Math.floor((_startX + j * scaleW) / scaleW)
                netArr[rowIndex][colIndex] = status
            }
        }
    }

    /**
     * @description 根据网格数组绘制网格区域
     * @param netArr
     */
    const setArea = (netArr: string[][]) => {
        ctx.ClearRect(0, 0, w, h)
        for (let i = 0; i < netArr.length; i++) {
            const row = netArr[i]
            for (let j = 0; j < row.length; j++) {
                const item = row[j]
                if (item === STATUS_ON) {
                    const startX = getNetXByColIndex(j)
                    const startY = getNetYByRowIndex(i)
                    const width = scaleW - lineWidth
                    const height = scaleH - lineWidth
                    ctx.Rect(startX, startY, width, height, lineStyle)
                }
            }
        }
    }

    /**
     * @description 获取网格数据
     * @returns
     */
    const getArea = () => {
        return netArr
    }

    /**
     * @description 清空所有区域
     */
    const clear = () => {
        netArr = buildNetArr(rowNum, colNum, STATUS_OFF)
        setArea(netArr)
    }

    /**
     * @description 绘制所有区域
     */
    const selectAll = () => {
        ctx.ClearRect(0, 0, w, h)
        netArr = buildNetArr(rowNum, colNum, STATUS_ON)
        setArea(netArr)
    }

    /**
     * @description 反选区域
     */
    const reverse = () => {
        ctx.ClearRect(0, 0, w, h)
        netArr = []
        for (let i = 0; i < rowNum; i++) {
            const row = netArr[i]
            netArr.push([])
            for (let j = 0; j < colNum; j++) {
                const status = row[j]
                netArr[i][j] = status === STATUS_ON ? STATUS_OFF : STATUS_ON
            }
        }
        setArea(netArr)
    }

    /**
     * @description 组件生命周期结束时执行
     */
    const destroy = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
    }

    netArr = option.netArr || buildNetArr(rowNum, colNum, STATUS_OFF)
    init()
    bindEvent()

    return {
        setOption,
        setArea,
        getArea,
        clear,
        selectAll,
        reverse,
        destroy,
    }
}
