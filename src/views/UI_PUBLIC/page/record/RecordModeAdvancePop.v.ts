/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:46
 * @Description:
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-02 14:39:57
 */
import { type RecMode } from '@/types/apiType/record'
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        advanceRecModes: Array<RecMode>,
    },
    emits: ['confirm', 'close'],
    setup() {
        const userSessionStore = useUserSessionStore()

        //选择的值
        const selectedEvents = ref([] as string[])

        // 选中当前生效的高级模式的时间
        if (userSessionStore.advanceRecModeId) {
            selectedEvents.value = userSessionStore.advanceRecModeId.split('_')
        }

        const isIntensiveDisabled = computed(() => {
            return selectedEvents.value.includes(REC_MODE_TYPE.POS)
        })

        watch(selectedEvents, () => {
            if (selectedEvents.value.includes(REC_MODE_TYPE.POS) && !selectedEvents.value.includes(REC_MODE_TYPE.INTENSIVE)) {
                selectedEvents.value.push(REC_MODE_TYPE.INTENSIVE)
            }
        })

        return {
            selectedEvents,
            isIntensiveDisabled,
        }
    },
})
