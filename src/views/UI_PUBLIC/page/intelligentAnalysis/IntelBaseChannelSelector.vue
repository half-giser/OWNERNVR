<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:16:08
 * @Description: 智能分析 通道选择器
-->
<template>
    <div>
        <BasePopover
            v-model:visible="pageData.isPop"
            width="409"
            popper-class="selector"
        >
            <template #reference>
                <div class="base-intel-placeholder">
                    <div class="text-ellipsis">{{ content }}</div>
                    <BaseImgSprite
                        file="arrow"
                        :chunk="4"
                    />
                </div>
            </template>
            <el-table
                ref="tableRef"
                v-title
                height="400"
                :data="tableData"
                row-key="value"
                @selection-change="handleCurrentChange"
                @row-click="handleRowClick"
            >
                <el-table-column
                    type="selection"
                    width="50"
                />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="label"
                    show-overflow-tooltip
                />
            </el-table>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </BasePopover>
    </div>
</template>

<script lang="ts" src="./IntelBaseChannelSelector.v.ts"></script>
