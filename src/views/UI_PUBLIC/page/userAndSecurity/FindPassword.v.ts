/*
 * @Date: 2025-05-04 14:51:01
 * @Description: 找回密码设置
 * @Author: yejiahao yejiahao@tvt.net.cn
 */

import { type UserCheckAuthForm } from '@/types/apiType/user'
import { UserFindPwdEmailForm, UserFindPwdQuestionForm } from '@/types/apiType/userAndSecurity'
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const pageData = ref({
            tabOptions: [
                {
                    label: Translate('IDCS_EMAIL'),
                    value: 'email',
                },
                {
                    label: Translate('IDCS_PASSWORD_PROTECT_QUESTION'),
                    value: 'question',
                },
            ],
            tab: 'email',
            // 问题选项（UI2-A）
            questionOptions: [] as UserFindPwdQuestionForm[],
            // 最大问题数量
            questionMaxCount: 7,
            pubkey: '',
            isCheckAuthPop: false,
        })

        const emailFormData = ref(new UserFindPwdEmailForm())

        const emailFormRules = ref<FormRules>({
            email: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (emailFormData.value.switch) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_EMAIL_ADDRESS_EMPTY')))
                                return
                            }

                            if (!checkEmail(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                                return
                            }
                        } else {
                            if (value.trim() && !checkEmail(value)) {
                                callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const emailFormRef = useFormRef()

        const qaFormData = ref(new UserFindPwdQuestionForm())

        const tableData = ref<UserFindPwdQuestionForm[]>([])
        const watchEdit = useWatchEditData(tableData)

        const getSecureEmail = async () => {
            const result = await querySecureEmailcfg()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                emailFormData.value.switch = $('content/switch').text().bool()
                emailFormData.value.email = $('content/email').text()
            }
        }

        const setSecureEmail = () => {
            emailFormRef.value?.validate((valid) => {
                if (valid) {
                    pageData.value.isCheckAuthPop = true
                }
            })
        }

        const confirmSetSecureEmail = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <switch>${emailFormData.value.switch}</switch>
                    <email>${wrapCDATA(emailFormData.value.email)}</email>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editSecureEMailCfg(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => getSecureEmail())
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')

                switch (errorCode) {
                    // 密码错误
                    case ErrorCode.USER_ERROR_NO_USER:
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    // 鉴权账号无相关权限
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        break
                }

                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 更改问题
         */
        const changeQuestion = () => {
            if (isDefeultQuestion.value) {
                qaFormData.value.answer = ''
            }
        }

        /**
         * @description 添加问题答案
         */
        const addQuestion = () => {
            if (isDefeultQuestion.value) {
                if (!qaFormData.value.answer.trim()) {
                    openMessageBox(Translate('IDCS_PROMPT_ANSWER_EMPTY'))
                    return
                }
                const index = tableData.value.findIndex((item) => item.id === qaFormData.value.id)
                if (index > -1) {
                    tableData.value[index].answer = qaFormData.value.answer
                }
            } else {
                if (!qaFormData.value.question.trim()) {
                    openMessageBox(Translate('IDCS_PROMPT_QUESTION_EMPTY'))
                    return
                }

                if (!qaFormData.value.answer.trim()) {
                    openMessageBox(Translate('IDCS_PROMPT_ANSWER_EMPTY'))
                    return
                }

                if (tableData.value.length >= pageData.value.questionMaxCount) {
                    openMessageBox(Translate('IDCS_PROMPT_MAX_QUESTION'))
                    return
                }

                const sameQuestion = tableData.value.some((item) => item.question === qaFormData.value.question.trim())
                if (sameQuestion) {
                    openMessageBox(Translate('IDCS_PROMPT_QUESTION_IS_EXIST'))
                    return
                }

                tableData.value.push({
                    id: '0',
                    question: qaFormData.value.question.trim(),
                    answer: qaFormData.value.answer.trim(),
                })
                qaFormData.value.question = ''
                qaFormData.value.answer = ''
            }
        }

        // IL03开机向导的密保存在默认的问题，其他UI无此要求
        const isDefeultQuestion = computed(() => {
            return import.meta.env.VITE_UI_TYPE === 'UI2-A'
        })

        const getSecureQuestion = async () => {
            watchEdit.reset()

            const result = await queryPWDProtectQuestion()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.pubkey = $('content/key').text()
                tableData.value = $('content/questions/question').map((item) => {
                    return {
                        id: item.attr('index')!,
                        question: item.text(),
                        answer: '',
                    }
                })
                if (isDefeultQuestion.value) {
                    pageData.value.questionOptions = cloneDeep(tableData.value)
                }
            }

            watchEdit.listen()
        }

        const setSecureQuestion = () => {
            pageData.value.isCheckAuthPop = true
        }

        const confirmSetSecureQuestion = async (e: UserCheckAuthForm) => {
            openLoading()

            const usedId = tableData.value.filter((item) => item.id !== '0').map((item) => item.id)
            const legalId = Array(pageData.value.questionMaxCount)
                .fill('')
                .map((_, key) => key + 1 + '')
                .filter((item) => !usedId.includes(item))

            const sendXml = rawXml`
                <content>
                    <questions>
                        ${tableData.value
                            .map((item) => {
                                return rawXml`
                                    <item id="${item.id === '0' ? legalId.pop()! : item.id}">
                                        <question>${wrapCDATA(item.question)}</question>
                                        <answer>${wrapCDATA(item.answer ? RSA_encrypt(pageData.value.pubkey, item.answer) + '' : '')}</answer>
                                    </item>
                                `
                            })
                            .join('')}
                    </questions>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editPWDProtectQuestion(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).then(() => getSecureQuestion())
            } else {
                const errorCode = $('errorCode').text().num()
                let errorInfo = Translate('IDCS_SAVE_DATA_FAIL')

                switch (errorCode) {
                    // 密码错误
                    case ErrorCode.USER_ERROR_NO_USER:
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    // 鉴权账号无相关权限
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        break
                }

                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 删除问题与答案
         * @param {number} index
         */
        const deleteQuestion = (index: number) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(() => {
                if (isDefeultQuestion.value) {
                    tableData.value[index].answer = ''
                } else {
                    tableData.value.splice(index, 1)
                }
            })
        }

        const confirmCheckAuth = (e: UserCheckAuthForm) => {
            if (pageData.value.tab === 'email') {
                confirmSetSecureEmail(e)
            } else {
                confirmSetSecureQuestion(e)
            }
        }

        onMounted(async () => {
            openLoading()
            await getSecureEmail()
            await getSecureQuestion()
            closeLoading()
        })

        return {
            pageData,
            setSecureEmail,
            setSecureQuestion,
            isDefeultQuestion,
            deleteQuestion,
            addQuestion,
            emailFormData,
            emailFormRules,
            emailFormRef,
            qaFormData,
            changeQuestion,
            tableData,
            watchEdit,
            confirmCheckAuth,
        }
    },
})
