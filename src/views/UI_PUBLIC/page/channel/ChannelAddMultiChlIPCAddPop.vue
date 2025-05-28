<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-06 18:00:58
 * @Description: 添加通道 - 添加多通道IPC
-->
<template>
    <el-dialog
        :title="Translate('IDCS_XXX_CONFIG').formatForLang(Translate('IDCS_CHANNEL'))"
        width="640"
        @opened="open"
    >
        <el-table
            :data="tableData"
            :show-header="false"
            height="300"
        >
            <el-table-column
                prop="ip"
                width="140"
                show-overflow-tooltip
            />
            <el-table-column min-width="420">
                <template #default="{ row }: TableColumn<ChannelManualAddDto>">
                    <el-checkbox
                        :model-value="getCheckAllValue(row)"
                        :label="Translate('IDCS_ALL')"
                        @update:model-value="updateCheckAllValue($event, row)"
                    />
                    <el-checkbox
                        v-for="(item, index) in row.multiChlList"
                        :key="index"
                        v-model="item.checked"
                        :label="item.chlLabel"
                        :disabled="item.disabled"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="cancel">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddMultiChlIPCAddPop.v.ts"></script>

<style scoped lang="scss">
:deep(.custom_cell) {
    .cell {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
}
</style>
