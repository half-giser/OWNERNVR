/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 16:50:11
 * @Description: Email测试发送弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:21:02
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { type NetEmailForm, NetEmailTestForm, type NetEmailReceiverDto } from '@/types/apiType/net'

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
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
        const userSession = useUserSessionStore()

        const pageData = ref({
            isReceiver: false,
            // 收件人列表
            list: [] as NetEmailReceiverDto[],
            // 收件人邮箱地址列表
            cacheAddress: [] as string[],
        })

        const RECEIVER_MAX_COUNT = 16

        const formRef = ref<FormInstance>()
        const formData = ref(new NetEmailTestForm())
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
            pageData.value.list = $('//content/receiver/item').map((item) => {
                const $item = queryXml(item.element)
                pageData.value.cacheAddress.push($item('address').text())
                return {
                    address: $item('address').text(),
                    schedule: $item('schedule').attr('id')!,
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
                    const find = $('//content/item').find((item) => item.text() === '24x7')
                    if (find) {
                        schedule = find.attr('id')!
                    }

                    pageData.value.list.push({
                        address: formData.value.address,
                        schedule,
                    })
                    pageData.value.cacheAddress.push(formData.value.address)

                    const itemXml = pageData.value.list
                        .map((item) => {
                            return rawXml`
                            <item>
                                <address>${item.address}</address>
                                <schedule id="${item.schedule}"></schedule>
                            </item>
                        `
                        })
                        .join('')
                    const sendXml = rawXml`
                        <content>
                            <receiver type="list">${itemXml}</receiver>
                        </content>
                    `
                    const $$ = await editEmailCfg(sendXml)
                    commSaveResponseHadler($$)

                    closeLoading()
                })
            })
        }

        /**
         * @description 打开弹窗时刷新表单数据
         */
        const open = async () => {
            formRef.value?.clearValidate()
            formData.value = new NetEmailTestForm()

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

                openLoading()

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
                            <anonymousSwitch>${prop.form.anonymousSwitch.toString()}</anonymousSwitch>
                            <attachImg>${prop.form.attachImg.toString()}</attachImg>
                            <imageNumber>${prop.form.imageNumber.toString()}</imageNumber>
                            <smtp>
                                <server>${wrapCDATA(prop.form.server)}</server>
                                <port>${String(prop.form.port)}</port>
                                <ssl>${prop.form.ssl}</ssl>
                            </smtp>
                        </sender>
                    </content>
                `
                const result = await testEmailCfg(sendXml)
                const $ = queryXml(result)

                if ($('//status').text() == 'success') {
                    openMessageTipBox({
                        type: 'success',
                        message: Translate('IDCS_TEST_SUCCESS'),
                    }).finally(() => {
                        close()
                    })
                } else {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_TEST_FAIL'),
                    })
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
