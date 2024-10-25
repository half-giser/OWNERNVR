<!--
 * @Description: 预置点名称配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-20 17:19:44
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-16 10:08:16
-->
<template>
    <el-dialog
        :title="Translate('IDCS_TRIGGER_ALARM_PRESET')"
        width="400"
        hight="450"
        align-center
        draggable
        @open="open"
        @close="close"
    >
        <el-table
            stripe
            border
            :data="tableData"
            :style="{ height: '350px' }"
        >
            <el-table-column
                prop="name"
                width="180"
                :label="Translate('IDCS_CHANNEL_NAME')"
            >
            </el-table-column>
            <el-table-column
                width="178"
                :label="Translate('IDCS_PRESET_NAME')"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.preset.value"
                        size="small"
                        :empty-values="[undefined, null]"
                        @visible-change="getPresetById(scope.row)"
                    >
                        <el-option
                            v-for="item in scope.row.presetList"
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
                <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./SetPresetPop.v.ts"></script>
