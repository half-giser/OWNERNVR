/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 16:21:55
 * @Description: 需要特殊计算位置的雪碧图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-13 17:26:20
 */
const customSprites: Record<string, (index: number) => ImageSpriteCoordinatesItem> = {
    datePicker_white: (index: number) => {
        if (index <= 3) {
            return {
                width: 16,
                height: 16,
                x: index * 16,
                y: 0,
            }
        } else if (index === 4) {
            return {
                width: 20,
                height: 20,
                x: 0,
                y: 16,
            }
        } else if (index === 5) {
            return {
                width: 13,
                height: 12,
                x: 32,
                y: 16,
            }
        } else {
            return {
                width: 13,
                height: 12,
                x: 48,
                y: 16,
            }
        }
    },
    datePicker: (index: number) => {
        if (index <= 3) {
            return {
                width: 16,
                height: 16,
                x: index * 16,
                y: 0,
            }
        } else if (index === 4) {
            return {
                width: 20,
                height: 20,
                x: 0,
                y: 16,
            }
        } else if (index === 5) {
            return {
                width: 13,
                height: 12,
                x: 32,
                y: 16,
            }
        } else {
            return {
                width: 13,
                height: 12,
                x: 48,
                y: 16,
            }
        }
    },
    pageBtn: (index: number) => {
        return {
            width: 40,
            height: 40,
            x: (index % 4) * 40,
            y: Math.floor(index / 4) * 40,
        }
    },
}

export default customSprites
