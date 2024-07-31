import { defineComponent } from 'vue'
import BaseScheduleWeek from '@/components/BaseScheduleWeek.vue'

export default defineComponent({
    components: { BaseScheduleWeek },
    setup() {
        const dragAction = ref('add')

        return { dragAction }
    },
})
