/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 15:59:30
 * @Description: 恢复出厂设置
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { SystemFactoryDefaultForm } from '@/types/apiType/system'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const { openMessageBox } = useMessageBox()

        let timer: NodeJS.Timeout | number = 0

        const pageData = ref({
            // 显示隐藏权限弹窗
            isAuthDialog: false,
            // 提示语
            recoverDefaultTip: '',
            // 提示语
            factoryResetTip: '',
        })
        const formData = ref(new SystemFactoryDefaultForm())

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
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <exceptNetworkConfigSwitch>${formData.value.exceptNetworkConfigSwitch}</exceptNetworkConfigSwitch>
                    <exceptEncryptionConfigSwitch>false</exceptEncryptionConfigSwitch>
                </condition>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await restoreDefaults(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                pageData.value.isAuthDialog = false
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

        /**
         * @description 获取提示语
         */
        const getTips = () => {
            if (systemCaps.supportFaceMatch) {
                pageData.value.factoryResetTip = Translate('IDCS_RECOVERY_DEFAULT_SET_NOTE')
                pageData.value.recoverDefaultTip = Translate('IDCS_RECOVERY_DEFAULT_SET_WARNING')
            } else if (systemCaps.supportPlateMatch) {
                pageData.value.factoryResetTip = Translate('IDCS_RECOVERY_DEFAULT_SET_NOTE_WITHOUT_FACE')
                pageData.value.recoverDefaultTip = Translate('IDCS_RECOVERY_DEFAULT_SET_WARNING_WITHOUT_FACE')
            } else {
                pageData.value.factoryResetTip = Translate('IDCS_RECOVERY_DEFAULT_SET_NOTE')
                pageData.value.recoverDefaultTip = Translate('IDCS_RECOVERY_DEFAULT_SET_WARNING')
            }
        }

        onMounted(() => {
            getTips()
        })

        onBeforeUnmount(() => {
            clearTimeout(timer)
        })

        return {
            pageData,
            formData,
            verify,
            confirm,
            BaseCheckAuthPop,
        }
    },
})
