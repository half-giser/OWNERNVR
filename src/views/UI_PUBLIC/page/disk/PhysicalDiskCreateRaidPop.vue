<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 16:35:47
 * @Description: 创建磁盘阵列弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-08 19:22:49
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CREATE_RAID')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <div>
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-width="150px"
                label-position="left"
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
                    <el-select
                        v-model="formData.type"
                        @change="getRaidCapacity"
                    >
                        <el-option
                            v-for="(item, key) in raidType"
                            :key
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
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
                            >{{ item.slotIndex }}</el-checkbox
                        >
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_GLOBAL_HOT_STANDBY')">
                    <template v-if="hotDisks.length">
                        <el-text
                            v-for="item in hotDisks"
                            :key="item.id"
                            class="hot-disk"
                            >{{ item.slotIndex }}</el-text
                        >
                    </template>
                    <el-text v-else>{{ Translate('IDCS_NULL') }}</el-text>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_RAID_SPACE')">
                    <el-text>{{ formData.space }}</el-text>
                </el-form-item>
            </el-form>
            <BaseCheckAuthPop
                v-model="pageData.isCheckAuth"
                @close="pageData.isCheckAuth = false"
                @confirm="confirmCreateRaid"
            />
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PhysicalDiskCreateRaidPop.v.ts"></script>

<style lang="scss" scoped></style>
