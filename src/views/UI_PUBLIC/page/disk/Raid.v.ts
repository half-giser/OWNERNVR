/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 13:43:11
 * @Description: 磁盘阵列
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 11:59:28
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { DiskRaidList } from '@/types/apiType/disk'
import RaidRebuildPop from './RaidRebuildPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        RaidRebuildPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        let raidStatusTimer: NodeJS.Timeout | number = 0

        // 状态值与显示文本的映射
        const STATE_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_NORMAL'),
            rebuild: Translate('IDCS_REPAIR'),
            initial: Translate('IDCS_INITIALING_NVMS'),
            expansion: Translate('IDCS_EXPANSION'),
            disable: Translate('IDCS_NOT_AVAILABLE'),
            downgrade: Translate('IDCS_DOWNGRADE'),
        }

        const tableData = ref<DiskRaidList[]>([])
        const pageData = ref({
            // 鉴权弹窗
            isCheckAuth: false,
            // 当前选中的阵列
            activeIndex: -1,
            // 磁盘阵列重建弹窗弹窗
            isRebuild: false,
        })

        // 当前选中的阵列
        const current = computed(() => {
            return tableData.value[pageData.value.activeIndex] || new DiskRaidList()
        })

        /**
         * @description 刷新数据
         * @returns
         */
        const refreshData = async () => {
            const raidListHasRebuildArray = await getData()
            if (!raidListHasRebuildArray) return
            const raidStatusHasRebuildArray = await getRaidStatus()
            if (raidStatusHasRebuildArray) {
                startRefreshProgress()
            } else {
                stopRefreshProgress()
            }
        }

        /**
         * @description 获取列表数据
         * @returns {boolean}
         */
        const getData = async () => {
            const result = await queryRaidDetailInfo()
            const $ = queryXml(result)

            let hasRebuildArray = false

            tableData.value = $('//content/raidList/item').map((item) => {
                const $item = queryXml(item.element)

                if ($item('raidState').text() === 'rebuild') {
                    hasRebuildArray = true
                }

                return {
                    id: item.attr('id')!,
                    logicDiskId: item.attr('logicDiskId')!,
                    name: $item('name').text(),
                    capacity: Math.floor(Number($item('capacity').text()) / 1024),
                    physicalDisk: $item('physicalDisks').text(),
                    raidState: $item('raidState').text(),
                    raidType: $item('raidType').text(),
                    spareHard: $('//content/spareHard').text(),
                    task: '',
                }
            })

            return hasRebuildArray
        }

        /**
         * @description 阵列状态文本
         * @param {string} str
         * @returns {string}
         */
        const displayRaidState = (str: string) => {
            return STATE_MAPPING[str]
        }

        /**
         * @description 阵列类型文本
         * @param {string} str
         * @returns {string}
         */
        const displayRaidType = (str: string) => {
            return Translate(`IDCS_${str.replace('_TYPE', '')}`)
        }

        /**
         * @description 删除阵列，打开鉴权弹窗
         * @param {DiskRaidList} row
         * @param {number} index
         */
        const deleteRaid = (row: DiskRaidList, index: number) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_NOTE_DELETE_RAID').formatForLang(row.name),
            }).then(async () => {
                pageData.value.isCheckAuth = true
                pageData.value.activeIndex = index
            })
        }

        /**
         * @description 鉴权弹窗通过后，确认删除阵列
         * @param {UserCheckAuthForm} e
         */
        const confirmDeleteRaid = async (e: UserCheckAuthForm) => {
            openLoading(LoadingTarget.FullScreen)

            const item = tableData.value[pageData.value.activeIndex]
            const sendXml = rawXml`
                <condition>
                    <raidIds>
                        <item id="${item.id}">${item.logicDiskId}</item>
                    </raidIds>
                </condition>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await delRaid(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                refreshData()
                pageData.value.isCheckAuth = false
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_PWD_ERR:
                    case ErrorCode.USER_ERROR_NO_USER:
                        errorInfo = Translate('IDCS_DEVICE_PWD_ERROR')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_AUTH')
                        break
                    default:
                        errorInfo = Translate('IDCS_DELETE_RAID_ERROR')
                }

                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 获取阵列状态
         * @returns {boolean}
         */
        const getRaidStatus = async () => {
            const result = await queryRaidStatus()
            const $ = queryXml(result)

            let hasRebuildArray = false
            $('//content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const raid = item.attr('id')!
                const raidState = $item('raidState').text()
                if (raidState === 'RAID_STATE_REBUILD') {
                    hasRebuildArray = true
                }

                const findIndex = tableData.value.findIndex((data) => data.id === raid)
                if (findIndex > -1) {
                    const stateProgress = Number($item('stateProgress').text()) / 100
                    tableData.value[findIndex].task = Translate('IDCS_REPAIRING') + stateProgress
                }
            })

            return hasRebuildArray
        }

        /**
         * @description 刷新阵列状态
         */
        const startRefreshProgress = () => {
            stopRefreshProgress()
            raidStatusTimer = setTimeout(() => {
                getRaidStatus()
            }, 60000)
        }

        /**
         * @description 停止刷新阵列状态
         */
        const stopRefreshProgress = () => {
            clearTimeout(raidStatusTimer)
            raidStatusTimer = 0
        }

        /**
         * @description 打开重建阵列弹窗
         * @param {DiskRaidList} row
         * @param {number} index
         */
        const rebuildRaid = (row: DiskRaidList, index: number) => {
            if (row.raidState !== 'downgrade') {
                return
            }
            pageData.value.isRebuild = true
            pageData.value.activeIndex = index
        }

        onMounted(() => {
            refreshData()
        })

        onBeforeUnmount(() => {
            stopRefreshProgress()
        })

        return {
            current,
            tableData,
            rebuildRaid,
            refreshData,
            pageData,
            deleteRaid,
            displayRaidState,
            displayRaidType,
            confirmDeleteRaid,
            BaseCheckAuthPop,
            RaidRebuildPop,
        }
    },
})
