<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 15:30:50
 * @Description: 物理磁盘 
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-18 11:00:05
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
                show-overflow-tooltip
            >
                <el-table-column :label="Translate('IDCS_DISK')">
                    <template #default="scope">
                        <el-checkbox
                            v-if="scope.row.type === 'normal'"
                            v-model="scope.row.switch"
                            :label="scope.row.slotIndex"
                        />
                        <el-text v-else>{{ scope.row.slotIndex }}</el-text>
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
                    <template #default="scope">{{ displayType(scope.row.type) }}</template>
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
                    <template #default="scope">
                        <BaseImgSprite
                            file="transform"
                            :index="0"
                            :hover-index="2"
                            :chunk="4"
                            :disabled-index="3"
                            :disabled="scope.row.type === 'array'"
                            @click="transformDisk(scope.row, scope.$index)"
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
