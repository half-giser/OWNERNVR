/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:29
 * @Description: 定时录像码流
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-09 17:42:56
 */

import RecordStreamTable from '@/views/UI_PUBLIC/page/record/RecordStreamTable.vue'
import { defineComponent, ref } from 'vue'
export default defineComponent({
    components: {
        RecordStreamTable,
    },
    setup() {
        const mode = ref('timing')
        return {
            mode,
        }
    },
})
