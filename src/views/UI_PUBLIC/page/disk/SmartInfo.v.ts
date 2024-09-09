/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:45:27
 * @Description: S.M.A.R.T信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 18:31:23
 */
import { type DiskSmartInfoList, type DiskSmartInfoDiskList } from '@/types/apiType/disk'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        // 磁盘类型与文本的映射
        const DISK_TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_DISK'),
            esata: Translate('IDCS_ESATA'),
            sata: Translate('IDCS_DISK'),
            sas: Translate('IDCS_SAS'),
        }

        // SMART状态与文本的映射
        const SMART_STATUS_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_NORMAL'),
            warn: Translate('IDCS_WARNING_MSG'),
        }

        // 磁盘健康状态与文本的映射
        const DISK_STATUS_MAPPING: Record<string, string> = {
            good: Translate('IDCS_SMART_DISK_GOOD'),
            lowHealth: Translate('IDCS_SMART_DISK_LOWHEALTH'),
            bad: Translate('IDCS_SMART_DISK_BAD'),
        }

        // 磁盘属性与文本的映射
        const ATTRIBUTE_MAPPING: Record<string, string> = {
            '0x01': Translate('IDCS_SMART_ATTR_0x01'),
            '0x02': Translate('IDCS_SMART_ATTR_0x02'),
            '0x03': Translate('IDCS_SMART_ATTR_0x03'),
            '0x04': Translate('IDCS_SMART_ATTR_0x04'),
            '0x05': Translate('IDCS_SMART_ATTR_0x05'),
            '0x06': Translate('IDCS_SMART_ATTR_0x06'),
            '0x07': Translate('IDCS_SMART_ATTR_0x07'),
            '0x08': Translate('IDCS_SMART_ATTR_0x08'),
            '0x09': Translate('IDCS_SMART_ATTR_0x09'),
            '0x16': Translate('IDCS_SMART_ATTR_0x16'),
            '0x0a': Translate('IDCS_SMART_ATTR_0x0a'),
            '0x0b': Translate('IDCS_SMART_ATTR_0x0b'),
            '0x0c': Translate('IDCS_SMART_ATTR_0x0c'),
            '0x0d': Translate('IDCS_SMART_ATTR_0x0d'),
            '0xb7': Translate('IDCS_SMART_ATTR_0xb7'),
            '0xb8': Translate('IDCS_SMART_ATTR_0xb8'),
            '0xb9': Translate('IDCS_SMART_ATTR_0xb9'),
            '0xba': Translate('IDCS_SMART_ATTR_0xba'),
            '0xbb': Translate('IDCS_SMART_ATTR_0xbb'),
            '0xbc': Translate('IDCS_SMART_ATTR_0xbc'),
            '0xbd': Translate('IDCS_SMART_ATTR_0xbd'),
            '0xbe': Translate('IDCS_SMART_ATTR_0xbe'),
            '0xbf': Translate('IDCS_SMART_ATTR_0xbf'),
            '0xc0': Translate('IDCS_SMART_ATTR_0xc0'),
            '0xc1': Translate('IDCS_SMART_ATTR_0xc1'),
            '0xc2': Translate('IDCS_SMART_ATTR_0xc2'),
            '0xc3': Translate('IDCS_SMART_ATTR_0xc3'),
            '0xc4': Translate('IDCS_SMART_ATTR_0xc4'),
            '0xc5': Translate('IDCS_SMART_ATTR_0xc5'),
            '0xc6': Translate('IDCS_SMART_ATTR_0xc6'),
            '0xc7': Translate('IDCS_SMART_ATTR_0xc7'),
            '0xc8': Translate('IDCS_SMART_ATTR_0xc8'),
            '0xc9': Translate('IDCS_SMART_ATTR_0xc9'),
            '0xca': Translate('IDCS_SMART_ATTR_0xca'),
            '0xcb': Translate('IDCS_SMART_ATTR_0xcb'),
            '0xcc': Translate('IDCS_SMART_ATTR_0xcc'),
            '0xcd': Translate('IDCS_SMART_ATTR_0xcd'),
            '0xce': Translate('IDCS_SMART_ATTR_0xce'),
            '0xcf': Translate('IDCS_SMART_ATTR_0xcf'),
            '0xd0': Translate('IDCS_SMART_ATTR_0xd0'),
            '0xd1': Translate('IDCS_SMART_ATTR_0xd1'),
            '0xd3': Translate('IDCS_SMART_ATTR_0xd3'),
            '0xd4': Translate('IDCS_SMART_ATTR_0xd4'),
            '0xdc': Translate('IDCS_SMART_ATTR_0xdc'),
            '0xdd': Translate('IDCS_SMART_ATTR_0xdd'),
            '0xde': Translate('IDCS_SMART_ATTR_0xde'),
            '0xdf': Translate('IDCS_SMART_ATTR_0xdf'),
            '0xe0': Translate('IDCS_SMART_ATTR_0xe0'),
            '0xe1': Translate('IDCS_SMART_ATTR_0xe1'),
            '0xe2': Translate('IDCS_SMART_ATTR_0xe2'),
            '0xe3': Translate('IDCS_SMART_ATTR_0xe3'),
            '0xe4': Translate('IDCS_SMART_ATTR_0xe4'),
            '0xe6': Translate('IDCS_SMART_ATTR_0xe6'),
            '0xe7': Translate('IDCS_SMART_ATTR_0xe7'),
            '0xe8': Translate('IDCS_SMART_ATTR_0xe8'),
            '0xe9': Translate('IDCS_SMART_ATTR_0xe9'),
            '0xf0': Translate('IDCS_SMART_ATTR_0xf0'),
            '0xf1': Translate('IDCS_SMART_ATTR_0xf1'),
            '0xf2': Translate('IDCS_SMART_ATTR_0xf2'),
            '0xfa': Translate('IDCS_SMART_ATTR_0xfa'),
            '0xfe': Translate('IDCS_SMART_ATTR_0xfe'),
        }

        const pageData = ref({
            diskList: [] as DiskSmartInfoDiskList[],
            diskIndex: 0,
            diskPowerOnHours: '',
            // 磁盘温度
            diskTemperature: '',
            // 磁盘状态
            diskStatus: '',
        })
        const tableData = ref<DiskSmartInfoList[]>([])

        // 选中的磁盘序号
        const diskNum = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.diskNum || ''
        })

        // 选中的磁盘Model
        const diskModel = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.model || ''
        })

        // 选中的磁盘ID
        const diskId = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.id || ''
        })

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryStorageDevInfo()
            const $ = queryXml(result)

            pageData.value.diskList = $('//content/diskList/item')
                .filter((item) => {
                    const $item = queryXml(item.element)
                    // 移动U盘不显示
                    if ($item('diskInterfaceType').text() === 'removable') {
                        return false
                    }
                    return true
                })
                .map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        diskNum: DISK_TYPE_MAPPING[$item('diskInterfaceType').text()] + $item('slotIndex').text(),
                        serialNum: $item('serialNum').text(),
                        model: $item('model').text(),
                    }
                })
        }

        /**
         * @description 获取详情数据
         */
        const getDetail = async () => {
            const sendXml = rawXml`
                <condition>
                    <diskId>${diskId.value}</diskId>
                </condition>
            `
            const result = await queryDiskSmartInfo(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                tableData.value = $('//content/smartItems/item').map((item) => {
                    const $item = queryXml(item.element)
                    let id = Number(item.attr('id')).toString(16)
                    id = `${id.length === 1 ? '0x0' : '0x'}${id}`
                    return {
                        id,
                        attribute: ATTRIBUTE_MAPPING[id],
                        value: $item('value').text(),
                        worstValue: $item('worstValue').text(),
                        threshold: $item('threshold').text(),
                        rawValue: $item('rawValue').text(),
                        smartStatus: SMART_STATUS_MAPPING[$item('smartStatus').text()],
                    }
                })

                pageData.value.diskPowerOnHours = $('//content/powerOnDays').text()
                pageData.value.diskTemperature = $('//content/temperature').text()
                pageData.value.diskStatus = DISK_STATUS_MAPPING[$('//content/diskStatus').text()]
            }
        }

        onMounted(async () => {
            openLoading(LoadingTarget.FullScreen)
            await getData()
            await getDetail()
            closeLoading(LoadingTarget.FullScreen)
        })

        return {
            pageData,
            tableData,
            diskNum,
            diskModel,
            getDetail,
        }
    },
})
