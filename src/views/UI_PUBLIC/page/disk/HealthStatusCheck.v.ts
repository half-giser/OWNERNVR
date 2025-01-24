/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:47:11
 * @Description: 健康状态检测
 */
import { type DiskHealthInfoDiskList, type DiskHealthInfoDiskDetailList } from '@/types/apiType/disk'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        // 磁盘健康状态与显示文本的映射
        const DISK_STATUS_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_DISK_HEALTH'),
            advisory: Translate('IDCS_DISK_ADVISORY'),
            warning: Translate('IDCS_DISK_WARNING'),
        }

        // 磁盘名字与显示文本的映射
        const DISK_INTERFACE_TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_DISK'),
            esata: Translate('IDCS_ESATA'),
            sata: Translate('IDCS_DISK'),
            removable: 'UDisk-',
        }

        const pageData = ref({
            diskList: [] as DiskHealthInfoDiskList[],
            diskIndex: 0,
            isDetail: false,
        })

        const tableData = ref<DiskHealthInfoDiskDetailList[]>([])

        // 选中的磁盘名称
        const diskName = computed(() => {
            return displayDiskName(pageData.value.diskIndex)
        })

        // 选中的磁盘序号
        const diskNum = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.name || ''
        })

        // 选中的磁盘ID
        const diskId = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.id || ''
        })

        // 选中的磁盘状态
        const healthStatus = computed(() => {
            return pageData.value.diskList[pageData.value.diskIndex]?.healthStatus || ''
        })

        /**
         * @description 磁盘名字的文本显示
         * @param {number} key
         * @returns {string}
         */
        const displayDiskName = (key: number) => {
            const item = pageData.value.diskList[key]
            if (!item) return ''
            return DISK_INTERFACE_TYPE_MAPPING[item.diskInterfaceType] + item.name + '(' + item.serialNum + ')'
        }

        /**
         * @description 查看磁盘详情
         * @param {number} key
         */
        const changeDiskCard = (key: number) => {
            pageData.value.diskIndex = key
            pageData.value.isDetail = true
            getDetail()
        }

        /**
         * @description 返回磁盘列表
         */
        const goBack = () => {
            pageData.value.isDetail = false
        }

        /**
         * @description 获取磁盘详情信息
         */
        const getDetail = async () => {
            const sendXml = rawXml`
                <condition>
                    <diskId>${diskId.value}</diskId>
                </condition>
            `
            const result = await queryDiskHealthDetailInfo(sendXml)
            const $ = queryXml(result)

            tableData.value = $('content/disk/item').map((item) => {
                const $item = queryXml(item.element)
                const id = item.attr('id')
                const status = item.attr('status')
                let value = item.attr('value')
                if ([17, 18].includes(Number(id)) && status === 'normal') {
                    value = 'N/A'
                }
                return {
                    id,
                    name: $item('name').text(),
                    status: DISK_STATUS_MAPPING[status],
                    value,
                    suggest: $item('suggest/item')
                        .map((suggest) => suggest.text())
                        .join(';'),
                }
            })
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading()

            const result = await queryAllDisksHealthStatus()
            const $ = queryXml(result)

            closeLoading()

            pageData.value.diskList = $('content/diskList/item').map((item) => {
                const $item = queryXml(item.element)
                const healthStatus = $item('healthStatus').text()
                return {
                    id: item.attr('id'),
                    name: $item('slotIndex').text(),
                    serialNum: $item('serialNum').text(),
                    healthStatus: healthStatus ? DISK_STATUS_MAPPING[healthStatus] : healthStatus,
                    healthStatusValue: healthStatus,
                    diskInterfaceType: $item('diskInterfaceType').text(),
                }
            })
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            displayDiskName,
            diskName,
            healthStatus,
            tableData,
            changeDiskCard,
            goBack,
            diskNum,
        }
    },
})
