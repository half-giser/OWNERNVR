/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 13:43:11
 * @Description: 磁盘阵列
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import RaidRebuildPop from './RaidRebuildPop.vue'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        RaidRebuildPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const raidStatusTimer = useRefreshTimer(() => {
            getRaidStatus()
        }, 60000)

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
            raidStatusTimer.stop()
            const raidListHasRebuildArray = await getData()
            if (raidListHasRebuildArray) {
                raidStatusTimer.repeat(true)
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

            const spareHard = $('content/spareHard').text()

            tableData.value = $('content/raidList/item').map((item) => {
                const $item = queryXml(item.element)

                if ($item('raidState').text() === 'rebuild') {
                    hasRebuildArray = true
                }

                const raidType = $item('raidType').text()

                return {
                    id: item.attr('id'),
                    logicDiskId: item.attr('logicDiskId'),
                    name: $item('name').text(),
                    capacity: Math.floor($item('capacity').text().num() / 1024),
                    physicalDisk: $item('physicalDisks').text(),
                    raidState: $item('raidState').text(),
                    raidType: $item('raidType').text(),
                    spareHard: raidType === 'RAID_TYPE_0' ? '' : spareHard,
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
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_NOTE_DELETE_RAID').formatForLang(row.name),
            }).then(() => {
                pageData.value.isCheckAuth = true
                pageData.value.activeIndex = index
            })
        }

        /**
         * @description 鉴权弹窗通过后，确认删除阵列
         * @param {UserCheckAuthForm} e
         */
        const confirmDeleteRaid = async (e: UserCheckAuthForm) => {
            openLoading()

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

            closeLoading()

            if ($('status').text() === 'success') {
                refreshData()
                pageData.value.isCheckAuth = false
            } else {
                const errorCode = $('errorCode').text().num()
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

                openMessageBox(errorInfo)
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
            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const raid = item.attr('id')
                const raidState = $item('raidState').text()
                if (raidState === 'RAID_STATE_REBUILD') {
                    hasRebuildArray = true
                }

                const findIndex = tableData.value.findIndex((data) => data.id === raid)
                if (findIndex > -1) {
                    const stateProgress = $item('stateProgress').text().num() / 100
                    tableData.value[findIndex].task = Translate('IDCS_REPAIRING') + ' ' + stateProgress + '%'
                }
            })

            if (hasRebuildArray) {
                raidStatusTimer.repeat()
            }
        }

        /**
         * @description 打开重建阵列弹窗
         * @param {number} index
         */
        const rebuildRaid = (index: number) => {
            pageData.value.isRebuild = true
            pageData.value.activeIndex = index
        }

        onMounted(() => {
            refreshData()
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
        }
    },
})
