/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-13 16:21:55
 * @Description: 需要特殊计算位置的雪碧图
 */
import sprites from './sprites'

const pageBtn = sprites.coordinates.pageBtn || [0, 0, 0, 0]
const datePicker = sprites.coordinates.datePicker || [0, 0, 0, 0]

const customSprites: Record<string, number[]> = {
    'pageBtn-first': [pageBtn[0], pageBtn[1], 160, 40],
    'pageBtn-prev': [pageBtn[0], pageBtn[1] + 40, 160, 40],
    'pageBtn-next': [pageBtn[0], pageBtn[1] + 80, 160, 40],
    'pageBtn-last': [pageBtn[0], pageBtn[1] + 120, 160, 40],
    'datePicker-first': [datePicker[0], datePicker[1], 16, 16],
    'datePicker-prev': [datePicker[0] + 16, datePicker[1], 16, 16],
    'datePicker-next': [datePicker[0] + 32, datePicker[1], 16, 16],
    'datePicker-last': [datePicker[0] + 48, datePicker[1], 16, 16],
}

export default customSprites
