/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 16:21:55
 * @Description: 需要特殊计算位置的雪碧图
 */
const customSprites: Record<string, (index: number) => number[]> = {
    datePicker_white: (index: number) => {
        if (index <= 3) {
            return [index * 16, 0, 16, 16]
        } else if (index === 4) {
            return [0, 16, 20, 20]
        } else if (index === 5) {
            return [32, 16, 13, 12]
        } else {
            return [48, 16, 13, 12]
        }
    },
    datePicker: (index: number) => {
        if (index <= 3) {
            return [index * 16, 0, 16, 16]
        } else if (index === 4) {
            return [0, 16, 20, 20]
        } else if (index === 5) {
            return [32, 16, 13, 12]
        } else {
            return [48, 16, 13, 12]
        }
    },
    pageBtn: (index: number) => {
        return [(index % 4) * 40, Math.floor(index / 4) * 40, 40, 40]
    },
}

export default customSprites
