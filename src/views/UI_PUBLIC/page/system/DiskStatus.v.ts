/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:46:23
 * @Description: 磁盘状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 15:04:20
 */
import { type SystemDiskStatusList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { openLoading, closeLoading } = useLoading()
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 状态值与显示文案的映射
        const TRANS_MAPPING: Record<string, string> = {
            loadingTip: Translate('IDCS_DEVC_REQUESTING_DATA'),
            bad: Translate('IDCS_NOT_AVAILABLE'),
            local: Translate('IDCS_LOCAL'),
            net: Translate('IDCS_REMOTE'),
            read: Translate('IDCS_READ'),
            'read/write': Translate('IDCS_READ_WRITE'),
            true: Translate('IDCS_ENABLE'),
            false: Translate('IDCS_DISABLE'),
            disk: Translate('IDCS_DISK'),
        }

        const ENCRYPT_STATUS_MAPPING: Record<string, string> = {
            locked: Translate('IDCS_LOCKED'),
            unknown: Translate('IDCS_ENCRYPT_UNKNOWN'),
            encrypted: Translate('IDCS_ENCRYPTED'),
            notEncrypted: Translate('IDCS_NOT_ENCRYPTED'),
        }

        // 磁盘名称与显示文案的映射
        const DISK_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_DISK'),
            esata: Translate('IDCS_ESATA'),
            sata: Translate('IDCS_DISK'),
            sas: Translate('IDCS_SAS'),
        }

        // 磁盘类型与显示文案的映射
        const DISK_TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_NORMAL_DISK'),
            esata: Translate('IDCS_NORMAL_DISK'),
            sata: Translate('IDCS_NORMAL_DISK'),
            sas: Translate('IDCS_NORMAL_DISK'),
            raid: Translate('IDCS_ARRAY'),
            removable: 'UDISK',
        }

        // 数组中包含的硬盘类型表示：开启raid模式的时候，这些类型的硬盘的数据需要从diskList里面获取
        const DIST_TYPE_LIST = ['esata', 'sas']
        const excludeFlag = 'locked'

        type DiskStatus = {
            diskStatus: string
            diskEncryptStatus: string
        }

        const diskStatus: Record<string, DiskStatus> = {}

        const tableData = ref<SystemDiskStatusList[]>([])

        /**
         * @description 获取列表数据
         */
        const getData = async () => {
            openLoading()

            const storageResult = await queryStorageDevInfo()
            const $storage = queryXml(storageResult)
            const raidSwitch = $storage('//content/storageSysInfo/raidSwitch').text().toBoolean()
            const enclosureIndex = 0

            const result = await queryDiskStatus()
            const $ = queryXml(result)

            const rowData: SystemDiskStatusList[] = []

            $('//content/item').forEach((item) => {
                const $item = queryXml(item.element)
                diskStatus[item.attr('id')!] = {
                    diskStatus: $item('diskStatus').text(),
                    diskEncryptStatus: $item('diskEncryptStatus').text(),
                }
            })

            $storage('//content/diskList/item').forEach((item) => {
                const $item = queryXml(item.element)
                const diskInterfaceType = $item('diskInterfaceType').text()
                // 移动U盘不显示
                if (diskInterfaceType === 'removable' || (raidSwitch && !DIST_TYPE_LIST.includes(diskInterfaceType))) {
                    // NTA1-665 开启raid后，磁盘信息页面显示eSATA盘
                    return
                }
                const diskStatus = $(`//content/item[@id='${item.attr('id')}']/diskStatus`).text()
                const diskEncryptStatus = $(`//content/item[@id='${item.attr('id')}']/diskEncryptStatus`).text()

                let recStartDate = $item('recStartDate').text()
                let recEndDate = $item('recEndDate').text()
                if (recStartDate !== '') {
                    recStartDate = formatDate(recStartDate, dateTime.dateFormat)
                }

                if (recEndDate !== '') {
                    recEndDate = formatDate(recEndDate, dateTime.dateFormat)
                }

                let combinedStatus = ''
                switch (diskEncryptStatus) {
                    case 'locked':
                        combinedStatus = ENCRYPT_STATUS_MAPPING[diskEncryptStatus]
                        break
                    case 'unknown':
                        combinedStatus = TRANS_MAPPING[diskStatus]
                        break
                    default:
                        combinedStatus = TRANS_MAPPING[diskStatus] + `(${ENCRYPT_STATUS_MAPPING[diskEncryptStatus]})`
                        break
                }

                rowData.push({
                    id: item.attr('id')!,
                    diskNum: DISK_MAPPING[$item('diskInterfaceType').text()] + $item('slotIndex').text(),
                    raidType: 'normal',
                    size: Math.floor(Number($item('size').text()) / 1024),
                    freeSpace: Number($item('freeSpace').text()) / 1024,
                    combinedStatus,
                    diskStatus,
                    diskEncryptStatus,
                    type: $item('diskInterfaceType').text(),
                    source: '',
                    group: '',
                    recTime: recStartDate == recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                    detail: [],
                    gridRowStatus: 'loading',
                    gridRowDisabled: true,
                    gridRowStatusInitTooltip: TRANS_MAPPING.loadingTip,
                    sortIndex: enclosureIndex * 1000 + Number($item('slotIndex').text()),
                })
            })

            // const supportedRaidTypes = []
            if (raidSwitch) {
                // $storage('//content/storageSysInfo/supportedRaidType/item').forEach((item) => {
                //     supportedRaidTypes.push(item.text())
                // })
                $storage('//content/raidList/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    const diskStatus = $(`//content/item[@id='${item.attr('logicDiskId')}']/diskStatus`).text()
                    const diskEncryptStatus = $(`//content/item[@id='${item.attr('logicDiskId')}']/diskEncryptStatus`).text()

                    let recStartDate = $item('recStartDate').text()
                    let recEndDate = $item('recEndDate').text()
                    if (recStartDate !== '') {
                        recStartDate = formatDate(recStartDate, dateTime.dateFormat)
                    }

                    if (recEndDate !== '') {
                        recEndDate = formatDate(recEndDate, dateTime.dateFormat)
                    }

                    let combinedStatus = ''
                    switch (diskEncryptStatus) {
                        case 'locked':
                            combinedStatus = ENCRYPT_STATUS_MAPPING[diskEncryptStatus]
                            break
                        case 'unknown':
                            combinedStatus = TRANS_MAPPING[diskStatus]
                            break
                        default:
                            combinedStatus = TRANS_MAPPING[diskStatus] + `(${ENCRYPT_STATUS_MAPPING[diskEncryptStatus]})`
                            break
                    }

                    rowData.push({
                        id: item.attr('logicDiskId')!,
                        diskNum: DISK_MAPPING[$item('name').text()] + $item('slotIndex').text(),
                        raidType: $item('raidType').text(),
                        size: Math.floor(Number($item('realSize').text()) / 1024),
                        freeSpace: Number($item('freeSpace').text()) / 1024,
                        combinedStatus,
                        diskStatus,
                        diskEncryptStatus,
                        type: 'raid',
                        source: '',
                        group: '',
                        recTime: recStartDate == recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                        detail: [],
                        gridRowStatus: 'loading',
                        gridRowDisabled: true,
                        gridRowStatusInitTooltip: TRANS_MAPPING.loadingTip,
                        sortIndex: enclosureIndex * 1000,
                    })
                })
            }

            rowData.sort((a, b) => {
                if (a.sortIndex <= b.sortIndex) return -1
                else return 1
            })

            tableData.value = rowData

            // 请求显示设置数据
            const task = tableData.value.map((item, index) => getDetail(item.id, index))
            Promise.all(task).then(() => {
                closeLoading()
            })
        }

        /**
         * @description 查询详情数据
         * @param {string} id
         * @param {number} index
         */
        const getDetail = async (id: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <diskId>${id}</diskId>
                </condition>
            `
            const result = await queryDiskDetailInfo(sendXml)
            const $ = queryXml(result)

            if ($('//status').text() === 'success') {
                let groupName = ''
                if (diskStatus[id].diskEncryptStatus !== excludeFlag) {
                    groupName = $('//content/groupName').text()
                } else {
                    groupName = '--'
                }
                tableData.value[index].source = TRANS_MAPPING[$('//content/source').text()]
                tableData.value[index].group = groupName
                tableData.value[index].gridRowDisabled = false
            }
            tableData.value[index].gridRowStatus = ''
        }

        /**
         * @description 显示磁盘类型
         * @param {SystemDiskStatusList} row
         * @returns {string}
         */
        const formatDiskType = (row: SystemDiskStatusList) => {
            return DISK_TYPE_MAPPING[row.type] ? DISK_TYPE_MAPPING[row.type] : ''
        }

        /**
         * @description 显示磁盘容量与可用空间
         * @param {SystemDiskStatusList} row
         * @returns {string}
         */
        const formatSizeAndFreeSpace = (row: SystemDiskStatusList) => {
            return `${row.freeSpace === 0 ? 0 : row.freeSpace.toFixed(2)}/${row.size}`
        }

        /**
         * 处理右上侧按钮点击刷新
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<SearchToolBarEvent>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            handleToolBarEvent,
            tableData,
            formatDiskType,
            formatSizeAndFreeSpace,
        }
    },
})
