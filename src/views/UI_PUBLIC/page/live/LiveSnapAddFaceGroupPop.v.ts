/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:08:34
 * @Description: 新增人脸组弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:51:30
 */
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
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
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const formRef = ref<FormInstance>()
        const formData = ref({
            name: '',
        })
        const formRule = ref<FormRules>({
            name: {
                validator(rule, value, callback) {
                    if (!value.trim().length) {
                        callback(new Error(Translate('IDCS_GROUP_NAME_EMPTY')))
                        return
                    }
                    callback()
                },
                trigger: 'blur',
            },
        })

        /**
         * @description 验证表单通过后 新增人脸组
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    addGroup()
                }
            })
        }

        /**
         * @description 新增人脸组
         */
        const addGroup = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <name>${formData.value.name}</name>
                </content>
            `
            const result = await createFacePersonnalInfoGroup(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                commLoadResponseHandler(result, () => {
                    ctx.emit('confirm')
                })
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_LIMIT_MAX_SUBSYSTEM_NUM:
                        errorInfo = Translate('IDCS_TARGET_LIBRARY_GROUP_NUM_LIMITED')
                        break
                    case ErrorCode.USER_ERROR_NAME_EXISTED:
                        errorInfo = Translate('IDCS_GROUP_NAME_SAME')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                }
                if (!errorInfo) {
                    commLoadResponseHandler(result)
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: errorInfo,
                    })
                }
            }
        }

        /**
         * @description 打开弹窗时 重置表单
         */
        const open = () => {
            formRef.value?.resetFields()
            formRef.value?.clearValidate()
        }

        return {
            verify,
            formData,
            formRule,
            formRef,
            open,
        }
    },
})
