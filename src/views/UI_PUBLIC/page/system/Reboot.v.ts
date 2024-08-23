/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:54
 * @Description: 系统重启
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 17:10:45
 */
import BaseCheckAuthPop, { type UserCheckAuthForm } from '../../components/auth/BaseCheckAuthPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageTipBox } = useMessageBox()

        let timer: NodeJS.Timeout | number = 0

        const pageData = ref({
            // 显示隐藏权限弹窗
            isAuthDialog: false,
        })

        /**
         * @description 打开鉴权弹窗
         */
        const verify = () => {
            pageData.value.isAuthDialog = true
        }

        /**
         * @description 权限验证通过后，恢复出厂设置
         * @param {UserCheckAuthForm} e
         */
        const confirm = async (e: UserCheckAuthForm) => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await reboot(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                pageData.value.isAuthDialog = false
                openLoading(LoadingTarget.FullScreen, Translate('IDCS_REBOOTING'))
                timer = reconnect()
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
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

        onBeforeUnmount(() => {
            clearTimeout(timer)
        })

        return {
            verify,
            confirm,
            pageData,
            BaseCheckAuthPop,
        }
    },
})
