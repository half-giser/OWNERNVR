<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 15:07:31
 * @Description: 智能分析 事件选择器
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            width="388"
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
                        :label="item.label"
                    />
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
                            :label="item.label"
                        />
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
