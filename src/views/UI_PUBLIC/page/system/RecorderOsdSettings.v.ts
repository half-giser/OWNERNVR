/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 09:03:07
 * @Description: 录像机OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-27 17:55:08
 */
import { SystemRecorderOSDSettingsForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const pageData = ref({
            options: DEFAULT_SWITCH_OPTIONS,
            isAddress: getUiAndTheme().name === 'UI1-E',
        })

        const formData = ref(new SystemRecorderOSDSettingsForm())

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryDevOsdDisplayCfg()
            const $ = queryXml(result)

            formData.value.nameEnable = $('/response/content/nameSwitch').text()
            formData.value.iconEnable = $('/response/content/iconSwitch').text()
            formData.value.addressEnable = $('/response/content/addressSwitch').text()

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 提交表单
         */
        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <nameSwitch type="modeType">${formData.value.nameEnable}</nameSwitch>
                    <iconSwitch type="modeType">${formData.value.iconEnable}</iconSwitch>
                    <addressSwitch type="modeType">${formData.value.addressEnable}</addressSwitch>
                </content>
            `
            const result = await editDevOsdDisplayCfg(sendXml)

            commSaveResponseHadler(result)
            closeLoading(LoadingTarget.FullScreen)
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            formData,
            setData,
        }
    },
})
