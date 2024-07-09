<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-07 17:02:25
 * @Description: 通用的选择元素弹框（选择通道、选择人脸分组等弹框...）
-->

<template>
    <el-dialog
        id="BaseSelectItemPopView"
        width="400"
        :title="title"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        align-center
        draggable
        @opened="handleDialogOpened"
    >
        <el-table
            ref="tableRef"
            :data="datas"
            empty-text=" "
            height="400"
            table-layout="fixed"
            show-overflow-tooltip
            stripe
            border
            @row-click="handleRowClick"
        >
            <el-table-column
                type="selection"
                width="70"
            />
            <el-table-column prop="label">
                <template #header>
                    <el-text
                        class="label"
                        :title="Translate('IDCS_CHANNEL_NAME')"
                        truncated
                    >
                        {{ Translate('IDCS_CHANNEL_NAME') }}
                    </el-text>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="ok">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="no">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BaseTableSelectItemPop.v.ts"></script>

<style scoped lang="scss"></style>
