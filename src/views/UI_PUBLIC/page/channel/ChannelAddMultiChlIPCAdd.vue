<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-06 18:00:58
 * @Description:
-->
<template>
    <el-dialog
        v-model="multiChlIPCCfgDialogVisiable"
        :title="Translate('IDCS_THERMAL_CHANNEL_CONFIG')"
        width="640"
        align-center
        draggable
        @opened="opened"
    >
        <el-table
            ref="tableRef"
            border
            stripe
            :data="tableData"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            :show-header="false"
            height="300px"
        >
            <el-table-column
                prop="name"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="140px"
            />
            <el-table-column
                :label="Translate('IDCS_CHANNEL_CONFIG')"
                min-width="420px"
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
