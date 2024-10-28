<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-06 18:00:58
 * @Description: 添加通道 - 添加多通道IPC
-->
<template>
    <el-dialog
        v-model="multiChlIPCCfgDialogVisiable"
        :title="Translate('IDCS_THERMAL_CHANNEL_CONFIG')"
        width="640"
        @opened="opened"
    >
        <el-table
            border
            stripe
            :data="tableData"
            show-overflow-tooltip
            highlight-current-row
            :show-header="false"
            height="300"
        >
            <el-table-column
                prop="name"
                width="140"
            />
            <el-table-column
                min-width="420"
                class-name="custom_cell"
            >
                <template #default="scope">
                    <el-checkbox
                        v-for="(item, index) in scope.row.multichannelCheckedInfoList"
                        :key="index"
                        v-model="item.checked"
                        :label="item.chlLabel"
                        :disabled="item.disabled"
                    />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-row>
                <el-col class="el-col-flex-end">
                    <el-button @click="saveData">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="multiChlIPCCfgDialogVisiable = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddMultiChlIPCAdd.v.ts"></script>

<style scoped lang="scss">
:deep(.custom_cell) {
    .cell {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
}
</style>
