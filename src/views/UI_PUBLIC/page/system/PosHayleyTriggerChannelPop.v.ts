/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 17:13:17
 * @Description: POS联动通道设置（Hayley）
 */
import { type SystemPosListChls } from '@/types/apiType/system'

export default defineComponent({
    props: {
        /**
         * @property 最大取值
         */
        max: {
            type: Number,
            default: 4294967295,
        },
        /**
         * @property 通道列表
         */
        chls: {
            type: Array as PropType<SystemPosListChls[]>,
            required: true,
        },
        /**
         * @property 已选通道
         */
        linkChls: {
            type: Array as PropType<string[]>,
            required: true,
        },
    },
    emits: {
        confirm(e: SystemPosListChls[]) {
            return e
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()

        const chlList = ref<SystemPosListChls[]>([])
        const tableData = ref<SystemPosListChls[]>([])

        /**
         * @description 获取通道列表数据
         */
        const getData = async () => {
            const result = await getChlList({
                requireField: ['device'],
            })

            commLoadResponseHandler(result, ($) => {
                chlList.value = $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id')!,
                        label: $item('name').text(),
                        till: '',
                    }
                })
            })
        }

        /**
         * @description 打开弹窗时，请求通道列表，更新表单数据
         */
        const open = async () => {
            if (!chlList.value.length) {
                await getData()
            }
            const selectedList = (prop.chls as SystemPosListChls[]).map((item) => item.value)

            // 需把源数据的通道从选中通道移除掉
            tableData.value = chlList.value
                .filter((item) => {
                    if (prop.linkChls.includes(item.value) && !selectedList.includes(item.value)) {
                        return false
                    }
                    return true
                })
                .map((item) => {
                    const index = selectedList.indexOf(item.value)
                    if (index > -1) {
                        return {
                            ...item,
                            till: (prop.chls as SystemPosListChls[])[index].till,
                        }
                    }
                    return item
                })
        }

        /**
         * @description 验证表单，验证通过后保存数据
         */
        const verify = () => {
            // 是否取值在 1 -- 4294967295 范围
            const isValid = tableData.value.every((item) => {
                if (item.till === '') return true
                const till = Number(item.till)
                return !isNaN(till) && till > 0 && till <= prop.max
            })
            if (!isValid) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_POS_TILL_RANGE').formatForLang(1, prop.max),
                })
                return
            }

            // 是否重复
            const filterTillNum = tableData.value.filter((item) => Number(item.till))
            const isNoSameTillNumber = filterTillNum.length === Array.from(new Set(filterTillNum.map((item) => item.till))).length
            if (!isNoSameTillNumber) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_POS_TILL_SAME_ERROR'),
                })
                return
            }

            ctx.emit('confirm', filterTillNum)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            open,
            verify,
            close,
            tableData,
        }
    },
})
