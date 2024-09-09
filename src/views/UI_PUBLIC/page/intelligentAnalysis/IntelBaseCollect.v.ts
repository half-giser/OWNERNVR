/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 16:38:42
 * @Description: 智能分析 - 添加收藏
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 16:39:08
 */
import { IntelSearchCollectList } from '@/types/apiType/intelligentAnalysis'
import type { FormInstance, FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property
         */
        storageKey: {
            type: String,
            required: true,
        },
        /**
         * @property
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
        const { openMessageTipBox } = useMessageBox()

        const listData = ref<IntelSearchCollectList[]>([])

        const MAX_STORAGE_LIMIT = 6

        const pageData = ref({
            isPop: false,
        })

        const formRef = ref<FormInstance>()

        const formData = ref({
            name: '',
        })

        const formRule = ref<FormRules>({
            name: [
                {
                    validator(rule, value, callback) {
                        if (!value) {
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

        const change = (index: number) => {
            ctx.emit('change', listData.value[index])
        }

        const addCollect = () => {
            formRef.value?.clearValidate()
            formData.value.name = ''
            pageData.value.isPop = true
        }

        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (listData.value.length >= MAX_STORAGE_LIMIT) {
                        openMessageTipBox({
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

        const deleteCollect = (index: number) => {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_DELETE'),
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                listData.value.splice(index, 1)
                localStorage.setItem(prop.storageKey, JSON.stringify(listData.value))
            })
        }

        const formatInput = (value: string) => {
            value = value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
            return value
        }

        const close = () => {
            pageData.value.isPop = false
        }

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
