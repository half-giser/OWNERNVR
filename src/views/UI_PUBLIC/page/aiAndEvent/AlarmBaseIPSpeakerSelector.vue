<!--
 * @Description: AI-联动-IP Speaker-选择面板
 * @Author: luoyiming a11593@tvt.net.cn
 * @Date: 2025-05-21 16:37:51
-->
<template>
    <div class="base-ai-linkage-box preset-box">
        <div class="base-ai-linkage-title">
            <span>{{ Translate('IDCS_TRIGGER_ALARM_AUDIO_DEVICE') }}</span>
        </div>
        <el-table
            v-title
            height="367"
            :data="pageData.tableData"
        >
            <el-table-column
                prop="ipSpeakerName"
                width="150"
                :label="Translate('IDCS_IPSPEAKER')"
                show-overflow-tooltip
            />
            <el-table-column
                width="150"
                :label="Translate('IDCS_AUDIO')"
            >
                <template #default="{ row }: TableColumn<AlarmIPSpeakerItem>">
                    <BaseSelect
                        :model-value="row.audioID"
                        :options="pageData.audioList"
                        @update:model-value="change(row, $event)"
                    />
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts" src="./AlarmBaseIPSpeakerSelector.v.ts"></script>
