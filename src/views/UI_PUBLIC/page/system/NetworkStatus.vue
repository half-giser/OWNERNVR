<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:21
 * @Description: 网络状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            v-title
            :data="tableData"
            height="100%"
            show-overflow-tooltip
        >
            <el-table-column :label="Translate('IDCS_ATTRIBUTE')">
                <template #default="{ row }: TableColumn<SystemNetStatusList>">
                    <div
                        class="align"
                        :style="{ 'text-indent': `${row.i * 20}px` }"
                    >
                        {{ row.k }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_VALUE')"
                prop="v"
            />
        </el-table>
    </div>
</template>

<script lang="ts" src="./NetworkStatus.v.ts"></script>

<style lang="scss" scoped>
.align {
    width: 100%;
    text-align: left;
    display: block;
    box-sizing: border-box;
}
</style>
