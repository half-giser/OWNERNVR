<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 10:33:50
 * @Description: AI-联动-预置点-选择面板
-->
<template>
    <div class="base-ai-linkage-box preset-box">
        <div class="base-ai-linkage-title">
            <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
        </div>
        <el-table
            v-title
            height="367"
            :data="pageData.chlList"
        >
            <el-table-column
                prop="label"
                width="150"
                :label="Translate('IDCS_CHANNEL_NAME')"
                show-overflow-tooltip
            />
            <el-table-column
                width="150"
                :label="Translate('IDCS_PRESET_NAME')"
            >
                <template #default="{ row }: TableColumn<SelectOption<string, string>>">
                    <BaseSelect
                        :key="key"
                        :model-value="selected[row.value]"
                        :options="pageData.presetList[row.value]"
                        @visible-change="getPresetList(row)"
                        @update:model-value="change(row, $event)"
                    />
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./AlarmBasePresetSelector.v.ts"></script>
