<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 17:32:00
 * @Description: 存储模式新增磁盘弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-08 19:28:07
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_DISK')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <div class="StorageModeDisk">
            <el-table
                :data="tableData"
                border
                stripe
                @selection-change="changeSelection"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
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
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(pageData.selection.length, tableData.length) }}
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./StorageModeAddDiskPop.v.ts"></script>

<style lang="scss" scoped>
.StorageModeDisk {
    :deep(.el-table) {
        height: 400px;
    }
}
</style>
