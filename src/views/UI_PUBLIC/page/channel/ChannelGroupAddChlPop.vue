<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 18:05:25
 * @Description: 通道组 - 新增通道弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CHANNEL')"
        width="600"
        @opened="opened"
    >
        <el-table
            ref="tableRef"
            :data="tableData"
            show-overflow-tooltip
            highlight-current-row
            height="500"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80"
            />
            <el-table-column
                type="selection"
                width="50"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                min-width="140"
            />
            <el-table-column
                prop="ip"
                :label="Translate('IDCS_ADDRESS')"
                min-width="140"
            />
            <el-table-column
                :label="Translate('IDCS_PREVIEW')"
                width="80"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="play (3)"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handlePreview(scope.row)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <BaseLivePop ref="baseLivePopRef" />
        <div class="base-btn-box">
            <div>
                <span>{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, tableData.length) }}</span>
            </div>
            <div>
                <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelGroupAddChlPop.v.ts"></script>
