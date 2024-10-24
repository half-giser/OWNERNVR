<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 15:48:54
 * @Description: 磁盘阵列
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 09:13:39
-->
<template>
    <div class="base-flex-box">
        <el-table
            :data="tableData"
            border
            stripe
            height="100%"
            show-overflow-tooltip
        >
            <el-table-column
                :label="Translate('IDCS_SERIAL_NUMBER')"
                type="index"
                width="70"
            >
            </el-table-column>
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
                <template #default="scope">
                    {{ displayRaidState(scope.row.raidState) }}
                </template>
            </el-table-column>

            <el-table-column :label="Translate('IDCS_TYPE')">
                <template #default="scope">
                    {{ displayRaidType(scope.row.raidType) }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_REPAIR')">
                <template #default="scope">
                    <BaseImgSprite
                        file="repair"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="3"
                        :disabled="scope.row.raidState !== 'downgrade'"
                        :chunk="4"
                        @click="rebuildRaid(scope.row, scope.$index)"
                    />
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DELETE')">
                <template #default="scope">
                    <BaseImgSprite
                        file="del"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="deleteRaid(scope.row, scope.$index)"
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
