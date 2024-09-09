/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 16:12:31
 * @Description: 新增通道组弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 16:15:00
 */
import ChannelGroupAdd from './ChannelGroupAdd.vue'
export default defineComponent({
    components: {
        ChannelGroupAdd,
    },
    emits: {
        close() {
            return true
        },
        callBack() {
            return true
        },
    },
    setup() {
        return {
            ChannelGroupAdd,
        }
    },
})
