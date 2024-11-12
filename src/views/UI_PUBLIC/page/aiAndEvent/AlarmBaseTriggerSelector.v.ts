/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 17:41:26
 * @Description: AI-联动-常规联动-选择面板
 */
import { type CheckboxGroupValueType } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property {Array} 选中值
         */
        modelValue: {
            type: Array as PropType<string[]>,
            required: true,
        },
        /**
         * @property {Array} 包含的选项
         */
        include: {
            type: Array as PropType<string[]>,
            default: () => ['snapSwitch', 'msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch'],
        },
    },
    emits: {
        'update:modelValue'(e: string[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        // 联动类型与文本的映射
        const TRIGGER_MAPPING: Record<string, string> = {
            snapSwitch: Translate('IDCS_SNAP'),
            msgPushSwitch: Translate('IDCS_PUSH'),
            buzzerSwitch: Translate('IDCS_BUZZER'),
            popVideoSwitch: Translate('IDCS_VIDEO_POPUP'),
            emailSwitch: Translate('IDCS_EMAIL'),
            popMsgSwitch: Translate('IDCS_MESSAGEBOX_POPUP'),
            triggerAudio: 'IPC_' + Translate('IDCS_AUDIO'),
            triggerWhiteLight: 'IPC_' + Translate('IDCS_LIGHT'),
        }

        // 联动选项
        const triggerList = computed(() => {
            return prop.include.map((value) => {
                return {
                    value,
                    label: TRIGGER_MAPPING[value],
                }
            })
        })

        // 是否全选
        const isCheckAll = computed(() => {
            return triggerList.value.length <= prop.modelValue.length
        })

        /**
         * @description 全选 / 取消全选
         */
        const toggleCheckAll = () => {
            if (isCheckAll.value) {
                ctx.emit('update:modelValue', [])
            } else {
                ctx.emit(
                    'update:modelValue',
                    triggerList.value.map((item) => item.value),
                )
            }
        }

        /**
         * @description 修改选项
         * @param {string[]} val
         */
        const change = (val: CheckboxGroupValueType) => {
            ctx.emit('update:modelValue', val as string[])
        }

        return {
            triggerList,
            isCheckAll,
            toggleCheckAll,
            change,
        }
    },
})
