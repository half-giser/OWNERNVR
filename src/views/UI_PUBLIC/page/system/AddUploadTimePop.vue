<!--
 * @Description: 系统——上海地标平台——添加上传时间弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-24 10:03:07
-->
<template>
    <el-dialog
        width="500"
        @open="open"
        @close="close"
    >
        <el-form
            ref="formRef"
            :style="{
                '--form-label-width': '180px',
            }"
        >
            <el-form-item
                :label="Translate('IDCS_SCHEDULE_START_TIME')"
                :style="{ '--form-input-width': '150px' }"
            >
                <el-time-picker
                    v-model="pageData.addTimeData"
                    value-format="HH:mm:ss"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                <el-checkbox
                    v-model="pageData.selectAll"
                    :label="Translate('IDCS_SELECT_ALL')"
                    @change="selectAll"
                />
                <el-checkbox
                    v-model="pageData.reverseSelect"
                    :label="Translate('IDCS_REVERSE_SELECT')"
                    @change="reverseSelection"
                />
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            height="260"
            border
            stripe
            :data="prop.tableData"
            highlight-current-row
            @row-click="handleRowClick"
            @select="handleSelect"
            @select-all="selectAllChl"
        >
            <el-table-column
                type="selection"
                width="60"
            />
            <el-table-column
                prop="chlNum"
                :label="Translate('IDCS_CHANNEL_NUMBER')"
                width="90"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                width="308"
            />
        </el-table>
        <template #footer>
            <el-row>
                <el-col class="el-col-flex-end">
                    <el-button @click="addTime">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./AddUploadTimePop.v.ts"></script>
