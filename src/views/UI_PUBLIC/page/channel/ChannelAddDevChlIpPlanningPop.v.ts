/*
 * @Date: 2025-05-12 11:17:55
 * @Description: IP规划弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    emits: {
        close() {
            return true
        },
    },
    setup(_prop, ctx) {
        const formData = ref({
            enable: false,
        })

        const getData = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            formData.value.enable = $('content/channelIpPlanning').text().bool()
        }

        const confirm = async () => {
            const sendXml = rawXml`
                <content>
                    <channelIpPlanning>${formData.value.enable}</channelIpPlanning>
                </content>
            `
            const result = await editBasicCfg(sendXml)
            commSaveResponseHandler(result, () => {
                close()
            })
        }

        const open = () => {
            getData()
        }

        const close = () => {
            ctx.emit('close')
        }

        return {
            formData,
            open,
            confirm,
            close,
        }
    },
})
