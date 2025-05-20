/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-31 15:34:27
 * @Description: canvas视频遮挡配置（透明矩形区域×4）
 */

export interface CanvasMaskMaskItem {
    X: number
    Y: number
    width: number
    height: number
    color?: string
    isSelect?: boolean
    isDrawing?: boolean
}

interface CanvasMaskOption {
    el?: HTMLCanvasElement
    maxCount?: number
    fillStyle?: string | CanvasGradient | CanvasPattern
    blurStyle?: string | CanvasGradient | CanvasPattern
    maskList?: CanvasMaskMaskItem[]
    enable?: boolean
    onchange?: (maskList: CanvasMaskMaskItem[]) => void
}

export const CanvasMask = (option: CanvasMaskOption = {}) => {
    const DEFAULT_SELECT_COLOR = '#0f08' // 默认选中填充色值
    const DEFAULT_BLUR_COLOR = '#000' // 默认失焦填充色值

    const DEFAULT_MAX = 4 // 绘制最大数量
    const RELATIVE_WIDTH = 640 // 万分比宽度
    const RELATIVE_HEIGHT = 480 // 万分比高度

    let maskList = option.maskList || []
    let enable = option.enable || false

    const maxCount = option.maxCount || DEFAULT_MAX
    const fillStyle = option.fillStyle || DEFAULT_SELECT_COLOR
    const blurStyle = option.blurStyle || DEFAULT_BLUR_COLOR
    const onchange = option.onchange
    const ctx = CanvasBase(option.el)
    const canvas = ctx.getCanvas()
    const cavWidth = canvas.width // 画布宽
    const cavHeight = canvas.height // 画布高

    /**
     * @description 根据数据绘制区域
     * @param {CanvasMaskMaskItem[]} maskList
     * @returns
     */
    const setMask = (list: CanvasMaskMaskItem[]) => {
        ctx.ClearRect(0, 0, cavWidth, cavHeight)
        maskList = list

        if (!maskList.length) return

        for (let i = 0; i < maskList.length; i++) {
            const item = getRealItemByRelative(maskList[i])
            const color = maskList[i].color || blurStyle
            ctx.FillRect(item.X, item.Y, item.width, item.height, color)
        }

        // 选中的区域最后再绘制置亮
        for (let i = 0; i < maskList.length; i++) {
            if (maskList[i].isSelect) {
                const item = getRealItemByRelative(maskList[i])
                ctx.FillRect(item.X, item.Y, item.width, item.height, fillStyle)
                break
            }
        }
    }

    // 鼠标事件触发的更新数据
    const mouseEventSetMask = (finalX: number, finalY: number, width: number, height: number) => {
        const obj = getRelativeItemByReal({
            X: finalX,
            Y: finalY,
            width: width,
            height: height,
        })

        maskList.forEach((item) => {
            if (item.isDrawing) {
                item.X = obj.X
                item.Y = obj.Y
                item.width = obj.width
                item.height = obj.height
            }
        })
    }

    /**
     * @description 设置画布是否禁用
     * @param newEnable
     */
    const setEnable = (bool: boolean) => {
        enable = bool
    }

    const onMouseDown = (e: MouseEvent) => {
        if (!enable || maskList.length === maxCount) {
            return
        }

        maskList.forEach((item) => {
            item.isSelect = false
        })

        maskList = maskList.filter((item) => !item.isDrawing)
        maskList.push({
            X: 0,
            Y: 0,
            width: 0,
            height: 0,
            isDrawing: true,
            isSelect: true,
        })

        const startX = e.offsetX
        const startY = e.offsetY
        const clientX = e.clientX
        const clientY = e.clientY
        let endX = 0
        let endY = 0
        let finalX = 0
        let finalY = 0
        let width = 0
        let height = 0
        document.body.style.setProperty('user-select', 'none')

        const onMouseMove = (e1: MouseEvent) => {
            endX = clamp(e1.clientX - clientX + startX, 0, cavWidth)
            endY = clamp(e1.clientY - clientY + startY, 0, cavHeight)
            width = Math.abs(endX - startX)
            height = Math.abs(endY - startY)
            finalX = Math.min(startX, endX)
            finalY = Math.min(startY, endY)
            mouseEventSetMask(finalX, finalY, width, height)
            setMask(maskList)
            ctx.FillRect(finalX, finalY, width, height, fillStyle)
        }

        const onMouseUp = () => {
            if (!isInnerRect(finalX, finalY, width, height)) {
                mouseEventSetMask(finalX, finalY, width, height)
            }
            setMask(maskList)
            onchange && onchange(maskList)
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
     * @description 根据万分比尺寸获取画布尺寸
     * @param size
     * @param type
     * @returns
     */
    const getRealSizeByRelative = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (cavWidth * size) / RELATIVE_WIDTH
        } else {
            return (cavHeight * size) / RELATIVE_HEIGHT
        }
    }

    /**
     * @description 根据画布尺寸获取对应万分比尺寸
     * @param size
     * @param type
     * @returns
     */
    const getRelativeSizeByReal = (size: number, type: 'x' | 'y') => {
        if (type === 'x') {
            return (RELATIVE_WIDTH * size) / cavWidth
        } else {
            return (RELATIVE_HEIGHT * size) / cavHeight
        }
    }

    const getRealItemByRelative = (relativeItem: CanvasMaskMaskItem) => {
        return {
            X: getRealSizeByRelative(relativeItem.X, 'x'),
            Y: getRealSizeByRelative(relativeItem.Y, 'y'),
            width: getRealSizeByRelative(relativeItem.width, 'x'),
            height: getRealSizeByRelative(relativeItem.height, 'y'),
        }
    }

    /**
     * @description
     * @param realItem
     * @returns
     */
    const getRelativeItemByReal = (realItem: CanvasMaskMaskItem) => {
        return {
            X: getRelativeSizeByReal(realItem.X, 'x'),
            Y: getRelativeSizeByReal(realItem.Y, 'y'),
            width: getRelativeSizeByReal(realItem.width, 'x'),
            height: getRelativeSizeByReal(realItem.height, 'y'),
        }
    }

    /**
     * @description 判断新绘制的矩形是否包含于已画矩形内
     * @param startX
     * @param startY
     * @param width
     * @param height
     * @returns
     */
    const isInnerRect = (startX: number, startY: number, width: number, height: number) => {
        if (maskList.length === 0) {
            return false
        }
        let isInner = false
        const endX = startX + width
        const endY = startY + height
        for (let i = 0; i < maskList.length; i++) {
            const item = getRealItemByRelative(maskList[i])
            const innerLeftTop = ctx.IsInRect(startX, startY, item.X, item.Y, item.width, item.height)
            const innerRightTop = ctx.IsInRect(endX, startY, item.X, item.Y, item.width, item.height)
            const innerLeftBottom = ctx.IsInRect(startX, endY, item.X, item.Y, item.width, item.height)
            const innerRightBottom = ctx.IsInRect(endX, endY, item.X, item.Y, item.width, item.height)
            if (innerLeftTop && innerRightTop && innerLeftBottom && innerRightBottom) {
                isInner = true
                break
            }
        }
        return isInner
    }

    /**
     * @description 获取绘制数据
     * @returns
     */
    const getArea = () => {
        return maskList
    }

    /**
     * @description 清空所有区域
     */
    const clear = () => {
        maskList = []
        setMask(maskList)
    }

    /**
     * @description 组件生命周期结束时执行
     */
    const destroy = () => {
        canvas.removeEventListener('mousedown', onMouseDown)
    }

    setMask(maskList)
    bindEvent()

    return {
        setMask,
        getArea,
        setEnable,
        clear,
        destroy,
    }
}
