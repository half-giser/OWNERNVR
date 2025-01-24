/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 15:04:43
 * @Description: 车牌库- 新增/编辑分组
 */
import { IntelPlateDBGroupList } from '@/types/apiType/intelligentAnalysis'
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 编辑时必传，当前分组数据
         */
        data: {
            type: Object as PropType<IntelPlateDBGroupList>,
            default: () => new IntelPlateDBGroupList(),
        },
        /**
         * @property {'add' | 'edit'}
         */
        type: {
            type: String,
            default: 'add',
        },
    },
    emits: {
        close() {
            return true
        },
        confirm() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const formRef = useFormRef()

        const formData = ref({
            groupName: '',
        })

        const formRule = ref<FormRules>({
            groupName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_GROUP_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 打开弹窗时 重置表单
         */
        const open = () => {
            if (prop.type === 'edit') {
                formData.value.groupName = prop.data.name
            } else {
                formData.value.groupName = ''
            }
        }

        /**
         * @description 编辑分组
         */
        const editGroup = async () => {
            openLoading()

            const sendXML = rawXml`
                <content>
                    <group type="list">
                        <item id="${prop.data.id}">
                            <name>${formData.value.groupName}</name>
                        </item>
                    </group>
                </content>
            `
            const result = await editPlateLibrary(sendXML)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                ctx.emit('confirm')
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''

                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_GROUP_NAME_SAME')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                }

                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 新增分组
         */
        const addGroup = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <group type="list">
                        <item>
                            <name>${formData.value.groupName}</name>
                        </item>
                    </group>
                </content>
            `
            const result = await addPlateLibrary(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                ctx.emit('confirm')
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_FAIL')

                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_GROUP_NAME_SAME')
                        break
                    case ErrorCode.USER_ERROR_LIMIT_MAX_SUBSYSTEM_NUM:
                        errorInfo = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                }

                openMessageBox(errorInfo)
            }
        }

        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (prop.type === 'edit') {
                        editGroup()
                    } else {
                        addGroup()
                    }
                }
            })
        }

        const close = () => {
            ctx.emit('close')
        }

        return {
            open,
            verify,
            close,
            formData,
            formRule,
            formRef,
        }
    },
})
