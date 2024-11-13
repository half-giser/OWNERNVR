/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 10:57:06
 * @Description: 设备基本信息
 */
import QRCode from 'qrcode'
import { type QRCodeToDataURLOptions } from 'qrcode'
import { SystemBaseInfoForm } from '@/types/apiType/system'
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
            const $ = queryXml(result)
            formData.value.name = $('//content/name').text()
            formData.value.deviceNumber = $('//content/deviceNumber').text()
            formData.value.productModel = $('//content/productModel').text()
            formData.value.videoType = $('//content/videoType').text()
            formData.value.hardwareVersion = $('//content/hardwareVersion').text()
            formData.value.mcuVersion = $('//content/mcuVersion').text()
            formData.value.kenerlVersion = $('//content/kenerlVersion').text()
            formData.value.softwareVersion = $('//content/softwareVersion').text()
            formData.value.sn = $('//content/sn').text()
            formData.value.AndroidAppAddress = $('//content/AndroidAppAddress').text()
            formData.value.IOSAppAddress = $('//content/IOSAppAddress').text()
            formData.value.qrCodeContent = $('//content/qrCodeContent').text()
            formData.value.qrCodeContentIsEnabled = ($('//content/qrCodeContent').attr('isEnable') as string).toBoolean()
            formData.value.showApp = $('//content/showApp').text().toBoolean()
            formData.value.showGDPR = $('//content/showGDPR').text().toBoolean()
            formData.value.PCBAV = $('//content/PCBAV').text()
            formData.value.PN = $('//content/PN').text()
            formData.value.PCUI = $('//content/PCUI').text()
            formData.value.launchDate = $('//content/launchDate').text()
            formData.value.apiVersion = $('//content/apiVersion').text()
            formData.value.onvifVersion = $('//content/onvifVersion').text()
            formData.value.onvifDevVersion = $('//content/onvifDevVersion').text()
            formData.value.ocxVersion = $('//content/ocxVersion').text()
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
            LoginPrivacyPop,
        }
    },
})
