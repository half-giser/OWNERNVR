<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 10:34:28
 * @Description: AI-联动-常规联动-选择面板
-->
<template>
    <div class="base-ai-linkage-box">
        <div class="base-ai-linkage-title base-ai-linkage-title-checkbox">
            <el-checkbox
                :model-value="isCheckAll"
                :label="Translate('IDCS_TRIGGER_NOMAL')"
                @change="toggleCheckAll"
            />
        </div>
        <el-checkbox-group
            :model-value="modelValue"
            class="stripe odd"
            @update:model-value="change"
        >
            <el-checkbox
                v-for="item in triggerList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-checkbox-group>
    </div>
</template>

<script lang="ts" src="./AlarmBaseTriggerSelector.v.ts"></script>
