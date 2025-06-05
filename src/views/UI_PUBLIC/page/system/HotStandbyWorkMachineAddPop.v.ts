/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-06-04 17:18:19
 * @Description: 新增/编辑工作机弹窗
 */
import type { FormRules } from 'element-plus'

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
         * @property {Object} 工作机数据（编辑状态需要用到）
         */
        workMachineData: {
            type: Object as PropType<SystemWorkMachineDto>,
            default: () => new SystemWorkMachineDto(),
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
        const userSessionStore = useUserSessionStore()

        const formRef = useFormRef()
        const formData = ref(new WorkMachineSettingsForm())
        const formRule = ref<FormRules>({})

        const pageData = ref({
            passwordSwitch: false,
        })

        /**
         * @description 打开弹窗时 重置表单
         */
        const open = () => {
            formData.value = new WorkMachineSettingsForm()
            formData.value.userName = userSessionStore.userName
            if (prop.type === 'add') {
                // 添加工作机时端口默认为6036，和设备端保持一致
                formData.value.port = 6036
            } else if (prop.type === 'edit') {
                formData.value.ip = prop.workMachineData.ip
                formData.value.port = prop.workMachineData.port
            }
        }

        /**
         * @description 处理错误码（increaseWorkMachine、modifyWorkMachine）
         * @param {number} errorCode
         */
        const handleError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_OVER_LIMIT:
                    errorInfo = Translate('IDCS_OVER_MAX_NUMBER_LIMIT')
                    break
                case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                    errorInfo = Translate('IDCS_WORK_MACHINE_EXISTS')
                    break
                default:
                    errorInfo = Translate('IDCS_SAVE_FAIL')
                    break
            }
            openMessageBox(errorInfo)
        }

        /**
         * @description 处理错误码（testRecorder）
         * @param {number} errorCode
         */
        const handleTestError = (errorCode: number) => {
            let errorInfo = ''
            switch (errorCode) {
                case ErrorCode.USER_ERROR_NO_USER:
                case ErrorCode.USER_ERROR_PWD_ERR:
                    errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                    break
                case ErrorCode.USER_ERROR_USER_LOCKED:
                    errorInfo = Translate('IDCS_REMOTE_USER_LOCKED')
                    break
                case ErrorCode.USER_ERROR_NO_AUTH:
                    errorInfo = Translate('IDCS_NO_PERMISSION')
                    break
                case ErrorCode.USER_ERROR_CHECK_FILE_ERROR:
                    errorInfo = Translate('IDCS_RECORDER_HTTPPORT_ERR')
                    break
                case ErrorCode.USER_ERROR_NODE_NET_OFFLINE:
                    errorInfo = Translate('IDCS_NODE_NOT_ONLINE')
                    break
                case ErrorCode.USER_ERROR_UNSUPPORTED_NODE:
                    errorInfo = Translate('IDCS_HOT_STANDBY_TEST_ERROR_NOT_SUPPORT') + Translate('IDCS_UNABLE_TO_CONNECT_FORMAT')
                    break
                case ErrorCode.USER_ERROR_UNSUPPORTED_FUNC:
                    errorInfo = Translate('IDCS_HOT_STANDBY_TEST_ERROR_NOT_WORK_MACHINE') + Translate('IDCS_UNABLE_TO_CONNECT_FORMAT')
                    break
                case ErrorCode.USER_ERROR_OVER_LIMIT:
                    errorInfo = Translate('IDCS_HOT_STANDBY_TEST_ERROR_DUPLICATED_CONNECTION') + Translate('IDCS_UNABLE_TO_CONNECT_FORMAT')
                    break
                case ErrorCode.USER_ERROR_DEVICE_TYPE_ERROR:
                    errorInfo = Translate('IDCS_HOT_STANDBY_TEST_ERROR_PRODUCT_DIFF') + Translate('IDCS_UNABLE_TO_CONNECT_FORMAT')
                    break
                default:
                    errorInfo = Translate('IDCS_SAVE_FAIL')
                    break
            }
            openMessageBox(errorInfo)
        }

        /**
         * @description 创建新工作机
         */
        const addWorkMachine = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <ip>${formData.value.ip}</ip>
                    <port>${formData.value.port}</port>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                </content>
            `
            const result = await increaseWorkMachine(sendXml)
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
                handleError($('errorCode').text().num())
            }
        }

        /**
         * @description 编辑工作机
         */
        const editWorkMachine = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <index>${prop.workMachineData.index}</index>
                    <ip>${formData.value.ip}</ip>
                    <port>${formData.value.port}</port>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                </content>
            `
            const result = await modifyWorkMachine(sendXml)
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
                handleError($('errorCode').text().num())
            }
        }

        /**
         * @description 测试工作机
         */
        const test = async () => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <isWorkMachine>true</isWorkMachine>
                    <ip>${formData.value.ip}</ip>
                    <port>${formData.value.port}</port>
                    <userName>${formData.value.userName}</userName>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSessionStore.sesionKey))}</password>
                </content>
            `
            const result = await testRecorder(sendXml)
            const $ = queryXml(result)
            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_SUCCESS'),
                }).finally(() => {
                    ctx.emit('confirm')
                })
            } else {
                handleTestError($('errorCode').text().num())
            }
        }

        /**
         * @description 验证表单通过后 创建或者编辑工作机
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    if (prop.type === 'add') {
                        addWorkMachine()
                    } else {
                        editWorkMachine()
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
            formData,
            formRule,
            pageData,
            open,
            test,
            verify,
            close,
        }
    },
})
