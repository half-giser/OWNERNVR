/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 13:42:37
 * @Description: 磁盘管理
 */
import { type DiskManagememtList } from '@/types/apiType/disk'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import BaseInputEncryptPwdPop from '../../components/auth/BaseInputEncryptPwdPop.vue'
import type { UserCheckAuthForm, UserInputEncryptPwdForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        BaseInputEncryptPwdPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const dateTime = useDateTimeStore()

        // 磁盘名字与显示文本的映射
        const DISK_TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_DISK'),
            esata: Translate('IDCS_ESATA'),
            sata: Translate('IDCS_DISK'),
            sas: Translate('IDCS_SAS'),
            removable: 'UDisk-',
        }

        // 磁盘类型与显示文本的映射
        const TYPE_MAPPING: Record<string, string> = {
            hotplug: Translate('IDCS_NORMAL_DISK'),
            esata: Translate('IDCS_NORMAL_DISK'),
            sata: Translate('IDCS_NORMAL_DISK'),
            sas: Translate('IDCS_NORMAL_DISK'),
            raid: Translate('IDCS_ARRAY'),
            removable: 'UDISK',
        }

        // 显示文本的映射
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

        // 磁盘状态与显示文本的映射
        const ENCRYPT_STATUS_MAPPING: Record<string, string> = {
            locked: Translate('IDCS_LOCKED'),
            unknown: Translate('IDCS_ENCRYPT_UNKNOWN'),
            encrypted: Translate('IDCS_ENCRYPTED'),
            notEncrypted: Translate('IDCS_NOT_ENCRYPTED'),
        }

        // 循环录入与显示文本的映射
        const CYCLE_RECORD_MAPPING: Record<string, string> = {
            true: Translate('IDCS_ON'),
            false: Translate('IDCS_OFF'),
        }

        const pageData = ref({
            // 解锁按钮是否置灰
            unlockDisabled: true,
            // 鉴权弹窗是否打开
            isCheckAuth: false,
            // 需要格式化的磁盘索引. -1为全部
            formatDiskIndex: -1,
            // 加密密码弹窗是否打开
            isInputEncryptPwd: false,
        })

        const tableData = ref<DiskManagememtList[]>([])

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const storage = await queryStorageDevInfo()
            const $storage = queryXml(queryXml(storage)('//content')[0].element)

            const result = await queryDiskStatus()
            const $ = queryXml(result)

            const rowData: DiskManagememtList[] = []
            const raidSwitch = $storage('storageSysInfo/raidSwitch').text().bool()
            const cycleRecord = $storage('cycleRecord').text()

            $storage('diskList/item').forEach((item) => {
                const $item = queryXml(item.element)
                const diskInterfaceType = $item('diskInterfaceType').text()
                // 开启raid后只显示U盘和esata盘，miniSAS看做e-sata，不管是否开启raid，都会显示miniSAS
                const showRaidType = ['removable', 'esata', 'sas'] // NRKH-101
                if (raidSwitch && !showRaidType.includes(diskInterfaceType)) {
                    return
                }

                const id = item.attr('id')
                const diskStatus = $(`//content/item[@id="${id}"]/diskStatus`).text()
                const diskEncryptStatus = $(`//content/item[@id="${id}"]/diskEncryptStatus`).text()
                const recStartDate = formatDate($item('recStartDate').text(), dateTime.dateFormat, 'YYYY-MM-DD')
                const recEndDate = formatDate($item('recEndDate').text(), dateTime.dateFormat, 'YYYY-MM-DD')

                let combinedStatus = ''
                switch (diskEncryptStatus) {
                    case 'locked':
                        pageData.value.unlockDisabled = false
                        combinedStatus = ENCRYPT_STATUS_MAPPING[diskEncryptStatus]
                        break
                    case 'unknown':
                        combinedStatus = TRANS_MAPPING[diskStatus]
                        break
                    default:
                        combinedStatus = `${TRANS_MAPPING[diskStatus]}(${ENCRYPT_STATUS_MAPPING[diskEncryptStatus]})`
                        break
                }

                const isUDisk = diskInterfaceType === 'removable'
                const size = String(Math.floor($item('size').text().num() / 1024))
                const freeSpace = $item('freeSpace').text().num() / 1024

                rowData.push({
                    id: id,
                    cycleRecord: isUDisk ? '' : CYCLE_RECORD_MAPPING[cycleRecord] || '', // U盘不显示循环录影
                    type: TYPE_MAPPING[diskInterfaceType] || '',
                    diskNum: DISK_TYPE_MAPPING[diskInterfaceType] + $item('slotIndex').text(),
                    serialNum: $item('serialNum').text(),
                    combinedStatus: isUDisk ? '' : combinedStatus, // U盘不显示读写状态
                    diskStatus,
                    diskEncryptStatus,
                    model: $item('model').text(),
                    raidType: 'normal',
                    recTime: recStartDate === recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                    sizeAndFreeSpace: isUDisk ? size : `${freeSpace === 0 ? freeSpace : freeSpace.toFixed(2)}/${size}`, // U盘不需要显示空闲空间
                })
            })

            if (raidSwitch) {
                $storage('raidList/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const logicDiskId = $item('logicDiskId').text()

                    const diskStatus = $(`//content/item[@id="${logicDiskId}"/diskStatus`).text()
                    const diskEncryptStatus = $(`//content/item[@id="${logicDiskId}"]/diskEncryptStatus`).text()
                    const recStartDate = formatDate($item('recStartDate').text(), dateTime.dateFormat, 'YYYY-MM-DD')
                    const recEndDate = formatDate($item('recEndDate').text(), dateTime.dateFormat, 'YYYY-MM-DD')

                    let combinedStatus = ''
                    switch (diskEncryptStatus) {
                        case 'locked':
                            pageData.value.unlockDisabled = false
                            combinedStatus = ENCRYPT_STATUS_MAPPING[diskEncryptStatus]
                            break
                        case 'unknown':
                            combinedStatus = TRANS_MAPPING[diskStatus]
                            break
                        default:
                            combinedStatus = `${TRANS_MAPPING[diskStatus]}(${ENCRYPT_STATUS_MAPPING[diskEncryptStatus]})`
                            break
                    }

                    const size = String(Math.floor($item('size').text().num() / 1024))
                    const freeSpace = $item('freeSpace').text().num() / 1024

                    rowData.push({
                        id: logicDiskId,
                        cycleRecord: CYCLE_RECORD_MAPPING[cycleRecord] || '',
                        type: TYPE_MAPPING.raid,
                        diskNum: $item('name').text(),
                        serialNum: '--',
                        combinedStatus,
                        diskStatus,
                        diskEncryptStatus,
                        model: '--',
                        raidType: $item('raidType').text(),
                        recTime: recStartDate === recEndDate ? recStartDate : recStartDate + '~' + recEndDate,
                        sizeAndFreeSpace: `${freeSpace === 0 ? freeSpace : freeSpace.toFixed(2)}/${size}`,
                    })
                })
            }

            tableData.value = rowData
        }

        /**
         * @description 格式化选中的磁盘，打开鉴权弹窗
         * @param index
         */
        const formatCurrentDisk = (index: number) => {
            pageData.value.formatDiskIndex = index
            openMessageBox({
                type: 'question',
                title: Translate('IDCS_QUESTION_MSG'),
                message: `${Translate('IDCS_FORMAT_MP_DISK_S')}<br><span style="color:red;">${Translate('IDCS_FORMAT_MP_DISK_RESULT')}</span>`.formatForLang(tableData.value[index].diskNum),
            }).then(() => {
                pageData.value.isCheckAuth = true
            })
        }

        /**
         * @description 格式化所有磁盘，打开鉴权弹窗
         */
        const formatAllDisk = () => {
            pageData.value.formatDiskIndex = -1
            openMessageBox({
                type: 'question',
                title: Translate('IDCS_QUESTION_MSG'),
                message: `${Translate('IDCS_FORMAT_ALL_DISKS')}<br><span style="color:var(--color-error);">${Translate('IDCS_FORMAT_MP_DISK_RESULT')}</span>`,
            }).then(() => {
                pageData.value.isCheckAuth = true
            })
        }

        /**
         * @description 鉴权通过后格式化磁盘
         * @param {UserCheckAuthForm} e
         */
        const confirmFormatDisk = async (e: UserCheckAuthForm) => {
            openLoading(LoadingTarget.FullScreen, Translate('IDCS_UPDATA_DATA'))

            const ids = pageData.value.formatDiskIndex === -1 ? tableData.value.map((item) => item.id) : [tableData.value[pageData.value.formatDiskIndex].id]
            const sendXml = rawXml`
                <condition>
                    <diskIds type="list">${ids.map((id) => `<item id="${id}"></item>`).join('')}</diskIds>
                </condition>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            try {
                const result = await formatDisk(sendXml)
                const $ = queryXml(result)

                closeLoading()

                if ($('//status').text() === 'success') {
                    pageData.value.isCheckAuth = false
                    getData()
                } else {
                    const errorCode = $('//errorCode').text().num()
                    let errorInfo = ''

                    switch (errorCode) {
                        case ErrorCode.USER_ERROR_PWD_ERR:
                            errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                            break
                        case ErrorCode.USER_ERROR__CANNOT_FIND_NODE_ERROR:
                            errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                            break
                        case ErrorCode.USER_ERROR_NO_AUTH:
                            errorInfo = Translate('IDCS_NO_AUTH')
                            break
                        default:
                            errorInfo = Translate('IDCS_USER_OR_PASSWORD_ERROR')
                            break
                    }

                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    })
                }
            } catch {
                closeLoading()
            }
        }

        /**
         * @description 点击解锁磁盘，打开密码输入弹窗
         */
        const handleUnlockDisk = () => {
            pageData.value.isInputEncryptPwd = true
        }

        /**
         * @description 输入密码后，解锁磁盘
         * @param {UserInputEncryptPwdForm} e
         */
        const confirmUnlockDisk = async (e: UserInputEncryptPwdForm) => {
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <decryptPassword>${e.password}</decryptPassword>
                </condition>
            `
            const result = await unlockDisk(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.isInputEncryptPwd = false
                getData()
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_UNLOCK_DISK_FAIL'),
                })
            }
        }

        onMounted(async () => {
            openLoading()

            await getData()

            closeLoading()
        })

        return {
            tableData,
            pageData,
            formatCurrentDisk,
            formatAllDisk,
            confirmFormatDisk,
            handleUnlockDisk,
            confirmUnlockDisk,
            BaseCheckAuthPop,
            BaseInputEncryptPwdPop,
        }
    },
})
