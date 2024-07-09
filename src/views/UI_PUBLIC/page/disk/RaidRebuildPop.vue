<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:24:54
 * @Description: 磁盘阵列重建弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 10:54:35
-->
<template>
    <el-dialog
        :title="Translate('IDCS_REPAIRING_ARRAY')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules
            label-width="150px"
            label-position="left"
        >
            <el-form-item :label="Translate('IDCS_RAID_NAME')">
                <el-text>{{ current.name }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RAID_TYPE')">
                <el-text>{{ Translate(`IDCS_${current.raidType.replace('_TYPE', '')}`) }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RAID_DISK')">
                <el-text>{{ current.physicalDisk }}</el-text>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PHYSICAL_DISK')">
                <el-radio-group v-model="formData.diskId">
                    <el-radio
                        v-for="item in pageData.physicalDiskList"
                        :key="item.id"
                        :value="item.id"
                        >{{ item.slotIndex }}</el-radio
                    >
                </el-radio-group>
            </el-form-item>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            @confirm="confirmRebuildRaid"
            @close="pageData.isCheckAuth = false"
        />
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="rebuildRaid">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { DiskRaidList } from '@/types/apiType/disk'
import BaseCheckAuthPop from '../../components/auth/BaseCheckAuthPop.vue'
import { type UserCheckAuthForm } from '@/types/apiType/userAndSecurity'
import { type FormInstance, type FormRules } from 'element-plus'

export default defineComponent({
    components: {
        BaseCheckAuthPop,
    },
    props: {
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
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const pageData = ref({
            physicalDiskList: [] as { id: string; slotIndex: string }[],
            isCheckAuth: false,
        })

        const formRef = ref<FormInstance>()
        const formData = ref({
            diskId: '',
        })
        const rules = ref<FormRules>({
            diskId: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value) {
                            callback(new Error('IDCS_NO_DISK_TO_REBUILD'))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const getPhysicalDiskData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryPhysicalDiskInfo()
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            pageData.value.physicalDiskList = $('/response/content/physicalDisk/item')
                .filter((item) => {
                    return queryXml(item.element)('type').text() === 'normal'
                })
                .map((item) => {
                    return {
                        id: item.attr('id')!,
                        slotIndex: queryXml(item.element)('slotIndex').text(),
                    }
                })
        }

        const rebuildRaid = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    pageData.value.isCheckAuth = true
                }
            })
        }

        const confirmRebuildRaid = async (e: UserCheckAuthForm) => {
            openLoading(LoadingTarget.FullScreen)

            const sendXml = rawXml`
                <content>
                    <raidRepairInfo>
                        <raidId>${prop.current.id}</raidId>
                        <disks>
                            <item>${formData.value.diskId}</item>
                        </disks>
                    </raidRepairInfo>
                    <auth>
                        <userName>${e.userName}</userName>
                        <password>${e.hexHash}</password>
                    </auth>
                </content>
            `
            const result = await repairRaid(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
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
                        errorInfo = Translate('IDCS_REPAIR_RAID_ERROR')
                }

                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: errorInfo,
                })
            }
        }

        const close = () => {
            pageData.value.isCheckAuth = false
            ctx.emit('close')
        }

        const open = async () => {
            if (!pageData.value.physicalDiskList.length) {
                await getPhysicalDiskData()
            }
            formData.value.diskId = pageData.value.physicalDiskList[0].id
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
</script>

<style lang="scss" scoped></style>
