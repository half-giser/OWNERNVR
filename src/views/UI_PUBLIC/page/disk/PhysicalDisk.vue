<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 15:30:50
 * @Description: 物理磁盘 
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
                show-overflow-tooltip
                highlight-current-row
            >
                <el-table-column :label="Translate('IDCS_DISK')">
                    <template #default="{ row }: TableColumn<DiskPhysicalList>">
                        <el-checkbox
                            v-if="row.type === 'normal'"
                            v-model="row.switch"
                            :label="row.slotIndex"
                        />
                        <el-text v-else>{{ row.slotIndex }}</el-text>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CAPACITY')"
                    prop="capacity"
                />
                <el-table-column
                    :label="Translate('IDCS_ARRAY')"
                    prop="raid"
                />
                <el-table-column :label="Translate('IDCS_TYPE')">
                    <template #default="{ row }: TableColumn<DiskPhysicalList>">{{ displayType(row.type) }}</template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_STATE')"
                    prop="state"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_TYPE')"
                    prop="model"
                    width="210"
                />
                <el-table-column :label="Translate('IDCS_HOT_TO_DISK')">
                    <template #default="{ row, $index }: TableColumn<DiskPhysicalList>">
                        <BaseImgSpriteBtn
                            file="transform"
                            :disabled="row.type === 'array'"
                            @click="transformDisk(row, $index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="createRaid">{{ Translate('IDCS_CREATE_RAID') }}</el-button>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            @close="pageData.isCheckAuth = false"
            @confirm="confirmTransformDisk"
        />
        <PhysicalDiskCreateRaidPop
            v-model="pageData.isCreateRaid"
            :list="tableData"
            :raid-type="pageData.raidType"
            @confirm="confirmCreateRaid"
            @close="pageData.isCreateRaid = false"
        />
    </div>
</template>

<script lang="ts" src="./PhysicalDisk.v.ts"></script>
