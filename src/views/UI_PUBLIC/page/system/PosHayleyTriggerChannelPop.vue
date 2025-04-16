<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 17:04:47
 * @Description: POS联动通道设置（Hayley）
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANNEL_TRGGER')"
        width="600"
        @open="open"
    >
        <div>
            <el-table
                v-title
                :data="tableData"
                height="400"
            >
                <el-table-column
                    :label="Translate('IDCS_CHANNEL')"
                    prop="text"
                />
                <el-table-column :label="Translate('IDCS_POS_TILL')">
                    <template #default="{ row }: TableColumn<SystemPosListChls>">
                        <el-input
                            v-model.trim="row.till"
                            type="number"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PosHayleyTriggerChannelPop.v.ts"></script>
