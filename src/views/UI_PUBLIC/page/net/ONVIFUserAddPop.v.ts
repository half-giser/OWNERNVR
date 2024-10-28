/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 20:09:41
 * @Description: OVNIF 新增/编辑用户弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 18:16:56
 */
import type { FormInstance, FormRules } from 'element-plus'
import { NetOnvifUserForm, NetOnvifUserList } from '@/types/apiType/net'

export default defineComponent({
    props: {
        /**
         * @property {Enum} 弹窗类型 ‘add' | 'edit'
         */
        type: {
            type: String,
            default: 'add',
        },
        /**
         * @property {Object} 用户数据（编辑状态需要用到）
         */
        userData: {
            type: Object as PropType<NetOnvifUserList>,
            default: () => new NetOnvifUserList(),
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const userSession = useUserSessionStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetOnvifUserForm())
        const formRule = ref<FormRules>({
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }

                        if (!checkIllegalChar(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (prop.type === 'edit' && !pageData.value.passwordSwitch) {
                            callback()
                            return
                        }

                        if (!value) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        if (strength.value < 2) {
                            callback(new Error(Translate('IDCS_PWD_STRONG_ERROR')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            confirmPassword: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (value !== formData.value.password) {
                            callback(new Error(Translate('IDCS_PWD_MISMATCH_TIPS')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            levelList: [
                {
                    value: 'video',
                    label: Translate('IDCS_VIDEO_USER'),
                },
                {
                    value: 'operator',
                    label: Translate('IDCS_OPERATE_USER'),
                },
                {
                    value: 'admin',
                    label: Translate('IDCS_NORMAL_ADMIN'),
                },
            ],
            passwordSwitch: false,
        })

        const strength = computed(() => getPwdSaftyStrength(formData.value.password))

        /**
         * @description 打开弹窗时 重置表单
         */
        const open = () => {
            formRef.value?.clearValidate()
            formData.value = new NetOnvifUserForm()
            if (prop.type === 'edit') {
                formData.value.userName = prop.userData.userName
                formData.value.userLevel = prop.userData.userLevel
            }
        }

        /**
         * @description 处理错误代码
         * @param {number} errorCode
         */
        const handleError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NAME_EXISTED:
                    errorInfo = Translate('IDCS_PROMPT_CUSTOME_VIEW_NAME_EXIST')
                    break
                case ErrorCode.USER_ERROR_OVER_LIMIT:
                    errorInfo = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    break
                default:
                    errorInfo = Translate('IDCS_SAVE_FAIL')
                    break
            }
            openMessageTipBox({
                type: 'info',
                message: errorInfo,
            })
        }

        /**
         * @description 创建新用户
         */
        const addUser = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <item>
                        <userLevel>${formData.value.userLevel}</userLevel>
                        <userName>${formData.value.userName}</userName>
                        <password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>
                    </item>
                </content>
            `
            const result = await createOnvifUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                handleError(Number($('//errorCode').text()))
            }
        }

        /**
         * @description 编辑用户
         */
        const editUser = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <item id="${prop.userData.id}">
                        <userLevel>${formData.value.userLevel}</userLevel>
                        <userName>${formData.value.userName}</userName>
                        ${ternary(pageData.value.passwordSwitch, `<password${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>`, '')}
                    </item>
                </content>
            `
            const result = await editOnvifUser(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                handleError(Number($('//errorCode').text()))
            }
        }

        /**
         * @description 验证表单通过后 创建或者编辑用户
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    if (prop.type === 'add') {
                        addUser()
                    } else {
                        editUser()
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
            strength,
            formRef,
            formData,
            formRule,
            pageData,
            open,
            verify,
            close,
        }
    },
})
