<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 16:35:47
 * @Description: 创建磁盘阵列弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CREATE_RAID')"
        width="600"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <div>
            <el-form
                ref="formRef"
                v-title
                :model="formData"
                :rules="rules"
            >
                <el-form-item
                    :label="Translate('IDCS_RAID_NAME')"
                    prop="name"
                >
                    <el-input
                        v-model="formData.name"
                        :maxlength="15"
                        :formatter="formatChar"
                        :parser="formatChar"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_RAID_TYPE')"
                    prop="type"
                >
                    <el-select-v2
                        v-model="formData.type"
                        :options="raidType"
                        @change="getRaidCapacity"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHYSICAL_DISK')">
                    <el-checkbox-group
                        v-model="formData.diskId"
                        @change="getRaidCapacity"
                    >
                        <el-checkbox
                            v-for="item in diskOptions"
                            :key="item.id"
                            :value="item.id"
                            :label="item.slotIndex"
                        />
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_GLOBAL_HOT_STANDBY')">
                    <template v-if="hotDisks.length">
                        <span
                            v-for="item in hotDisks"
                            :key="item.id"
                            class="hot-disk"
                        >
                            {{ item.slotIndex }}
                        </span>
                    </template>
                    <el-text v-else>{{ Translate('IDCS_NULL') }}</el-text>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_RAID_SPACE')">
                    {{ formData.space }}
                </el-form-item>
            </el-form>
            <BaseCheckAuthPop
                v-model="pageData.isCheckAuth"
                @close="pageData.isCheckAuth = false"
                @confirm="confirmCreateRaid"
            />
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PhysicalDiskCreateRaidPop.v.ts"></script>

<style lang="scss" scoped>
.hot-disk {
    margin-right: 10px;
}
</style>
