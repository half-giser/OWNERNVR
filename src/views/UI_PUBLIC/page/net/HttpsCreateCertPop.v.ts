/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-15 17:12:18
 * @Description: 创建私有证书弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 16:15:55
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { NetHTTPSPrivateCertForm } from '@/types/apiType/net'

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
        const { openLoading, closeLoading } = useLoading()
        const userSession = useUserSessionStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new NetHTTPSPrivateCertForm())
        const formRule = ref<FormRules>({
            countryName: [
                {
                    validator(rule, value: string, callback) {
                        if (!value.length) {
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
                    validator(rule, value: string, callback) {
                        if (!value.length) {
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
                    validator(rule, value: string, callback) {
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
                    validator(rule, value: string, callback) {
                        if (value.length && !checkEmail(value)) {
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
                    <validityPeriod unit="d">${formData.value.validityPeriod?.toString() || ''}</validityPeriod>
                    <password ${getSecurityVer()}>${AES_encrypt(formData.value.password, userSession.sesionKey)}</password>
                </content>
            `
            const result = await createCert(sendXml)
            commSaveResponseHadler(result, () => {
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
            commSaveResponseHadler(result, () => {
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

        /**
         * @description 打开弹窗时，重置表单
         */
        const open = () => {
            formRef.value?.clearValidate()
            formRef.value?.resetFields()
        }

        return {
            formRef,
            formRule,
            formData,
            close,
            verify,
            open,
        }
    },
})
