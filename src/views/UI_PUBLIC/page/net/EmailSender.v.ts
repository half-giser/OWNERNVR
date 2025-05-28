/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 15:00:10
 * @Description: E-mail发送
 */
import { type FormRules } from 'element-plus'
import EmailSenderTestPop from './EmailSenderTestPop.vue'

export default defineComponent({
    components: {
        EmailSenderTestPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const router = useRouter()

        const DEFAULT_SECURE_PORT = 465
        const DEFAULT_INSECURE_PORT = 25

        const formRef = useFormRef()
        const formData = ref(new NetEmailForm())
        const formRule = ref<FormRules>({
            address: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
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
                    validator(_rule, value: string, callback) {
                        if (formData.value.anonymousSwitch) {
                            callback()
                            return
                        }

                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                            return
                        }

                        if (!cutStringByByte(value, nameByteMaxLen)) {
                            callback(new Error(Translate('IDCS_INVALID_CHAR')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator(_rule, value: string, callback) {
                        if (formData.value.anonymousSwitch || !pageData.value.passwordSwitch) {
                            callback()
                            return
                        }

                        if (!value.length) {
                            callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            server: [
                {
                    validator(_rule, value: string, callback) {
                        // smtp服务器格式为 a.b.c.d ,多个点分割，可为数字字母或-，但-不能开头
                        if (!checkStmpServer(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_SMTPSERVER')))
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
            imgTypeOptions: [
                {
                    label: Translate('IDCS_FACE_SNAP_IMAGE'),
                    value: 'snapImgSwitch',
                },
                {
                    label: Translate('IDCS_ORIGINAL'),
                    value: 'orgImgSwitch',
                },
            ],
            // 图片数量选项
            imageNumberOptions: arrayToOptions([4, 5, 6, 7, 8, 9, 10]),
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
            openLoading()

            const result = await queryEmailCfg()
            commLoadResponseHandler(result, ($) => {
                const $sender = queryXml($('content/sender')[0].element)
                formData.value.anonymousSwitch = $sender('anonymousSwitch').text().bool()
                formData.value.nameMaxByteLen = $sender('name').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.name = $sender('name').text()
                formData.value.addressMaxByteLen = $sender('address').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.address = $sender('address').text()
                formData.value.userNameMaxByteLen = $sender('userName').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.userName = $sender('userName').text()
                formData.value.serverMaxByteLen = $sender('smtp/server').attr('maxByteLen').num() || nameByteMaxLen
                formData.value.server = $sender('smtp/server').text()
                formData.value.portMin = $sender('smtp/port').attr('min').num() || 10
                formData.value.portMax = $sender('smtp/port').attr('min').num() || 65535
                formData.value.port = $sender('smtp/port').text().num()
                formData.value.attachImg = $sender('attachImg').text().num()
                formData.value.imageNumber = $sender('imageNumber').text().num()

                if ($sender('snapImgSwitch').text().bool()) {
                    formData.value.imgType.push('snapImgSwitch')
                }

                if ($sender('orgImgSwitch').text().bool()) {
                    formData.value.imgType.push('orgImgSwitch')
                }

                let ssl = $sender('smtp/ssl').text()
                if (ssl === 'true') {
                    ssl = 'SSL'
                } else if (ssl === 'false') {
                    ssl = 'NO'
                }
                formData.value.ssl = ssl
            })

            closeLoading()
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
                openMessageBox(Translate('IDCS_NO_AUTH'))
                return
            }
            router.push({
                path: '/config/alarm/email',
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
                openMessageBox(Translate('IDCS_MAIL_ARENOT_ENCRYPTED_WITHOUT_SSL'))
            }
        }

        /**
         * @description 邮箱地址输入
         */
        const handleAddressInput = () => {
            const diff = Math.abs(formData.value.address.length - formData.value.userName.length)
            if ((formData.value.address.startsWith(formData.value.userName) || formData.value.userName.startsWith(formData.value.address)) && diff === 1) {
                formData.value.userName = formData.value.address
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
            formRef.value!.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const password = AES_encrypt(formData.value.password, userSession.sesionKey)
                    const sendXml = rawXml`
                        <content>
                            <sender>
                                <address>${wrapCDATA(formData.value.address)}</address>
                                <name>${wrapCDATA(formData.value.name)}</name>
                                <userName>${wrapCDATA(formData.value.userName)}</userName>
                                ${formData.value.anonymousSwitch ? `<password ${getSecurityVer()}>${password}</password>` : ''}
                                <anonymousSwitch>${formData.value.anonymousSwitch}</anonymousSwitch>
                                <attachImg>${formData.value.attachImg}</attachImg>
                                <imageNumber>${formData.value.imageNumber}</imageNumber>
                                <snapImgSwitch>${formData.value.imgType.includes('snapImgSwitch')}</snapImgSwitch>
                                <orgImgSwitch>${formData.value.imgType.includes('orgImgSwitch')}</orgImgSwitch>
                                <smtp>
                                    <server>${wrapCDATA(formData.value.server)}</server>
                                    <port>${formData.value.port}</port>
                                    <ssl>${formData.value.ssl}</ssl>
                                </smtp>
                            </sender>
                        </content>
                    `
                    const result = await editEmailCfg(sendXml)
                    closeLoading()
                    commSaveResponseHandler(result)
                }
            })
        }

        /**
         * @description 约束STMP服务器的输入
         * @param {string} value
         * @returns {string}
         */
        const formatSTMPServer = (value: string) => {
            return value.replace(/([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-])/g, '')
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
            handleAddressInput,
            formatSTMPServer,
        }
    },
})
