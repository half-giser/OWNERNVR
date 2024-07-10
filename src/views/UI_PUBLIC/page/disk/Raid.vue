<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-08 15:48:54
 * @Description: 磁盘阵列
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 14:10:41
-->

<!-- TODO 此页面需要测试数据 -->
<template>
    <div class="Raid">
        <el-table
            :data="tableData"
            border
            stripe
        >
            <el-table-column
                :label="Translate('IDCS_SERIAL_NUMBER')"
                type="index"
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
            <el-table-column
                :label="Translate('IDCS_STATE')"
                prop="raidState"
            >
                <template #default="scope">
                    {{ displayRaidState(scope.row.raidState) }}
                </template>
            </el-table-column>

            <el-table-column
                :label="Translate('IDCS_TYPE')"
                prop="raidType"
            >
                <template #default="scope">
                    {{ displayRaidType(scope.row.raidType) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_REPAIR')"
                prop="repair"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="repair"
                        :index="0"
                        :hover-index="1"
                        :disabled-index="scope.row.raidState === 'downgrade' ? -1 : 3"
                        :chunk="4"
                        @click="rebuildRaid(scope.row, scope.$index)"
                    />
                </template>
            </el-table-column>

            <el-table-column
                :label="Translate('IDCS_DELETE')"
                prop="del"
            >
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
            >
            </el-table-column>
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

<style lang="scss" scoped>
.Raid {
    :deep(.el-table) {
        height: calc(100vh - 230px);
    }
}
</style>
