/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 18:46:23
 * @Description: 磁盘状态
 */
export default defineComponent({
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        // 状态值与显示文案的映射
        const TRANS_MAPPING: Record<string, string> = {
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
            const raidSwitch = $storage('content/storageSysInfo/raidSwitch').text().bool()
            const enclosureIndex = 0

            const result = await queryDiskStatus()
            const $ = queryXml(result)

            const rowData: SystemDiskStatusList[] = []

            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                diskStatus[item.attr('id')] = {
                    diskStatus: $item('diskStatus').text(),
                    diskEncryptStatus: $item('diskEncryptStatus').text(),
                }
            })

            $storage('content/diskList/item').forEach((item) => {
                const $item = queryXml(item.element)
                const diskInterfaceType = $item('diskInterfaceType').text()
                // 移动U盘不显示
                if (diskInterfaceType === 'removable' || (raidSwitch && !DIST_TYPE_LIST.includes(diskInterfaceType))) {
                    // NTA1-665 开启raid后，磁盘信息页面显示eSATA盘
                    return
                }
                const diskStatus = $(`content/item[@id='${item.attr('id')}']/diskStatus`).text()
                const diskEncryptStatus = $(`content/item[@id='${item.attr('id')}']/diskEncryptStatus`).text()

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
                    id: item.attr('id'),
                    diskNum: DISK_MAPPING[$item('diskInterfaceType').text()] + $item('slotIndex').text(),
                    raidType: 'normal',
                    size: Math.floor($item('size').text().num() / 1024),
                    freeSpace: $item('freeSpace').text().num() / 1024,
                    combinedStatus,
                    diskStatus,
                    diskEncryptStatus,
                    type: $item('diskInterfaceType').text(),
                    source: '',
                    group: '',
                    recTime: recStartDate === recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                    detail: [],
                    status: 'loading',
                    disabled: true,
                    statusTip: '',
                    sortIndex: enclosureIndex * 1000 + $item('slotIndex').text().num(),
                })
            })

            // const supportedRaidTypes = []
            if (raidSwitch) {
                // $storage('content/storageSysInfo/supportedRaidType/item').forEach((item) => {
                //     supportedRaidTypes.push(item.text())
                // })
                $storage('content/raidList/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    const diskStatus = $(`content/item[@id='${item.attr('logicDiskId')}']/diskStatus`).text()
                    const diskEncryptStatus = $(`content/item[@id='${item.attr('logicDiskId')}']/diskEncryptStatus`).text()

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
                        id: item.attr('logicDiskId'),
                        diskNum: $item('name').text(),
                        raidType: $item('raidType').text(),
                        size: Math.floor($item('realSize').text().num() / 1024),
                        freeSpace: $item('freeSpace').text().num() / 1024,
                        combinedStatus,
                        diskStatus,
                        diskEncryptStatus,
                        type: 'raid',
                        source: '',
                        group: '',
                        recTime: recStartDate === recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                        detail: [],
                        status: 'loading',
                        disabled: true,
                        statusTip: '',
                        sortIndex: enclosureIndex * 1000,
                    })
                })
            }

            rowData.sort((a, b) => {
                if (a.sortIndex <= b.sortIndex) return -1
                else return 1
            })

            tableData.value = rowData

            closeLoading()

            // 请求显示设置数据
            tableData.value.forEach((item) => getDetail(item))
        }

        /**
         * @description 查询详情数据
         * @param {string} id
         * @param {number} index
         */
        const getDetail = async (item: SystemDiskStatusList) => {
            const sendXml = rawXml`
                <condition>
                    <diskId>${item.id}</diskId>
                </condition>
            `
            const result = await queryDiskDetailInfo(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                let groupName = ''
                if (item.diskEncryptStatus !== excludeFlag) {
                    groupName = $('content/groupName').text()
                } else {
                    groupName = '--'
                }
                item.source = TRANS_MAPPING[$('content/source').text()]
                item.group = groupName
                item.disabled = false
            }
            item.status = ''
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

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            tableData,
            formatDiskType,
            formatSizeAndFreeSpace,
        }
    },
})
