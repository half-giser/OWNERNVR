/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:01:29
 * @Description: 存储模式配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 11:08:18
 */
import type { StorageModeDiskGroupListDatum, StorageModeDiskGroupList } from '@/types/apiType/disk'
import StorageModeAddDiskPop from './StorageModeAddDiskPop.vue'
import StorageModeAddChlPop from './StorageModeAddChlPop.vue'

export default defineComponent({
    components: {
        StorageModeAddDiskPop,
        StorageModeAddChlPop,
    },
    setup() {
        const { Translate, langId } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            // 磁盘组列表
            diskGroupList: [] as StorageModeDiskGroupList[],
            // 磁盘数量（除备份组外）
            diskTotalNum: 0,
            // 备份磁盘列表
            backupDiskId: [] as string[],
            // 磁盘状态
            diskStatus: {} as Record<string, { diskStatus: string; diskEncryptStatus: string }>,
            // 新增通道弹窗
            isAddChl: false,
            // 新增磁盘弹窗
            isAddDisk: false,
            // 当前选中的磁盘组
            activeIndex: 0,
        })

        const excludeFlag = 'locked'

        // 当前磁盘组
        const currentItem = computed(() => {
            return (
                pageData.value.diskGroupList[pageData.value.activeIndex] || {
                    id: '',
                    diskList: [],
                    chlList: [],
                    diskCount: 0,
                    totalSize: '',
                }
            )
        })

        /**
         * @description 获取磁盘组数据
         */
        const getDiskGroupList = async () => {
            const sendXml = `
                <condition>
                    <langId>${langId}</langId>
                </condition>
            `
            const result = await queryDiskGroupList(sendXml)
            const $ = queryXml(result)
            const disk = await queryLogicalDiskList(sendXml)
            const $disk = queryXml(disk)
            const isDiskDataSuccess = $disk('//status').text() === 'success'

            pageData.value.diskGroupList = []
            pageData.value.diskTotalNum = 0
            pageData.value.backupDiskId = []

            $('//content/item').forEach((item) => {
                const $item = queryXml(item.element)
                const isBackUp = item.attr('type') === 'backup'

                // web 不显示备份组
                if (!isBackUp) {
                    const chlList = $item('chls/item').map((chl) => {
                        return {
                            id: chl.attr('id')!,
                            text: chl.text(),
                        }
                    })

                    const diskList: StorageModeDiskGroupListDatum[] = []
                    let totalSize = 0
                    $item('disks/item').forEach((element) => {
                        const id = element.attr('id')!
                        if (pageData.value.diskStatus[id].diskEncryptStatus !== excludeFlag) {
                            diskList.push({
                                id,
                                text: element.text(),
                            })
                            if (isDiskDataSuccess) {
                                totalSize += Number($disk(`//content/item[@id="${id}"]/size`).text())
                            }
                        }
                    })

                    pageData.value.diskTotalNum += diskList.length
                    pageData.value.diskGroupList.push({
                        id: item.attr('id')!,
                        chlList,
                        diskList,
                        diskCount: $item('disks/item').length,
                        totalSize: displayStorageSize(totalSize),
                    })
                } else {
                    const backupDiskId = $('disks/item').map((item) => item.attr('id')!)
                    pageData.value.backupDiskId.push(...backupDiskId)
                }
            })
        }

        // 普通组Disabled控制
        const isDiskGroupDisabled = (index: number) => {
            // 磁盘组数序号小于总磁盘数量 || 当前分组有磁盘 || 当前分组有通道
            if (index < pageData.value.diskTotalNum || pageData.value.diskGroupList[index].diskList.length || pageData.value.diskGroupList[index].chlList.length) {
                return false
            }
            return true
        }

        /**
         * @description 计算显示磁盘组容量
         * @param {number} size
         * @returns
         */
        const displayStorageSize = (size: number) => {
            const sizeGB = size / 1024
            if (sizeGB > 1024) {
                const sizeTB = sizeGB / 1024
                return sizeTB.toFixed(1) + 'TB'
            }
            return Math.floor(sizeGB) + 'GB'
        }

        /**
         * @description 打开新增通道弹窗
         */
        const addChl = () => {
            if (!currentItem.value.diskList.length) {
                return
            }
            pageData.value.isAddChl = true
        }

        /**
         * @description 确认新增通道
         */
        const confirmAddChl = () => {
            pageData.value.isAddChl = false
            getDiskGroupList()
        }

        /**
         * @description 删除通道
         * @param {string} id
         */
        const deleteChl = (id: string) => {
            // 嵌入式没有阵列，磁盘和通道删除时都加入默认盘组
            editRelation('chls', id)
        }

        /**
         * @description 新增磁盘
         */
        const addDisk = () => {
            pageData.value.isAddDisk = true
        }

        /**
         * @description 新增磁盘后，刷新数据
         */
        const confirmAddDisk = () => {
            pageData.value.isAddDisk = false
            getDiskGroupList()
        }

        /**
         * @description 删除磁盘
         * @param {string} id
         */
        const deleteDisk = (id: string) => {
            openMessageTipBox({
                type: 'question',
                message: Translate('IDCS_HD_CHANGE_GROUP_WARNING'),
            }).then(() => {
                editRelation('disks', id)
            })
        }

        /**
         * @description 更新编辑数据
         * @param {string} elementName 通道/磁盘
         * @param {string} elementId 通道ID/磁盘ID
         */
        const editRelation = async (elementName: string, elementId: string) => {
            openLoading()

            let chlXml = ''
            if (elementName === 'chls') {
                chlXml = rawXml`
                    <diskGroup>
                        <action type="actionType">remove</action>
                        <id>${currentItem.value.id}</id>
                        <chls type="list">
                            <item id="${elementId}" />
                        </chls>
                    </diskGroup>
                `
            }

            const sendXml = rawXml`
                <types>
                    <actionType>${wrapEnums(['add', 'remove'])}</actionType>
                </types>
                <content>
                    ${chlXml}
                    <diskGroup>
                        <action type="actionType">add</action>
                        <id>${pageData.value.diskGroupList[0].id}</id>
                        <${elementName} type="list">
                            <item id="${elementId}"></item>
                        </${elementName}>
                    </diskGroup>
                </content>
            `

            const result = await editSetAndElementRelation(getXmlWrapData(sendXml))
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_DELETE_SUCCESS'),
                }).finally(() => {
                    getDiskGroupList()
                })
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_DELETE_FAIL'),
                })
            }
        }

        /**
         * @description 获取磁盘状态
         */
        const getDiskStatus = async () => {
            const result = await queryDiskStatus()
            const $ = queryXml(result)
            pageData.value.diskStatus = Object.fromEntries(
                $('//content/item').map((item) => {
                    const $item = queryXml(item.element)
                    const obj = {
                        diskStatus: $item('diskStatus').text(),
                        diskEncryptStatus: $item('diskEncryptStatus').text(),
                    }
                    return [item.attr('id')!, obj]
                }),
            )
        }

        /**
         * @description 改变选中的磁盘组
         * @param {number} index
         */
        const changeDiskGroup = (index: number) => {
            pageData.value.activeIndex = index
        }

        onMounted(async () => {
            openLoading()

            await getDiskStatus()
            await getDiskGroupList()

            closeLoading()
        })

        return {
            pageData,
            isDiskGroupDisabled,
            addChl,
            confirmAddChl,
            deleteChl,
            addDisk,
            confirmAddDisk,
            deleteDisk,
            changeDiskGroup,
            currentItem,
            StorageModeAddDiskPop,
            StorageModeAddChlPop,
        }
    },
})
