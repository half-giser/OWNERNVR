/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:38:42
 * @Description: 智能分析 - 添加收藏
 */
import type { FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property LocalStorage的key
         */
        storageKey: {
            type: String,
            required: true,
        },
        /**
         * @property 需要收藏的数据
         */
        data: {
            type: Object as PropType<Partial<IntelSearchCollectList>>,
            required: true,
        },
    },
    emits: {
        change(e: IntelSearchCollectList) {
            return !!e
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const listData = ref<IntelSearchCollectList[]>([])

        // 最大的列表长度
        const MAX_STORAGE_LIMIT = 6

        const pageData = ref({
            // 是否打开收藏弹窗
            isPop: false,
        })

        const formRef = useFormRef()

        const formData = ref({
            name: '',
        })

        const formRule = ref<FormRules>({
            name: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_EMPTY')))
                            return
                        }

                        if (listData.value.map((item) => item.name).includes(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_CHANNEL_NAME_EXIST')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 选中当前收藏的数据
         * @param {number} index
         */
        const change = (index: number) => {
            ctx.emit('change', listData.value[index])
        }

        /**
         * @description 添加收藏
         */
        const addCollect = () => {
            pageData.value.isPop = true
        }

        /**
         * @description 验证表单通过后，添加收藏
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (listData.value.length >= MAX_STORAGE_LIMIT) {
                        openMessageBox({
                            type: 'question',
                            title: Translate('IDCS_QUESTION_MSG'),
                            message: Translate('IDCS_MAX_COLLECT_QUESTION'),
                        }).then(() => {
                            listData.value.shift()
                            confirmAddCollect()
                        })
                    } else {
                        confirmAddCollect()
                    }
                }
            })
        }

        /**
         * @description 确认添加收藏
         */
        const confirmAddCollect = () => {
            const data = new IntelSearchCollectList()
            listData.value.push({
                ...data,
                ...prop.data,
                name: formData.value.name,
            })
            localStorage.setItem(prop.storageKey, JSON.stringify(listData.value))
            pageData.value.isPop = false
        }

        /**
         * @description 删除选中的收藏
         * @param {number} index
         */
        const deleteCollect = (index: number) => {
            openMessageBox({
                type: 'question',
                title: Translate('IDCS_DELETE'),
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                listData.value.splice(index, 1)
                localStorage.setItem(prop.storageKey, JSON.stringify(listData.value))
            })
        }

        /**
         * @description 约束输入框的输入
         * @param {string} value
         * @returns {string}
         */
        const formatInput = (value: string) => {
            value = value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
            return value
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            pageData.value.isPop = false
        }

        // 回显收藏列表
        watch(
            () => prop.storageKey,
            () => {
                const data = localStorage.getItem(prop.storageKey)
                if (data) {
                    listData.value = JSON.parse(data)
                } else {
                    listData.value = []
                }
            },
            {
                immediate: true,
            },
        )

        return {
            listData,
            pageData,
            change,
            addCollect,
            verify,
            deleteCollect,
            formRef,
            formData,
            formRule,
            formatInput,
            close,
        }
    },
})
