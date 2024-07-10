/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 13:43:11
 * @Description: 磁盘阵列
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 14:10:14
 */

import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { DiskRaidList } from '@/types/apiType/disk'
import { type UserCheckAuthForm } from '@/types/apiType/userAndSecurity'
import RaidRebuildPop from './RaidRebuildPop.vue'

export default defineComponent({
    components: {
        BaseImgSprite,
        BaseCheckAuthPop,
        RaidRebuildPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        let raidStatusTimer: NodeJS.Timeout | number = 0

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
            isCheckAuth: false,
            activeIndex: -1,
            isRebuild: false,
        })

        const current = computed(() => {
            return tableData.value[pageData.value.activeIndex] || new DiskRaidList()
        })

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

        const getData = async () => {
            const result = await queryRaidDetailInfo()
            const $ = queryXml(result)

            let hasRebuildArray = false

            tableData.value = $('/response/content/raidList/item').map((item) => {
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
                    spareHard: $('/response/content/spareHard').text(),
                    task: '',
                }
            })

            tableData.value.push(new DiskRaidList())

            return hasRebuildArray
        }

        const displayRaidState = (str: string) => {
            return STATE_MAPPING[str]
        }

        const displayRaidType = (str: string) => {
            return Translate(`IDCS_${str.replace('_TYPE', '')}`)
        }

        const deleteRaid = (row: DiskRaidList, index: number) => {
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
                message: Translate('IDCS_NOTE_DELETE_RAID').formatForLang(row.name),
            }).then(async () => {
                pageData.value.isCheckAuth = true
                pageData.value.activeIndex = index
            })
        }

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

            if ($('/response/status').text() === 'success') {
                refreshData()
                pageData.value.isCheckAuth = false
            } else {
                const errorCode = Number($('/response/errorCode').text())
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
                    title: Translate('IDCS_INFO_TIP'),
                    message: errorInfo,
                })
            }
        }

        const getRaidStatus = async () => {
            const result = await queryRaidStatus()
            const $ = queryXml(result)

            let hasRebuildArray = false
            $('/response/content/item').forEach((item) => {
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

        const startRefreshProgress = () => {
            stopRefreshProgress()
            raidStatusTimer = setTimeout(() => {
                getRaidStatus()
            }, 60000)
        }

        const stopRefreshProgress = () => {
            clearTimeout(raidStatusTimer)
            raidStatusTimer = 0
        }

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
            BaseImgSprite,
            BaseCheckAuthPop,
            RaidRebuildPop,
        }
    },
})
