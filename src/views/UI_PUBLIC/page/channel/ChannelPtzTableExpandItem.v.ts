/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 09:24:09
 * @Description: 云台 表格展开通用列表项
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-27 09:12:17
 */
export default defineComponent({
    props: {
        file: {
            type: String,
            required: false,
        },
        text: {
            type: String,
            default: '',
        },
    },
    emits: {
        delete() {
            return true
        },
    },
})
