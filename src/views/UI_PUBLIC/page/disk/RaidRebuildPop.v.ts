/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 13:43:11
 * @Description: 磁盘阵列重建弹窗
 */
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type FormRules } from 'element-plus'

export default defineComponent({
    props: {
        /**
         * @property 当前选中的阵列
         */
        current: {
            type: Object as PropType<DiskRaidList>,
            required: true,
            default: () => new DiskRaidList(),
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 物理磁盘列表
            physicalDiskList: [] as { id: string; slotIndex: string }[],
            // 鉴权弹窗
            isCheckAuth: false,
        })

        const formRef = useFormRef()
        const formData = ref(new DiskRaidRebuildForm())
        const rules = ref<FormRules>({
            diskId: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error(Translate('IDCS_NO_DISK_TO_REBUILD')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 获取物理磁盘数据
         */
        const getPhysicalDiskData = async () => {
            openLoading()

            const result = await queryPhysicalDiskInfo()
            const $ = queryXml(result)

            closeLoading()

            pageData.value.physicalDiskList = $('content/physicalDisk/item')
                .filter((item) => {
                    return queryXml(item.element)('type').text() === 'normal'
                })
                .map((item) => {
                    return {
                        id: item.attr('id'),
                        slotIndex: queryXml(item.element)('slotIndex').text(),
                    }
                })
        }

        /**
         * @description 验证表单后，打开鉴权弹窗
         */
        const rebuildRaid = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.isCheckAuth = true
                }
            })
        }

        /**
         * @description 确认重建阵列
         * @param {UserCheckAuthForm} e
         */
        const confirmRebuildRaid = async (e: UserCheckAuthForm) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <raidRepairInfo>
                        <raidId>${prop.current.id}</raidId>
                        <disks>
                            <item>${formData.value.diskId}</item>
                        </disks>
                    </raidRepairInfo>
                </content>
                <auth>
                    <userName>${e.userName}</userName>
                    <password>${e.hexHash}</password>
                </auth>
            `
            const result = await repairRaid(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                pageData.value.isCheckAuth = false
                ctx.emit('confirm')
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
                        errorInfo = Translate('IDCS_REPAIR_RAID_ERROR')
                }

                openMessageBox(errorInfo)
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 打开弹窗时，重置表单
         */
        const open = async () => {
            if (!pageData.value.physicalDiskList.length) {
                await getPhysicalDiskData()
            }

            if (pageData.value.physicalDiskList.length) {
                formData.value.diskId = pageData.value.physicalDiskList[0].id
            } else {
                formData.value.diskId = ''
            }
        }

        return {
            pageData,
            BaseCheckAuthPop,
            confirmRebuildRaid,
            rebuildRaid,
            open,
            close,
            formData,
            formRef,
            rules,
        }
    },
})
