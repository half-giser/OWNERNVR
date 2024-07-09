<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 10:09:22
 * @Description: 磁盘管理
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-05 13:56:29
-->
<template>
    <div class="DiskManagement">
        <el-table
            :data="tableData"
            border
            stripe
        >
            <el-table-column
                :label="Translate('IDCS_DISK')"
                prop="diskNum"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_FREE_CAPACITY')"
                prop="sizeAndFreeSpace"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_SERIAL_NUMBER')"
                prop="serialNum"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_TYPE')"
                prop="model"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_STATE')"
                prop="combinedStatus"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_TYPE')"
                prop="type"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_CYCLE_RECORD')"
                prop="cycleRecord"
            >
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DISK_RECORD_PERIOD')"
                prop="recTime"
            >
            </el-table-column>
            <el-table-column>
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_OPERATION') }}
                            <BaseImgSprite
                                class="ddn"
                                file="ddn"
                            />
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="formatAllDisk">{{ Translate('IDCS_FORMATTING') }}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-button @click="formatCurrentDisk(scope.$index)">{{ Translate('IDCS_FORMATTING') }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="btns">
            <el-button
                :disabled="pageData.unlockDisabled"
                @click="handleUnlockDisk"
                >{{ Translate('IDCS_UNLOCK') }}</el-button
            >
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            confirm-text="IDCS_FORMAT_NOW"
            @close="pageData.isCheckAuth = false"
            @confirm="confirmFormatDisk"
        />
        <BaseInputEncryptPwdPop
            v-model="pageData.isInputEncryptPwd"
            :title="Translate('IDCS_UNLOCK')"
            encrypt="md5"
            decrypt-flag
            @close="pageData.isInputEncryptPwd = false"
            @confirm="confirmUnlockDisk"
        />
    </div>
</template>

<script lang="ts" src="./DiskManagement.v.ts"></script>

<style lang="scss" scoped>
.DiskManagement {
    :deep(.el-table) {
        height: calc(100vh - 280px);
    }
    .btns {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
