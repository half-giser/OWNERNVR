/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 10:57:06
 * @Description: 设备基本信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-21 18:34:33
 */
import QRCode from 'qrcode'
import { type QRCodeToDataURLOptions } from 'qrcode'
import { SystemBaseInfoForm } from '@/types/apiType/system'

export default defineComponent({
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
            const result = await queryBasicCfg(getXmlWrapData(''))
            const $ = queryXml(result)
            formData.value.name = $('/response/content/name').text()
            formData.value.deviceNumber = $('/response/content/deviceNumber').text()
            formData.value.productModel = $('/response/content/productModel').text()
            formData.value.videoType = $('/response/content/videoType').text()
            formData.value.hardwareVersion = $('/response/content/hardwareVersion').text()
            formData.value.mcuVersion = $('/response/content/mcuVersion').text()
            formData.value.kenerlVersion = $('/response/content/kenerlVersion').text()
            formData.value.softwareVersion = $('/response/content/softwareVersion').text()
            formData.value.sn = $('/response/content/sn').text()
            formData.value.AndroidAppAddress = $('/response/content/AndroidAppAddress').text()
            formData.value.IOSAppAddress = $('/response/content/IOSAppAddress').text()
            formData.value.qrCodeContent = $('/response/content/qrCodeContent').text()
            formData.value.qrCodeContentIsEnabled = ($('/response/content/qrCodeContent').attr('isEnable') as string).toBoolean()
            formData.value.showApp = $('/response/content/showApp').text().toBoolean()
            formData.value.showGDPR = $('/response/content/showGDPR').text().toBoolean()
            formData.value.PCBAV = $('/response/content/PCBAV').text()
            formData.value.PN = $('/response/content/PN').text()
            formData.value.PCUI = $('/response/content/PCUI').text()
            formData.value.launchDate = $('/response/content/launchDate').text()
            formData.value.apiVersion = $('/response/content/apiVersion').text()
            formData.value.onvifVersion = $('/response/content/onvifVersion').text()
            formData.value.onvifDevVersion = $('/response/content/onvifDevVersion').text()
            formData.value.ocxVersion = $('/response/content/ocxVersion').text()
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
