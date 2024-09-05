<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 14:16:08
 * @Description: 智能分析 通道选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:17:45
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
                <div class="placeholder">
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
                    width="50px"
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

<style lang="scss" scoped>
.placeholder {
    width: 100%;
    height: 30px;
    line-height: 30px;
    text-align: center;
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    border: 1px solid var(--border-color7);
    font-size: 12px;
    box-sizing: border-box;
    padding: 0 5px;
    cursor: pointer;

    div {
        width: 100%;
    }

    span {
        flex-shrink: 0;
    }
}
</style>
