/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:29
 * @Description:事件录像码流
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-08 13:46:00
 */

import RecordStreamTable from '@/views/UI_PUBLIC/page/record/RecordStreamTable.vue'
import { defineComponent, ref } from 'vue'
export default defineComponent({
    components: {
        RecordStreamTable,
    },
    setup() {
        const mode = ref('event')
        return {
            mode,
        }
    },
})
