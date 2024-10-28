<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 17:04:47
 * @Description: POS联动通道设置（Hayley）
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 17:52:20
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANNEL_TRGGER')"
        width="600"
        @open="open"
    >
        <div>
            <el-table
                stripe
                border
                :data="tableData"
                height="400"
            >
                <el-table-column
                    :label="Translate('IDCS_CHANNEL')"
                    prop="text"
                ></el-table-column>
                <el-table-column :label="Translate('IDCS_POS_TILL')">
                    <template #default="scope">
                        <el-input
                            v-model.trim="scope.row.till"
                            type="number"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PosHayleyTriggerChannelPop.v.ts"></script>
