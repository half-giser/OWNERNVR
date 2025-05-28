/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 09:41:34
 * @Description: 智能分析-引擎配置
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const AI_RES_TYPE_MAPPING: Record<string, string> = {
            face: Translate('IDCS_FACE_RECOGNITION'),
            boundary: Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY'),
            reid: Translate('IDCS_PICTURE_COMPARSION'),
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

        const formData = ref(new IntelEngineConfigForm())
        const watchEditData = useWatchEditData(formData)

        const tableData = ref<IntelEngineConfigList[]>([])

        /**
         * @description 获取工作模式
         */
        const getSystemWorkMode = async () => {
            watchEditData.reset()

            const result = await querySystemWorkMode()
            const $ = queryXml(result)

            formData.value.supportAI = $('content/supportAI').text().bool()

            pageData.value.is3536Amode = !$('content/openSubOutput').length
            const openSubOutput = $('content/openSubOutput').text().bool()
            // 3536A机型一直是可勾选的，所以需要排除在外
            pageData.value.disabled = formData.value.supportAI && !openSubOutput && !pageData.value.is3536Amode
            // 3536A机型开启AI，则需要查询明细
            pageData.value.isDetail = pageData.value.disabled || (pageData.value.is3536Amode && formData.value.supportAI)

            watchEditData.listen()
        }

        /**
         * @description 获取详情
         */
        const getAIResourceDetail = async () => {
            const result = await queryAIResourceDetail('')
            const $ = queryXml(result)
            tableData.value = []
            $('content/aiResInfo/item').map((item) => {
                const $item = queryXml(item.element)
                $item('detailInfos/item').forEach((res) => {
                    const $res = queryXml(res.element)
                    const name = $res('name').text()
                    const eventType = res.attr('eventType').array()
                    tableData.value.push({
                        name,
                        eventType: eventType.map((event) => AI_RES_TYPE_MAPPING[event]).join('+'),
                    })
                })
            })
        }

        /**
         * @description 修改数据，打开鉴权弹窗
         */
        const setData = () => {
            if (watchEditData.disabled.value) {
                return
            }

            // 非AI模式 未开启AI，则不下发协议
            if (pageData.value.disabled) {
                return
            }

            // 开启AI时，重启的提示语
            let message = Translate('IDCS_OPEN_AI_TIP')
            // AI模式，开启和关闭AI时提示语不同
            if (pageData.value.is3536Amode) {
                message = formData.value.supportAI ? Translate('IDCS_OPEN_AI_REBOOT_TIP') : Translate('IDCS_CLOSE_AI_REBOOT_TIP')
            }

            openMessageBox({
                type: 'question',
                message,
            })
                .then(() => {
                    pageData.value.isCheckAuthPop = true
                })
                .catch(() => {
                    formData.value.supportAI = !formData.value.supportAI
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
                    <supportAI>${formData.value.supportAI}</supportAI>
                    ${!pageData.value.is3536Amode ? '<openSubOutput>false</openSubOutput>' : ''}
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await editSystemWorkMode(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuthPop = false
                watchEditData.update()
            } else {
                const errorCode = $('errorCode').text().num()
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
                openMessageBox(errorInfo)
            }
        }

        onActivated(async () => {
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
            tableData,
        }
    },
})
