/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 16:04:34
 * @Description: canvas移动侦测配置（网格线）
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-05-31 16:35:09
 */

import CanvasBase, { type CanvasBaseLineStyleOption } from './canvasBase'

interface CanvasMotionOption {
    el: HTMLCanvasElement
    rowNum?: number
    colNum?: number
    lineStyle?: Partial<CanvasBaseLineStyleOption>
    netArr?: string[][]
    onchange?: (netArr: string[][]) => void
}

export default class CanvasMotion {
    private readonly DEFAULT_COLOR = '#0f0' // 默认网格颜色
    private readonly DEFAULT_LINE_WIDTH = 1 // 默认网格线宽
    private readonly DEFAULT_ROWS = 15 // 默认网格行数
    private readonly DEFAULT_COLS = 22 // 默认网格列数
    private readonly STATUS_ON = '1' // 坐标点对应状态为1时绘制
    private readonly STATUS_OFF = '0' // 坐标点对应状态为0时不绘制
    private readonly ctx: CanvasBase
    private readonly canvas: HTMLCanvasElement
    private rowNum: number
    private colNum: number
    private lineStyle: CanvasBaseLineStyleOption
    private netArr: string[][]
    private lineWidth: number
    private w = 0
    private h = 0
    private scaleW = 0
    private scaleH = 0
    private readonly onchange: CanvasMotionOption['onchange']
    private onMouseDown?: (e: MouseEvent) => void

    constructor(option: CanvasMotionOption) {
        this.onchange = option.onchange
        this.rowNum = option.rowNum || this.DEFAULT_ROWS // 网格行数
        this.colNum = option.colNum || this.DEFAULT_COLS // 网格列数
        this.lineStyle = {
            strokeStyle: this.DEFAULT_COLOR,
            lineWidth: this.DEFAULT_LINE_WIDTH,
            ...option.lineStyle,
        }
        this.netArr = option.netArr || this.buildNetArr(this.rowNum, this.colNum, this.STATUS_OFF)
        this.lineWidth = this.lineStyle.lineWidth || this.DEFAULT_LINE_WIDTH
        this.ctx = new CanvasBase(option.el)
        this.canvas = this.ctx.getCanvas()
        this.init()
        this.bindEvent()
    }

    // 初始化
    init() {
        this.w = this.canvas.width // canvas宽
        this.h = this.canvas.height // canvas高
        this.scaleW = this.w / this.colNum // 每个格子的宽度(算上边框)
        this.scaleH = this.h / this.rowNum // 每个格子的高度(算上边框)
        this.setArea(this.netArr)
    }

    // 设置参数 { column, row, areaInfo } areaInfo: ['00000000', '11111111', ...]
    setOption(option: { column: number; row: number; areaInfo: string[] }) {
        const areaInfo = option.areaInfo
        if (!(areaInfo && areaInfo.length)) return
        this.rowNum = option.row * 1 || this.rowNum
        this.colNum = option.column * 1 || this.colNum
        const arr = []
        for (let i = 0; i < areaInfo.length; i++) {
            const item = areaInfo[i].split('')
            arr.push(item)
        }
        this.netArr = arr
        this.init()
    }

    // 根据行列数生成网格数组, status: 0表示网格未绘制 1表示网格已绘制
    buildNetArr(rowNum: number, colNum: number, status: string) {
        const arr: string[][] = []
        for (let i = 0; i < rowNum; i++) {
            arr.push([])
            for (let j = 0; j < colNum; j++) {
                arr[i].push(status)
            }
        }
        return arr
    }

    // 绑定事件
    private bindEvent() {
        if (!this.onMouseDown) {
            this.onMouseDown = (e: MouseEvent) => {
                const startX = e.offsetX
                const startY = e.offsetY
                const clientX = e.clientX
                const clientY = e.clientY

                document.body.style.setProperty('user-select', 'none')
                const onMouseMove = (e1: MouseEvent) => {
                    let endX = e1.clientX - clientX + startX
                    let endY = e1.clientY - clientY + startY
                    if (endX < 0) endX = 0
                    if (endX > this.w) endX = this.w
                    if (endY < 0) endY = 0
                    if (endY > this.h) endY = this.h
                    let status = this.STATUS_ON
                    if (startX > endX && startY > endY) {
                        status = this.STATUS_OFF
                    }
                    this.setNetArrByRect(startX, startY, endX, endY, status)
                    this.setArea(this.netArr)
                    this.onchange && this.onchange(this.netArr)
                }

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                    document.body.style.setProperty('user-select', 'unset')
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)
            }
        }
        this.canvas.removeEventListener('mousedown', this.onMouseDown)
        this.canvas.addEventListener('mousedown', this.onMouseDown)
    }

    // 根据网格x坐标计算网格所在列索引
    getColIndexByNetX(x: number) {
        return Math.floor(x / this.scaleW)
    }

    // 根据网格y坐标计算网格所在行索引
    getRowIndexByNetY(y: number) {
        return Math.floor(y / this.scaleH)
    }

    // 根据网格所在列索引计算网格x坐标
    getNetXByColIndex(colIndex: number) {
        return colIndex * this.scaleW
    }

    // 根据网格所在行索引计算网格y坐标
    getNetYByRowIndex(rowIndex: number) {
        return rowIndex * this.scaleH
    }

    // 根据单个网格坐标及绘制状态更新网格数组
    updateNetArrByPosition(x: number, y: number, status: string) {
        const rowIndex = this.getRowIndexByNetY(y)
        const colIndex = this.getColIndexByNetX(x)
        this.netArr[rowIndex][colIndex] = status
    }

    // 根据矩形区域生成包含的网格坐标集合
    setNetArrByRect(startX: number, startY: number, endX: number, endY: number, status: string) {
        // 计算矩形区域内格子的行数和列数
        const rowNum = Math.ceil(Math.abs(endY - startY) / this.scaleH)
        const colNum = Math.ceil(Math.abs(endX - startX) / this.scaleW)
        const _startX = startX < endX ? startX : endX
        const _startY = startY < endY ? startY : endY
        for (let i = 0; i < rowNum; i++) {
            for (let j = 0; j < colNum; j++) {
                const rowIndex = Math.floor((_startY + i * this.scaleH) / this.scaleH)
                const colIndex = Math.floor((_startX + j * this.scaleW) / this.scaleW)
                this.netArr[rowIndex][colIndex] = status
            }
        }
    }

    // 根据网格数组绘制网格区域
    setArea(netArr: string[][]) {
        this.ctx.ClearRect(0, 0, this.w, this.h)
        const len = netArr.length
        for (let i = 0; i < len; i++) {
            const row = netArr[i]
            for (let j = 0; j < row.length; j++) {
                const item = row[j]
                if (item === this.STATUS_ON) {
                    const startX = this.getNetXByColIndex(j)
                    const startY = this.getNetYByRowIndex(i)
                    const width = this.scaleW - this.lineWidth
                    const height = this.scaleH - this.lineWidth
                    this.ctx.Rect(startX, startY, width, height, this.lineStyle)
                }
            }
        }
    }

    // 获取网格数据
    getArea() {
        return this.netArr
    }

    // 清空所有区域
    clear() {
        this.netArr = this.buildNetArr(this.rowNum, this.colNum, this.STATUS_OFF)
        this.setArea(this.netArr)
    }

    // 绘制所有区域
    selectAll() {
        this.ctx.ClearRect(0, 0, this.w, this.h)
        this.netArr = this.buildNetArr(this.rowNum, this.colNum, this.STATUS_ON)
        this.setArea(this.netArr)
    }

    // 反选区域
    reverse() {
        this.ctx.ClearRect(0, 0, this.w, this.h)
        const netArr: string[][] = []
        for (let i = 0; i < this.rowNum; i++) {
            const row = this.netArr[i]
            netArr.push([])
            for (let j = 0; j < this.colNum; j++) {
                const status = row[j]
                netArr[i][j] = status === this.STATUS_ON ? this.STATUS_OFF : this.STATUS_ON
            }
        }
        this.netArr = netArr
        this.setArea(netArr)
    }

    // 组件生命周期结束时执行
    destroy() {
        if (this.onMouseDown) {
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
        }
    }
}
