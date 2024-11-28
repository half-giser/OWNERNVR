/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:46
 * @Description: 新建录像模式
 */
import { type RecordModeDto } from '@/types/apiType/record'

export default defineComponent({
    props: {
        advanceRecModes: {
            type: Array as PropType<Array<RecordModeDto>>,
            required: true,
        },
    },
    emits: {
        confirm(e: string[]) {
            return Array.isArray(e)
        },
        close() {
            return true
        },
    },
    setup() {
        const userSessionStore = useUserSessionStore()

        //选择的值
        const selectedEvents = ref<string[]>([])

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
