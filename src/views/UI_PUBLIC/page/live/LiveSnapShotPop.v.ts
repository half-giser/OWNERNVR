/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:50
 * @Description: 查看原图弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:13:50
 */
import CanvasBase from '@/utils/canvas/canvasBase'

export default defineComponent({
    props: {
        pic: {
            type: String,
            required: true,
        },
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
        leftTop: {
            type: String,
            required: true,
        },
        rightBottom: {
            type: String,
            required: true,
        },
    },
    setup(prop) {
        const pageData = ref({
            canvasWidth: 500,
            canvasHeight: 300,
        })

        const canvas = ref<HTMLCanvasElement>()

        let context: CanvasBase

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src?: null | string) => {
            if (!src) return ''
            return 'data:image/png;base64,' + src
        }

        /**
         * @description 渲染矩阵框
         */
        const open = () => {
            if (!context) {
                context = new CanvasBase(canvas.value!)
            }
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

            const pointLeftTop = prop.leftTop
            const pointRightBottm = prop.rightBottom
            const ptWidth = prop.width || 10000
            const ptHeight = prop.height || 10000
            if (pointLeftTop && pointRightBottm) {
                const leftTop = pointLeftTop.slice(1, pointLeftTop.length - 1).split(',')
                const rightBottom = pointRightBottm.slice(1, pointRightBottm.length - 1).split(',')
                const X1 = (Number(leftTop[0]) / ptWidth) * pageData.value.canvasWidth
                const X2 = (Number(rightBottom[0]) / ptWidth) * pageData.value.canvasWidth
                const Y1 = (Number(leftTop[1]) / ptHeight) * pageData.value.canvasHeight
                const Y2 = (Number(rightBottom[1]) / ptHeight) * pageData.value.canvasHeight
                context.Point2Rect(X1, Y1, X2, Y2, {
                    lineWidth: 2,
                    strokeStyle: '#0000ff',
                })
            }
        }

        return {
            pageData,
            canvas,
            open,
            displayBase64Img,
        }
    },
})
