/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 15:00:10
 * @Description: E-mail发送
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 16:28:44
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { NetEmailForm } from '@/types/apiType/net'
import EmailSenderTestPop from './EmailSenderTestPop.vue'

export default defineComponent({
    components: {
        EmailSenderTestPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSession = useUserSessionStore()
        const router = useRouter()

        const DEFAULT_SECURE_PORT = 465
        const DEFAULT_INSECURE_PORT = 25

        const formRef = ref<FormInstance>()
        const formData = ref(new NetEmailForm())
        const formRule = ref<FormRules>({
            address: [
                {
                    validator(rule, value: string, callback) {
                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')))
                            return
                        }
                        if (!checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            userName: [
                {
                    validator(rule, value: string, callback) {
                        if (!formData.value.anonymousSwitch) {
                            callback()
                            return
                        }
                        if (!value.length) {
                            callback(new Error('IDCS_PROMPT_USERNAME_EMPTY'))
                            return
                        }
                        if (!cutStringByByte(value, nameByteMaxLen)) {
                            callback(new Error('IDCS_INVALID_CHAR'))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(rule, value: string, callback) {
                        if (!formData.value.anonymousSwitch || !pageData.value.passwordSwitch) {
                            callback()
                        }
                        if (!value.length) {
                            callback(new Error('IDCS_PROMPT_PASSWORD_EMPTY'))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            server: [
                {
                    validator(rule, value: string, callback) {
                        // smtp服务器格式为 a.b.c.d ,多个点分割，可为数字字母或-，但-不能开头
                        if (!checkStmpServer(value)) {
                            callback(new Error('IDCS_PROMPT_INVALID_SMTPSERVER'))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const pageData = ref({
            // 启用修改密码的开关
            passwordSwitch: false,
            // 附加图片选项
            attachImgOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 0,
                },
                {
                    label: Translate('IDCS_IMAGE_ONE'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_IMAGE_MULT'),
                    value: 2,
                },
            ] as SelectOption<number, string>[],
            // 图片数量选项
            imageNumberOptions: [4, 5, 6, 7, 8, 9, 10],
            // 加密选项
            secureConnectOptions: [
                {
                    label: Translate('IDCS_NO'),
                    value: 'NO',
                },
                {
                    label: Translate('TLS'),
                    value: 'TLS',
                },
                {
                    label: Translate('SSL'),
                    value: 'SSL',
                },
            ] as SelectOption<string, string>[],
            // 测试弹窗显隐状态
            isTest: false,
            // 发件人地址与用户名一致时，focus时共同显示原值
            showUserNameValue: false,
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryEmailCfg()
            commLoadResponseHandler(result, ($) => {
                formData.value.anonymousSwitch = $('/response/content/sender/anonymousSwitch').text().toBoolean()
                formData.value.name = $('/response/content/sender/name').text()
                formData.value.address = $('/response/content/sender/address').text()
                formData.value.userName = $('/response/content/sender/userName').text()
                formData.value.server = $('/response/content/sender/smtp/server').text()
                formData.value.port = Number($('/response/content/sender/smtp/port').text())
                formData.value.attachImg = Number($('/response/content/sender/attachImg').text())
                formData.value.imageNumber = Number($('/response/content/sender/imageNumber').text())
                formData.value.ssl = $('/response/content/sender/smtp/ssl').text().toBoolean() ? 'SSL' : 'NO'
            })

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 验证表单通过后，打开测试弹窗
         */
        const handleTest = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.isTest = true
                }
            })
        }

        /**
         * @description 跳转编辑收件人页面
         */
        const handleEdit = () => {
            if (!userSession.hasAuth('alarmMgr')) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_NO_AUTH'),
                })
                return
            }
            router.push({
                path: '/config/alarm/email/recipients',
            })
        }

        /**
         * @description 设置默认端口
         */
        const setDefaultPort = () => {
            if (formData.value.ssl === 'SSL') {
                formData.value.port = DEFAULT_SECURE_PORT
            } else {
                formData.value.port = DEFAULT_INSECURE_PORT
            }
        }

        /**
         * @description 改变加密方式时，更改默认端口
         */
        const changeSecurityConnection = () => {
            setDefaultPort()
            if (formData.value.ssl === 'NO') {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_MAIL_ARENOT_ENCRYPTED_WITHOUT_SSL'),
                })
            }
        }

        /**
         * @description 用户名输入框获得焦点时触发
         */
        const handleUserNameFocus = () => {
            if (formData.value.address === formData.value.userName) {
                pageData.value.showUserNameValue = true
            } else {
                pageData.value.showUserNameValue = false
            }
        }

        /**
         * @description 用户名输入框失去焦点时触发
         */
        const handleUserNameBlur = () => {
            pageData.value.showUserNameValue = false
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const password = AES_encrypt(formData.value.password, userSession.sesionKey)
            const sendXml = rawXml`
                <content>
                    <sender>
                        <address>${wrapCDATA(formData.value.address)}</address>
                        <name>${wrapCDATA(formData.value.name)}</name>
                        <userName>${wrapCDATA(formData.value.userName)}</userName>
                        ${formData.value.anonymousSwitch ? `<password ${getSecurityVer()}>${password}</password>` : ''}
                        <anonymousSwitch>${formData.value.anonymousSwitch.toString()}</anonymousSwitch>
                        <attachImg>${formData.value.attachImg.toString()}</attachImg>
                        <imageNumber>${formData.value.imageNumber.toString()}</imageNumber>
                        <smtp>
                            <server>${wrapCDATA(formData.value.server)}</server>
                            <port>${String(formData.value.port)}</port>
                            <ssl>${formData.value.ssl}</ssl>
                        </smtp>
                    </sender>
                </content>
            `
            const result = await editEmailCfg(sendXml)
            commSaveResponseHadler(result)
            closeLoading(LoadingTarget.FullScreen)
        }

        onMounted(() => {
            getData()
        })

        return {
            formData,
            formRef,
            formRule,
            pageData,
            setData,
            handleTest,
            handleEdit,
            setDefaultPort,
            changeSecurityConnection,
            handleUserNameFocus,
            handleUserNameBlur,
            EmailSenderTestPop,
        }
    },
})
