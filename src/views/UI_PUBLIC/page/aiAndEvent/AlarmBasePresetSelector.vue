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
            stripe
            border
            height="367"
            :data="pageData.chlList"
        >
            <el-table-column
                prop="label"
                width="180"
                :label="Translate('IDCS_CHANNEL_NAME')"
            />
            <el-table-column
                width="170"
                :label="Translate('IDCS_PRESET_NAME')"
            >
                <template #default="scope">
                    <el-select
                        :model-value="selected[scope.row.value]"
                        @visible-change="getPresetList(scope.row)"
                        @update:model-value="change(scope.row, $event)"
                    >
                        <el-option
                            v-for="item in pageData.presetList[scope.row.value]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./AlarmBasePresetSelector.v.ts"></script>
