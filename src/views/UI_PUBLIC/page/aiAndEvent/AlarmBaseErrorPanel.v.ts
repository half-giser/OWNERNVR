/*
 * @Date: 2025-05-29 17:07:12
 * @Description: AI与事件 错误遮罩
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    props: {
        type: {
            type: String as PropType<'fail' | 'not-support'>,
            default: 'fail',
        },
    },
})
