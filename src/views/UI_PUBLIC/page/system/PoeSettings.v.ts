/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 17:29:31
 * @Description: POE电源管理
 */
import type { SystemPoeList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()

        const indexMapping: Record<string, number> = {}

        const pageData = ref({
            // 开关选项
            switchOptions: getSwitchOptions(),
            // 总功率
            totalPower: '0.00',
            // 剩余功率
            remainPower: '0.00',
        })

        const timer = useRefreshTimer(() => {
            getData()
        })

        const tableData = ref<SystemPoeList[]>([])

        /**
         * @description 启用/关闭所有电源
         * @param {string} value
         */
        const changeAllSwitch = (value: string) => {
            tableData.value.forEach((item) => {
                item.switch = value
            })
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryPoePower()
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.totalPower = $('//content/totalPower').text() || '0.00'
                pageData.value.remainPower = $('//content/remainPower').text() || '0.00'
                if (!tableData.value.length) {
                    tableData.value = $('//content/poePort/item').map((item, index) => {
                        const $item = queryXml(item.element)
                        const id = item.attr('index')!
                        const poeName = index < 10 ? '0' + index : '' + index
                        indexMapping[id] = index
                        return {
                            id,
                            poeName: 'Poe[' + poeName + ']',
                            switch: $item('switch').text(),
                            power: $item('power').text() + 'W',
                        }
                    })
                } else {
                    $('//content/poePort/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const index = indexMapping[item.attr('index')!]
                        tableData.value[index].power = $item('power').text() + 'W'
                    })
                }
            }

            timer.repeat()
        }

        /**
         * @description 更新数据
         */
        const setData = async () => {
            const sendXml = rawXml`
                <content>
                    <poePort type="list">
                        ${tableData.value.map((item) => `<item index="${item.id}"><switch>${item.switch}</switch></item>`).join('')}
                    </poePort>
                </content>
            `
            const result = await editPoePower(sendXml)
            commSaveResponseHadler(result)
        }

        onMounted(async () => {
            openLoading()
            getData()
            closeLoading()
        })

        return {
            pageData,
            setData,
            tableData,
            changeAllSwitch,
        }
    },
})
