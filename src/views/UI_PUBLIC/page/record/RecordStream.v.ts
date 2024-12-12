/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 11:03:29
 * @Description: 事件录像码流
 */

import RecordBaseStreamTable from '@/views/UI_PUBLIC/page/record/RecordBaseStreamTable.vue'
export default defineComponent({
    components: {
        RecordBaseStreamTable,
    },
    setup() {
        const route = useRoute()

        const pageData = ref({
            mode: '',
            init: false,
        })

        const updateMode = () => {
            pageData.value.mode = route.path
            // 对mode进行处理，获取最后一个/后面的字符串
            pageData.value.mode = pageData.value.mode.substring(pageData.value.mode.lastIndexOf('/') + 1)
            pageData.value.init = true
        }

        onMounted(() => {
            updateMode()
        })

        watch(route, () => {
            updateMode()
        })

        return {
            pageData,
        }
    },
})
