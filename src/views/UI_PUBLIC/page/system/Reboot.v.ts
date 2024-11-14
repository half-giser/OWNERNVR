/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:54
 * @Description: 系统重启
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageBox } = useMessageBox()

        let timer: NodeJS.Timeout | number = 0

        const pageData = ref({
            // 显示隐藏权限弹窗
            isAuthPop: false,
        })

        /**
         * @description 打开鉴权弹窗
         */
        const verify = () => {
            pageData.value.isAuthPop = true
        }

        /**
         * @description 权限验证通过后，恢复出厂设置
         * @param {UserCheckAuthForm} e
         */
        const confirm = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await reboot(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                pageData.value.isAuthPop = false
                openLoading(LoadingTarget.FullScreen, Translate('IDCS_REBOOTING'))
                timer = reconnect()
            } else {
                closeLoading()

                const errorCode = $('//errorCode').text().num()
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
                openMessageBox({
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
