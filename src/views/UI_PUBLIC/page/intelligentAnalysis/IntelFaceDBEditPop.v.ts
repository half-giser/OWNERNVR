/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 10:46:13
 * @Description: 人脸库- 新增/编辑分组
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 编辑时必传，当前分组数据
         */
        data: {
            type: Object as PropType<IntelFaceDBGroupList>,
            default: () => new IntelFaceDBGroupList(),
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
            enableAlarmSwitch: false,
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
         * @description 打开表单时 重置表单
         */
        const open = () => {
            if (prop.type === 'edit') {
                formData.value.groupName = prop.data.name
                formData.value.enableAlarmSwitch = prop.data.enableAlarmSwitch
            } else {
                formData.value.groupName = ''
            }
        }

        /**
         * @description 编辑分组
         */
        const editGroup = async () => {
            openLoading()

            const sendXml = rawXml`
                <types>
                    <property>${wrapEnums(['allow', 'reject', 'limited'])}</property>
                </types>
                <content>
                    <item>
                        <id>${prop.data.id}</id>
                        <groupId>${prop.data.groupId}</groupId>
                        <name>${formData.value.groupName}</name>
                        <property type="property">${prop.data.property}</property>
                        <enableAlarmSwitch>${formData.value.enableAlarmSwitch}</enableAlarmSwitch>
                    </item>
                </content>
            `
            const result = await editFacePersonnalInfoGroup(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_GROUP_NAME_SAME')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 创建分组
         */
        const addGroup = async () => {
            openLoading()

            const sendXml = rawXml`
                <types>
                    <property>${wrapEnums(['allow', 'reject', 'limited'])}</property>
                </types>
                <content>
                    <name>${formData.value.groupName}</name>
                    <property type="property">limited</property>
                </content>
            `
            const result = await createFacePersonnalInfoGroup(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_LIMIT_MAX_SUBSYSTEM_NUM:
                        errorInfo = Translate('IDCS_TARGET_LIBRARY_GROUP_NUM_LIMITED')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_GROUP_NAME_SAME')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL')
                        break
                }
                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 验证表单通过后，创建/编辑分组
         */
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

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formRule,
            formData,
            open,
            close,
            verify,
        }
    },
})
