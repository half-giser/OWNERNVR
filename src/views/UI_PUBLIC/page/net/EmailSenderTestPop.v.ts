/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 16:50:11
 * @Description: Email测试发送弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 发件人表单数据
         */
        form: {
            type: Object as PropType<NetEmailForm>,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            isReceiver: false,
            // 收件人列表
            list: [] as NetEmailReceiverDto[],
            // 收件人邮箱地址列表
            cacheAddress: [] as string[],
        })

        const RECEIVER_MAX_COUNT = 16

        const formRef = useFormRef()
        const formData = ref(new NetEmailTestForm())
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

                        if (pageData.value.isReceiver) {
                            if (pageData.value.cacheAddress.includes(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_EMAIL_EXIST')))
                                return
                            }

                            if (pageData.value.cacheAddress.length >= RECEIVER_MAX_COUNT) {
                                callback(new Error(Translate('IDCS_PROMPT_EMAIL_NUM_LIMIT').formatForLang(RECEIVER_MAX_COUNT)))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取收件人列表数据
         */
        const getData = async () => {
            const result = await queryEmailCfg()
            const $ = queryXml(result)

            formData.value.addressMaxByteLen = $('content/receiver/itemType').attr('maxByteLen').num() || nameByteMaxLen

            pageData.value.list = $('content/receiver/item').map((item) => {
                const $item = queryXml(item.element)
                pageData.value.cacheAddress.push($item('address').text())
                return {
                    address: $item('address').text(),
                    schedule: $item('schedule').attr('id'),
                }
            })
        }

        /**
         * @description 增加收件人
         */
        const addReceiver = () => {
            pageData.value.isReceiver = true
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading()

                pageData.value.isReceiver = false

                const result = await queryScheduleList()
                commLoadResponseHandler(result, async ($) => {
                    let schedule = ''
                    const find = $('content/item').find((item) => item.text() === '24x7')
                    if (find) {
                        schedule = find.attr('id')
                    }

                    pageData.value.list.push({
                        address: formData.value.address,
                        schedule,
                    })
                    pageData.value.cacheAddress.push(formData.value.address)

                    const sendXml = rawXml`
                        <content>
                            <receiver type="list">
                                ${pageData.value.list
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <address>${item.address}</address>
                                                <schedule id="${item.schedule}"></schedule>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </receiver>
                        </content>
                    `
                    const $$ = await editEmailCfg(sendXml)
                    commSaveResponseHandler($$)

                    closeLoading()
                })
            })
        }

        /**
         * @description 打开弹窗时刷新表单数据
         */
        const open = async () => {
            if (!pageData.value.list.length) {
                await getData()
            }

            if (pageData.value.list.length) {
                formData.value.address = pageData.value.list[0].address
            }
        }

        /**
         * @description 确认测试
         */
        const confirm = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }

                openLoading(LoadingTarget.FullScreen, Translate('IDCS_TEST_HOLD_ON'))

                const password = AES_encrypt(formData.value.password, userSession.sesionKey)
                const sendXml = rawXml`
                    <content>
                        <receiver>
                            <item>
                                <address>${formData.value.address}</address>
                            </item>
                        </receiver>
                        <sender>
                            <address>${wrapCDATA(prop.form.address)}</address>
                            <name>${wrapCDATA(prop.form.name)}</name>
                            <userName>${wrapCDATA(prop.form.userName)}</userName>
                            <password ${getSecurityVer()}>${password}</password>
                            <anonymousSwitch>${prop.form.anonymousSwitch}</anonymousSwitch>
                            <attachImg>${prop.form.attachImg}</attachImg>
                            <imageNumber>${prop.form.imageNumber}</imageNumber>
                            <smtp>
                                <server>${wrapCDATA(prop.form.server)}</server>
                                <port>${prop.form.port}</port>
                                <ssl>${prop.form.ssl}</ssl>
                            </smtp>
                        </sender>
                    </content>
                `
                const result = await testEmailCfg(sendXml)
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    openMessageBox({
                        type: 'success',
                        message: Translate('IDCS_TEST_SUCCESS'),
                    }).finally(() => {
                        close()
                    })
                } else {
                    openMessageBox(Translate('IDCS_TEST_FAIL'))
                }

                closeLoading()
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            addReceiver,
            pageData,
            formRef,
            formData,
            formRule,
            open,
            close,
            confirm,
        }
    },
})
