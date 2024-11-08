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
    >
        <el-table
            stripe
            border
            height="350px"
            :data="chlList"
        >
            <el-table-column
                prop="label"
                width="180"
                :label="Translate('IDCS_CHANNEL_NAME')"
            />
            <el-table-column
                width="178"
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
        <template #footer>
            <el-col class="el-col-flex-end">
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./AlarmBasePresetPop.v.ts"></script>
