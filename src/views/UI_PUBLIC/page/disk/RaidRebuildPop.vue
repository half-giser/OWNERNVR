<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 18:24:54
 * @Description: 磁盘阵列重建弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_REPAIRING_ARRAY')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_RAID_NAME')">
                {{ current.name }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RAID_TYPE')">
                {{ Translate(`IDCS_${current.raidType.replace('_TYPE', '')}`) }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RAID_DISK')">
                {{ current.physicalDisk }}
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_PHYSICAL_DISK')"
                prop="diskId"
            >
                <el-radio-group v-model="formData.diskId">
                    <el-radio
                        v-for="item in pageData.physicalDiskList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.slotIndex"
                    />
                </el-radio-group>
            </el-form-item>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            @confirm="confirmRebuildRaid"
            @close="pageData.isCheckAuth = false"
        />
        <div class="base-btn-box">
            <el-button @click="rebuildRaid">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./RaidRebuildPop.v.ts"></script>
