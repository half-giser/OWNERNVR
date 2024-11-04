<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:16:08
 * @Description: 智能分析 通道选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-01 18:21:23
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            width="400"
            popper-class="selector"
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
