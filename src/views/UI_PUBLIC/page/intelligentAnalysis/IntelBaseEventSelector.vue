<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 15:07:31
 * @Description: 智能分析 事件选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 10:22:40
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            placement="bottom"
            width="300"
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
            <el-scrollbar max-height="300">
                <el-radio-group
                    :model-value="modelValue[0]"
                    @change="changeRadio"
                >
                    <el-radio
                        v-for="item in options"
                        :key="item.value"
                        :value="item.value"
                        >{{ item.label }}</el-radio
                    >
                </el-radio-group>
            </el-scrollbar>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseEventSelector.v.ts"></script>

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

.el-radio-group {
    display: flex;
}

.el-radio {
    width: 100%;
}
</style>
