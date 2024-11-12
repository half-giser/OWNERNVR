/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 17:41:05
 * @Description: AI-联动-录像-选择面板
 */
export default defineComponent({
    props: {
        /**
         * @property {Array} 选中值
         */
        modelValue: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
    },
    emits: {
        'update:modelValue'(e: SelectOption<string, string>[]) {
            return Array.isArray(e)
        },
    },
    setup(_prop, ctx) {
        const pageData = ref({
            isPop: false,
            recordList: [] as SelectOption<string, string>[],
        })

        /**
         * @description 获取报录像通道列表
         */
        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        /**
         * @description 确认选项 关闭弹窗
         * @param {Array} option
         */
        const confirm = (option: SelectOption<string, string>[]) => {
            ctx.emit('update:modelValue', option)
            pageData.value.isPop = false
        }

        /**
         * @description 取消 关闭弹窗
         */
        const close = () => {
            pageData.value.isPop = false
        }

        onMounted(() => {
            getRecordList()
        })

        return {
            pageData,
            confirm,
            close,
        }
    },
})
