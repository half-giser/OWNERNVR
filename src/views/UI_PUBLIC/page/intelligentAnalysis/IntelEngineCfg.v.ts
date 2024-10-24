/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:41:34
 * @Description: 智能分析-引擎配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-23 14:40:17
 */
import { EngineConfigForm, type EngineConfigList } from '@/types/apiType/intelligentAnalysis'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        // 事件与文本的映射
        const EVENT_TYPE_MAPPING: Record<string, string> = {
            faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
            faceMatch: Translate('IDCS_FACE_RECOGNITION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            perimeter: Translate('IDCS_INVADE_DETECTION'),
        }

        const pageData = ref({
            // 是否查询明细
            isDetail: false,
            // 是否可选
            disabled: false,
            // 用来区分3535A和3536A机型. 3536A：AI模式，协议不会返回openSubOutput节点
            is3536Amode: false,
            // 鉴权弹窗
            isCheckAuthPop: false,
        })

        const formData = ref(new EngineConfigForm())
        // 用来记录勾选框的值是否被更改，更改了才需要下发协议
        const cloneFormData = new EngineConfigForm()

        const tableData = ref<EngineConfigList[]>([])

        /**
         * @description 获取工作模式
         */
        const getSystemWorkMode = async () => {
            const result = await querySystemWorkMode()
            const $ = queryXml(result)

            formData.value.supportAI = $('//content/supportAI').text().toBoolean()
            cloneFormData.supportAI = formData.value.supportAI
            pageData.value.is3536Amode = !$('//content/openSubOutput').length
            const openSubOutput = $('//content/openSubOutput').text().toBoolean()
            // 3536A机型一直是可勾选的，所以需要排除在外
            pageData.value.disabled = formData.value.supportAI && !openSubOutput && !pageData.value.is3536Amode
            // 3536A机型开启AI，则需要查询明细
            pageData.value.isDetail = pageData.value.disabled || (pageData.value.is3536Amode && formData.value.supportAI)
        }

        /**
         * @description 获取详情
         */
        const getAIResourceDetail = async () => {
            const result = await queryAIResourceDetail('')
            const $ = queryXml(result)
            tableData.value = []
            $('//content/chl/item').map((item) => {
                const $item = queryXml(item.element)
                const name = $item('name').text()
                $item('resource/item').forEach((res) => {
                    const eventType = res.attr('eventType')!.split(',')
                    tableData.value.push({
                        name,
                        eventType: eventType.map((event) => EVENT_TYPE_MAPPING[event]).join('+'),
                    })
                })
            })
        }

        /**
         * @description 修改数据，打开鉴权弹窗
         */
        const setData = () => {
            if (formData.value.supportAI === cloneFormData.supportAI) {
                return
            }

            if (pageData.value.disabled) {
                return
            }

            let message = Translate('IDCS_OPEN_AI_TIP')
            if (pageData.value.is3536Amode) {
                // TODO: IDCS_OPEN_AI_REBOOT_TIP 和 IDCS_CLOSE_AI_REBOOT_TIP 的文本不存在
                message = formData.value.supportAI ? Translate('IDCS_OPEN_AI_REBOOT_TIP') : Translate('IDCS_CLOSE_AI_REBOOT_TIP')
            }

            openMessageTipBox({
                type: 'question',
                message,
            }).then(() => {
                pageData.value.isCheckAuthPop = true
            })
        }

        /**
         * @description 鉴权确认后，更新数据
         * @param {UserCheckAuthForm} e
         */
        const confirmSetData = async (e: UserCheckAuthForm) => {
            openLoading()
            const sendXml = rawXml`
                <content>
                    <supportAI>${formData.value.supportAI.toString()}</supportAI>
                    ${ternary(!pageData.value.is3536Amode, `<openSubOutput>false</openSubOutput>`)}
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editSystemWorkMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                        errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_USER_NOTEXIST')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                        break
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        onMounted(async () => {
            await getSystemWorkMode()
            if (pageData.value.isDetail) {
                getAIResourceDetail()
            }
        })

        return {
            pageData,
            formData,
            setData,
            confirmSetData,
            BaseCheckAuthPop,
        }
    },
})
