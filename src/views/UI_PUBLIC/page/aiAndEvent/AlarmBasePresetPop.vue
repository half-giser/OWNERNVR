<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-20 17:19:44
 * @Description: 预置点配置弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_TRIGGER_ALARM_PRESET')"
        width="400"
        hight="450"
        @open="open"
        @close="close"
    >
        <el-table
            v-title
            height="350"
            :data="chlList"
        >
            <el-table-column
                prop="label"
                width="180"
                :label="Translate('IDCS_CHANNEL_NAME')"
                show-overflow-tooltip
            />
            <el-table-column
                width="178"
                :label="Translate('IDCS_PRESET_NAME')"
            >
                <template #default="{ row }: TableColumn<SelectOption<string, string>>">
                    <BaseSelect
                        :model-value="selected[row.value]"
                        :options="pageData.presetList[row.value]"
                        @visible-change="getPresetList(row)"
                        @update:model-value="change(row, $event)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./AlarmBasePresetPop.v.ts"></script>
