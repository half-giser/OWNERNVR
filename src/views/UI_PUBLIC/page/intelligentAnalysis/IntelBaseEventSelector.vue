<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 15:07:31
 * @Description: 智能分析 事件选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 11:45:47
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
                <div class="base-intel-placeholder">
                    <div class="text-ellipsis">{{ content }}</div>
                    <BaseImgSprite
                        file="arrow"
                        :index="0"
                        :chunk="4"
                    />
                </div>
            </template>
            <el-scrollbar
                v-if="mode === 'radio'"
                max-height="300"
            >
                <el-radio-group
                    :model-value="modelValue[0]"
                    class="base-intel-radio-group"
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
            <template v-else>
                <el-scrollbar max-height="300">
                    <el-checkbox-group
                        v-model="checkboxSelected"
                        class="base-intel-checkbox-group"
                    >
                        <el-checkbox
                            v-for="item in options"
                            :key="item.value"
                            :value="item.value"
                            >{{ item.label }}</el-checkbox
                        >
                    </el-checkbox-group>
                </el-scrollbar>
                <div class="base-btn-box">
                    <el-button @click="resetCheckbox">{{ Translate('IDCS_RESET') }}</el-button>
                    <el-button @click="confirmCheckbox">{{ Translate('IDCS_OK') }}</el-button>
                </div>
            </template>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseEventSelector.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>
