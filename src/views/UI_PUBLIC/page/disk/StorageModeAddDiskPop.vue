<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 17:32:00
 * @Description: 存储模式新增磁盘弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_DISK')"
        width="600"
        @open="open"
    >
        <div>
            <el-table
                :data="tableData"
                show-overflow-tooltip
                height="400"
                @selection-change="changeSelection"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                    width="70"
                />
                <el-table-column
                    type="selection"
                    width="55"
                />
                <el-table-column
                    :label="Translate('IDCS_DISK_NAME')"
                    prop="name"
                />
                <el-table-column
                    :label="Translate('IDCS_CAPACITY')"
                    prop="size"
                />
            </el-table>
        </div>
        <div class="base-btn-box space-between">
            <div>
                {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(pageData.selection.length, tableData.length) }}
            </div>
            <div>
                <el-button @click="confirm">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./StorageModeAddDiskPop.v.ts"></script>
