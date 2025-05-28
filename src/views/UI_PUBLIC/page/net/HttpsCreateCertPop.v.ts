/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 17:12:18
 * @Description: 创建私有证书弹窗
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @description 0: 创建私有证书  2：创建证书请求
         */
        type: {
            type: Number,
            required: true,
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const formRef = useFormRef()
        const formData = ref(new NetHTTPSPrivateCertForm())
        const formRule = ref<FormRules>({
            countryName: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_HTTPS_EMPTY_TIP')))
                            return
                        }

                        if (!/^([A-Z]){2}$/.test(value)) {
                            callback(new Error(Translate('IDCS_HTTPS_COUNTRY_TIP')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            commonName: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_HTTPS_EMPTY_TIP')))
                            return
                        }

                        if (value.length > 64) {
                            callback(new Error(Translate('IDCS_MAX_CHARACTER')))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            validityPeriod: [
                {
                    validator(_rule, value: number, callback) {
                        if (prop.type !== 2 && !value) {
                            callback(new Error(Translate('IDCS_HTTPS_EMPTY_TIP')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            email: [
                {
                    validator(_rule, value: string, callback) {
                        if (value.trim() && !checkEmail(value)) {
                            callback(new Error(Translate('IDCS_PROMPT_INVALID_EMAIL')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 设置私有证书
         */
        const setPrivateCertificate = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <DN>
                        <countryName>${formData.value.countryName}</countryName>
                        <commonName>${formData.value.commonName}</commonName>
                        <stateOrProvinceName>${formData.value.stateOrProvinceName}</stateOrProvinceName>
                        <localityName>${formData.value.localityName}</localityName>
                        <organizationName>${formData.value.organizationName}</organizationName>
                        <organizationalUnitName>${formData.value.organizationalUnitName}</organizationalUnitName>
                        <email>${formData.value.email}</email>
                    </DN>
                    <validityPeriod unit="d">${formData.value.validityPeriod || ''}</validityPeriod>
                    <password ${getSecurityVer()}>${AES_encrypt(formData.value.password, userSession.sesionKey)}</password>
                </content>
            `
            const result = await createCert(sendXml)
            commSaveResponseHandler(result, () => {
                ctx.emit('confirm')
            })
            closeLoading()
        }

        /**
         * @description 设置请求证书
         */
        const setCertificateRequest = async () => {
            const sendXml = rawXml`
                <content>
                    <DN>
                        <countryName>${formData.value.countryName}</countryName>
                        <commonName>${formData.value.commonName}</commonName>
                        <stateOrProvinceName>${formData.value.stateOrProvinceName}</stateOrProvinceName>
                        <localityName>${formData.value.localityName}</localityName>
                        <organizationName>${formData.value.organizationName}</organizationName>
                        <organizationalUnitName>${formData.value.organizationalUnitName}</organizationalUnitName>
                        <email>${formData.value.email}</email>
                    </DN>
                    <password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>
                </content>
            `
            const result = await createCertReq(sendXml)
            commSaveResponseHandler(result, () => {
                ctx.emit('confirm')
            })
            closeLoading()
        }

        /**
         * @description 验证表单通过后，设置私有证书/请求证书
         */
        const verify = () => {
            formRef.value!.validate((valid: boolean) => {
                if (valid) {
                    if (prop.type === 0) setPrivateCertificate()
                    else setCertificateRequest()
                }
            })
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formRule,
            formData,
            close,
            verify,
        }
    },
})
