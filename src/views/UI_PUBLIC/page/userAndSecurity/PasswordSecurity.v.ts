/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:40:47
 * @Description: 密码安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:33:27
 */
import { UserPasswordSecurityForm } from '@/types/apiType/userAndSecurity'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { closeLoading, openLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const formData = ref(new UserPasswordSecurityForm())

        // 密码强度与显示文本的映射
        const PASSWORD_STRENGTH_MAPPING: Record<string, string> = {
            weak: Translate('IDCS_PASSWORD_WEAK'),
            medium: Translate('IDCS_PASSWORD_MEDIUM'),
            strong: Translate('IDCS_PASSWORD_STRONG'),
            stronger: Translate('IDCS_PASSWORD_STRONGER'),
        }

        // 过期时间与显示文本的映射
        const EXPIRATION_TIME_MAPPING: Record<string, string> = {
            0: Translate('IDCS_EXPIRE_OFF'),
            30: 30 + Translate('IDCS_DAYS'),
            90: 90 + Translate('IDCS_DAYS'),
            180: 180 + Translate('IDCS_DAYS'),
        }

        const pageData = ref({
            // 密码强度选项
            passwordStrengthOptions: [] as SelectOption<string, string>[],
            // 过期时间选项
            expirationTimeOptions: [] as SelectOption<string, string>[],
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryPasswordSecurity()

            const $ = queryXml(result)
            closeLoading()

            if ($('//status').text() === 'success') {
                formData.value.passwordStrength = $('//content/pwdSecureSetting/pwdSecLevel').text()
                formData.value.expirationTime = $('//content/pwdSecureSetting/expiration').text()

                pageData.value.passwordStrengthOptions = $('//types/userPasswordAllowLevel/enum').map((item) => {
                    const text = item.text()
                    return {
                        value: text,
                        label: PASSWORD_STRENGTH_MAPPING[text],
                    }
                })

                pageData.value.expirationTimeOptions = $('//types/userPasswordExpirationTime/enum').map((item) => {
                    const text = item.text()
                    return {
                        value: text,
                        label: EXPIRATION_TIME_MAPPING[text],
                    }
                })
            }
        }

        /**
         * @description 保存数据
         */
        const updateData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <pwdSecureSetting>
                        <pwdSecLevel>${formData.value.passwordStrength}</pwdSecLevel>
                        <expiration>${formData.value.expirationTime}</expiration>
                    </pwdSecureSetting>
                </content>
            `
            const result = await editPasswordSecurity(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            formData,
            pageData,
            updateData,
        }
    },
})
