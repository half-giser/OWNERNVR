/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-22 15:27:03
 * @Description:
 */

import { defineComponent } from 'vue'
import BaseScheduleLine from './BaseScheduleLine.vue'

export default defineComponent({
    components: {
        BaseScheduleLine,
    },
    props: {
        //周排程控件的宽度
        width: {
            type: Number,
            require: true,
            default: 300,
        },
    },
    setup() {
        const weekdayLang = ['IDCS_SUNDAY', 'IDCS_MONDAY', 'IDCS_TUESDAY', 'IDCS_WEDNESDAY', 'IDCS_THURSDAY', 'IDCS_FRIDAY', 'IDCS_SATURDAY']
        const scheduleLines: Ref<InstanceType<typeof BaseScheduleLine>[] | null> = ref(null)
        const copyToCheckedDay: Ref<number[]> = ref([])

        onMounted(() => {})

        //当前打开复制到面板的天序号
        const curCopyToPlIndex = ref(-1)

        /**
         * 记录当前打开复制到的按钮（在周排程时，打开一个手动输入/复制到，需要关闭其他天的手动输入/复制到，不能阻止冒泡，导致document点击时间不触发）
         */
        let copyToATarget: EventTarget | null = null

        /**
         * 关闭复制到弹框
         */
        const copyToClose = (event: Event | null) => {
            if (event == null || event.target != copyToATarget) {
                curCopyToPlIndex.value = -1
                document.removeEventListener('click', copyToClose)
            }
        }

        /**
         * 打开复制到弹框
         * @param index
         */
        const copyToOpen = (index: number, event: Event) => {
            copyToATarget = event.target
            curCopyToPlIndex.value = index
            const arrDay = [...new Array(7).keys()]
            arrDay.splice(index, 1)
            copyToCheckedDay.value = arrDay
            console.log(copyToCheckedDay.value)
            document.addEventListener('click', copyToClose)
        }

        /**
         * 复制到确定按钮事件
         * @param index
         * @returns
         */
        const copyToOk = (index: number) => {
            // console.log(copyToCheckedDay.value)
            if (copyToCheckedDay.value.length === 0) return

            const selectLines = scheduleLines.value?.filter((item: InstanceType<typeof BaseScheduleLine>) => {
                return copyToCheckedDay.value.indexOf(Number((item.$attrs['id'] as string).substring(5))) !== -1
            })
            const curLine = scheduleLines.value?.find((item) => {
                return item.$attrs['id'] === `line-${index}`
            })

            const curValue = (curLine as any as InstanceType<typeof BaseScheduleLine>).getValue()
            selectLines?.forEach((item) => {
                item.resetValue(curValue)
            })
            copyToClose(null)
        }

        return { weekdayLang, curCopyToPlIndex, copyToOpen, copyToOk, copyToClose, scheduleLines, copyToCheckedDay }
    },
})
