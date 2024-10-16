/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 17:29:31
 * @Description: POE电源管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 17:53:00
 */
import type { SystemPoeList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()

        let timer: NodeJS.Timeout | number = 0

        const indexMapping: Record<string, number> = {}

        const pageData = ref({
            // 开关选项
            switchOptions: DEFAULT_SWITCH_OPTIONS.map((item) => {
                return {
                    value: item.value,
                    label: Translate(item.label),
                }
            }),
            // 总功率
            totalPower: '0.00',
            // 剩余功率
            remainPower: '0.00',
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
            clearTimeout(timer)

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

            timer = setTimeout(() => getData(), 5000)
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

        onBeforeUnmount(() => {
            clearTimeout(timer)
        })

        return {
            pageData,
            setData,
            tableData,
            changeAllSwitch,
        }
    },
})
