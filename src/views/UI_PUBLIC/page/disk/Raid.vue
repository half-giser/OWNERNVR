<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 15:48:54
 * @Description: 磁盘阵列
-->
<template>
    <div class="base-flex-box">
        <el-table
            v-title
            :data="tableData"
            height="100%"
            show-overflow-tooltip
            highlight-current-row
        >
            <el-table-column
                :label="Translate('IDCS_SERIAL_NUMBER')"
                type="index"
                width="70"
            />
            <el-table-column
                :label="Translate('IDCS_NAME')"
                prop="name"
            />
            <el-table-column
                :label="Translate('IDCS_CAPACITY')"
                prop="capacity"
            />
            <el-table-column
                :label="Translate('IDCS_PHYSICAL_DISK')"
                prop="physicalDisk"
            />
            <el-table-column
                :label="Translate('IDCS_HOT_DISK_INDEX')"
                prop="spareHard"
            />
            <el-table-column :label="Translate('IDCS_STATE')">
                <template #default="{ row }: TableColumn<DiskRaidList>">
                    {{ displayRaidState(row.raidState) }}
                </template>
            </el-table-column>

            <el-table-column :label="Translate('IDCS_TYPE')">
                <template #default="{ row }: TableColumn<DiskRaidList>">
                    {{ displayRaidType(row.raidType) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_REPAIR')">
                <template #default="{ row, $index }: TableColumn<DiskRaidList>">
                    <BaseImgSpriteBtn
                        file="repair"
                        :disabled="row.raidState !== 'downgrade'"
                        @click="rebuildRaid($index)"
                    />
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DELETE')">
                <template #default="{ row, $index }: TableColumn<DiskRaidList>">
                    <BaseImgSpriteBtn
                        file="del"
                        @click="deleteRaid(row, $index)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TASK')"
                prop="task"
            />
        </el-table>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            @confirm="confirmDeleteRaid"
            @close="pageData.isCheckAuth = false"
        />
        <RaidRebuildPop
            v-model="pageData.isRebuild"
            :current="current"
            @confirm="refreshData"
            @close="pageData.isRebuild = false"
        />
    </div>
</template>

<script lang="ts" src="./Raid.v.ts"></script>
