/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 17:29:31
 * @Description: POE电源管理
 */
import { type TableInstance } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const indexMapping: Record<string, number> = {}

        const pageData = ref({
            // 开关选项
            switchOptions: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 总功率
            totalPower: '0.00',
            // 剩余功率
            remainPower: '0.00',
            tabOptions: [
                {
                    value: 'poePower',
                    label: Translate('IDCS_SYSTEM_POE_SETUP'),
                    disabled: !systemCaps.supportPoePowerManage,
                },
                {
                    value: 'poeExtensionSetup',
                    label: Translate('IDCS_SYSTEM_POE_EXTENSION_SETUP'),
                },
            ],
            tab: systemCaps.supportPoePowerManage ? 'poePower' : 'poeExtensionSetup',
        })

        const timer = useRefreshTimer(() => {
            getData()
        })

        const tableData = ref<SystemPoeList[]>([])

        const poeTableData = ref<SystemPoeExtensionList[]>([])
        const poeTableRef = ref<TableInstance>()

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
            if ($('status').text() === 'success') {
                pageData.value.totalPower = $('content/totalPower').text() || '0.00'
                pageData.value.remainPower = $('content/remainPower').text() || '0.00'
                if (!tableData.value.length) {
                    tableData.value = $('content/poePort/item').map((item, index) => {
                        const $item = queryXml(item.element)
                        const id = item.attr('index')
                        const poeName = padStart(index, 2)
                        indexMapping[id] = index
                        return {
                            id,
                            poeName: 'Poe[' + poeName + ']',
                            switch: $item('switch').text(),
                            power: $item('power').text() + 'W',
                        }
                    })
                } else {
                    $('content/poePort/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const index = indexMapping[item.attr('index')]
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
            commSaveResponseHandler(result)
        }

        const getPoeData = async () => {
            const result = await queryPoEPortExtendInfo()
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                poeTableData.value = $('content/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        poeName: `PoE[${padStart(index + 1, 2)}]`,
                        switch: $item('plugAndPlay').text().bool(),
                    }
                })

                nextTick(() => {
                    poeTableData.value.forEach((item) => {
                        poeTableRef.value!.toggleRowSelection(item, item.switch)
                    })
                })
            }
        }

        const setPoeData = async () => {
            openLoading()

            const selectedRows = (poeTableRef.value?.getSelectionRows() as SystemPoeExtensionList[]).map((item) => item.id)
            const sendXml = rawXml`
                <content type="list" total="${poeTableData.value.length}">
                    ${poeTableData.value
                        .map((item) => {
                            return rawXml`
                            <item id="${item.id}">
                                <plugAndPlay>${selectedRows.includes(item.id)}</plugAndPlay>
                            </item>
                        `
                        })
                        .join('')}
                </content>
            `
            const result = await editPoEPortExtendInfo(sendXml)

            closeLoading()

            commSaveResponseHandler(result)
        }

        const changeTab = () => {
            timer.stop()

            if (pageData.value.tab === 'poePower') {
                getData()
            } else {
                getPoeData()
            }
        }

        onMounted(async () => {
            openLoading()
            changeTab()
            closeLoading()
        })

        return {
            pageData,
            setData,
            setPoeData,
            tableData,
            changeAllSwitch,
            poeTableData,
            poeTableRef,
            changeTab,
        }
    },
})
