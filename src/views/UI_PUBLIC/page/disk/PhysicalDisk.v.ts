/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:01:02
 * @Description: 物理磁盘
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 10:59:27
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type DiskPhysicalList } from '@/types/apiType/disk'
import PhysicalDiskCreateRaidPop from './PhysicalDiskCreateRaidPop.vue'
import type { UserCheckAuthForm } from '@/types/apiType/user'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
        PhysicalDiskCreateRaidPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        // 类型与文本的映射
        const TYPE_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_NORMAL_DISK'),
            spareHard: Translate('IDCS_HOT_DISK'),
            array: Translate('IDCS_ARRAY_DISK'),
        }

        // 状态与文本的映射
        const STATE_MAPPING: Record<string, string> = {
            normal: Translate('IDCS_NORMAL'),
            abnormal: Translate('IDCS_ABNORMAL'),
            disable: Translate('IDCS_NOT_AVAILABLE'),
        }

        const pageData = ref({
            // 磁盘类型选项
            raidType: [] as SelectOption<string, string>[],
            // 当前选中的磁盘
            activeIndex: 0,
            // 鉴权弹窗
            isCheckAuth: false,
            // 创建阵列弹窗
            isCreateRaid: false,
        })

        const tableData = ref<DiskPhysicalList[]>([])

        /**
         * @description 获取数据
         */
        const getData = async () => {
            const result = await queryPhysicalDiskInfo()
            const $ = queryXml(result)

            pageData.value.raidType = $('//types/raidType/enum').map((item) => {
                const text = item.text()
                return {
                    value: item.text(),
                    label: Translate('IDCS_' + text.replace('_TYPE', '')),
                }
            })

            tableData.value = $('//content/physicalDisk/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    slotIndex: $item('slotIndex').text(),
                    capacity: Math.floor(Number($item('capacity').text())),
                    raid: $item('raid').text(),
                    type: $item('type').text(),
                    state: STATE_MAPPING[$item('state').text()],
                    model: $item('model').text(),
                    switch: false,
                }
            })
        }

        /**
         * @description 显示磁盘类型文案
         * @param {string} type
         * @returns {string}
         */
        const displayType = (type: string) => {
            return TYPE_MAPPING[type]
        }

        /**
         * @description 热备，打开鉴权弹窗
         * @param {DiskPhysicalList} row
         * @param {number} index
         */
        const transformDisk = (row: DiskPhysicalList, index: number) => {
            if (row.type === 'array') {
                return
            }
            openMessageTipBox({
                type: 'question',
                message: row.type === 'normal' ? Translate('IDCS_NOTE_SET_TO_SPARE') : Translate('IDCS_NOTE_SET_TO_FREE'),
            }).then(() => {
                pageData.value.isCheckAuth = true
                pageData.value.activeIndex = index
            })
        }

        /**
         * @description 热备
         * @param {UserCheckAuthForm} e
         */
        const confirmTransformDisk = async (e: UserCheckAuthForm) => {
            openLoading()

            const item = tableData.value[pageData.value.activeIndex]
            const sendXml = rawXml`
                <content>
                    ${item.type === 'normal' ? '<spareInfo>' : '<spareIds>'}
                        <disks>
                            <item>${item.id}</item>
                        </disks>
                    ${item.type === 'normal' ? '</spareInfo>' : '</spareIds>'}
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            let result: Element | XMLDocument
            if (item.type === 'normal') {
                result = await setToSpare(sendXml)
            } else {
                result = await setToFreeDisk(sendXml)
            }
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                pageData.value.isCheckAuth = false
                getData()
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
                        errorInfo = item.type === 'normal' ? Translate('IDCS_CONFIG_HOT_DISK_ERROR') : Translate('IDCS_CONFIG_NORMAL_DISK_ERROR')
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 打开创建阵列弹窗
         */
        const createRaid = () => {
            pageData.value.isCreateRaid = true
        }

        /**
         * @description 创建阵列后，刷新数据
         */
        const confirmCreateRaid = () => {
            pageData.value.isCreateRaid = false
            getData()
        }

        onMounted(() => {
            getData()
        })

        return {
            pageData,
            displayType,
            tableData,
            transformDisk,
            createRaid,
            confirmCreateRaid,
            confirmTransformDisk,
            BaseCheckAuthPop,
            PhysicalDiskCreateRaidPop,
        }
    },
})
