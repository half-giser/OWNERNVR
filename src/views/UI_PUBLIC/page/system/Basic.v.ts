/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 10:57:06
 * @Description: 设备基本信息
 */
import QRCode from 'qrcode'
import { type QRCodeToDataURLOptions } from 'qrcode'
import LoginPrivacyPop from '../LoginPrivacyPop.vue'

export default defineComponent({
    components: {
        LoginPrivacyPop,
    },
    setup() {
        const pageData = ref({
            // 是否打开隐私弹窗
            isShowPrivacy: false,
            // 是否打开关于本机弹窗
            isShowAbout: false,
            // 二维码base64字符串
            snCode: '',
            // 安卓二维码base64字符串
            androidCode: '',
            // iOS二维码base64字符串
            iosCode: '',
        })

        const formData = ref(new SystemBaseInfoForm())

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(queryXml(result)('content')[0].element)
            formData.value.name = $('name').text()
            formData.value.deviceNumber = $('deviceNumber').text()
            formData.value.productModel = $('productModel').text()
            formData.value.videoType = $('videoType').text()
            formData.value.hardwareVersion = $('hardwareVersion').text()
            formData.value.mcuVersion = $('mcuVersion').text()
            formData.value.kenerlVersion = $('kenerlVersion').text()
            formData.value.softwareVersion = $('softwareVersion').text()
            formData.value.sn = $('sn').text()
            formData.value.AndroidAppAddress = $('AndroidAppAddress').text()
            formData.value.IOSAppAddress = $('IOSAppAddress').text()
            formData.value.qrCodeContent = $('qrCodeContent').text()
            formData.value.qrCodeContentIsEnabled = $('qrCodeContent').attr('isEnable').bool()
            formData.value.showApp = $('showApp').text().bool()
            formData.value.showGDPR = $('showGDPR').text().bool()
            formData.value.PCBAV = $('PCBAV').text()
            formData.value.PN = $('PN').text()
            formData.value.PCUI = $('PCUI').text()
            formData.value.launchDate = $('launchDate').text()
            formData.value.apiVersion = $('apiVersion').text()
            formData.value.onvifVersion = $('onvifVersion').text()
            formData.value.onvifDevVersion = $('onvifDevVersion').text()
            formData.value.ocxVersion = $('ocxVersion').text()
            showQRCode()
        }

        /**
         * @description 根据字符串生成二维码
         * @param {string} str
         * @returns
         */
        const makeQRCode = (str: string) => {
            const options: QRCodeToDataURLOptions = {
                errorCorrectionLevel: 'M',
                width: 230,
                margin: 0,
            }
            return new Promise((resolve: (url: string) => void) => {
                QRCode.toDataURL(str, options, (err, url) => {
                    if (err) resolve('')
                    else resolve(url)
                })
            })
        }

        /**
         * @description 生成二维码
         */
        const showQRCode = async () => {
            if (formData.value.showApp) {
                pageData.value.androidCode = await makeQRCode(formData.value.AndroidAppAddress)
                pageData.value.iosCode = await makeQRCode(formData.value.IOSAppAddress)
                pageData.value.snCode = await makeQRCode(formData.value.qrCodeContent)
            }
        }

        /**
         * @description 打开隐私政策弹窗
         */
        const showPrivacy = () => {
            pageData.value.isShowPrivacy = true
        }

        /**
         * @description 打开关于本机弹窗
         */
        const showAbout = () => {
            pageData.value.isShowAbout = true
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            formData,
            showPrivacy,
            showAbout,
        }
    },
})
