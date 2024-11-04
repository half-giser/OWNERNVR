/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 09:03:07
 * @Description: 录像机OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-01 09:23:37
 */
import { SystemRecorderOSDSettingsForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            options: getSwitchOptions(),
            isAddress: import.meta.env.VITE_UI_TYPE === 'UI1-E',
        })

        const formData = ref(new SystemRecorderOSDSettingsForm())

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryDevOsdDisplayCfg()
            const $ = queryXml(result)

            formData.value.nameEnable = $('//content/nameSwitch').text()
            formData.value.iconEnable = $('//content/iconSwitch').text()
            formData.value.addressEnable = $('//content/addressSwitch').text()

            closeLoading()
        }

        /**
         * @description 提交表单
         */
        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <nameSwitch type="modeType">${formData.value.nameEnable}</nameSwitch>
                    <iconSwitch type="modeType">${formData.value.iconEnable}</iconSwitch>
                    <addressSwitch type="modeType">${formData.value.addressEnable}</addressSwitch>
                </content>
            `
            const result = await editDevOsdDisplayCfg(sendXml)

            commSaveResponseHadler(result)
            closeLoading()
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
