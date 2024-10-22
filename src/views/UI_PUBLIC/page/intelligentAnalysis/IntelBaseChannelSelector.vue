<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:16:08
 * @Description: 智能分析 通道选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 11:46:25
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            placement="bottom"
            width="400"
            trigger="click"
            :show-after="0"
            :hide-after="0"
        >
            <template #reference>
                <div class="base-intel-placeholder">
                    <div class="text-ellipsis">{{ content }}</div>
                    <BaseImgSprite
                        file="arrow"
                        :index="0"
                        :chunk="4"
                    />
                </div>
            </template>
            <el-table
                ref="tableRef"
                height="400"
                border
                stripe
                :data="tableData"
                row-key="value"
                @selection-change="handleCurrentChange"
            >
                <el-table-column
                    type="selection"
                    width="50"
                />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="label"
                />
            </el-table>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseChannelSelector.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>
