/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 20:39:26
 * @Description: 智能分析 - 查看原图弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-12 20:39:36
 */
import { type IntelPanoramaPopList } from '@/types/apiType/intelligentAnalysis'

import CanvasBase from '@/utils/canvas/canvasBase'

export default defineComponent({
    props: {
        /**
         * @description 原图数据
         */
        data: {
            type: Object as PropType<IntelPanoramaPopList>,
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
         * @description 渲染矩阵框
         */
        const open = () => {
            if (!context) {
                context = new CanvasBase(canvas.value!)
            }
            context.ClearRect(0, 0, pageData.value.canvasWidth, pageData.value.canvasHeight)

            const X1 = prop.data.X1 * pageData.value.canvasWidth
            const Y1 = prop.data.Y1 * pageData.value.canvasHeight
            const X2 = prop.data.X2 * pageData.value.canvasWidth
            const Y2 = prop.data.Y2 * pageData.value.canvasHeight
            context.Point2Rect(X1, Y1, X2, Y2, {
                lineWidth: 2,
                strokeStyle: '#0000ff',
            })
        }

        return {
            pageData,
            canvas,
            open,
        }
    },
})
