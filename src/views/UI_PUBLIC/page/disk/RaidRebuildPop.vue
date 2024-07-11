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

<script lang="ts" src="./RaidRebuildPop.v.ts"></script>

<style lang="scss" scoped></style>
