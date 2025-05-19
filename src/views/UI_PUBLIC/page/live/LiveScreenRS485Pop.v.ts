/*
 * @Date: 2025-05-19 13:39:24
 * @Description: 现场预览 - RS485
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    setup() {
        const pageData = ref({
            isRS485Pop: false,
            name: '',
            switch: false,
            list: [] as SelectOption<string, string>[],
        })

        const setData = async (id: string) => {
            const sendXml = rawXml`
                <content>
                    <id>${id}</id>
                </content>
            `
            await executeCustomOperate(sendXml)
        }

        const getData = async () => {
            const result = await queryCustomOperateInfo()
            const $ = queryXml(result)

            pageData.value.switch = $('content/switch').text().bool()
            pageData.value.name = $('content/name').text()
            pageData.value.list = $('content/operateInfos/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    label: $item('name').text(),
                    value: item.attr('id'),
                }
            })
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            setData,
        }
    },
})
