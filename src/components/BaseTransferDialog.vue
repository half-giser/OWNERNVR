<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭框弹窗
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-26 11:19:11
-->
<template>
    <el-dialog
        draggable
        center
        width="615px"
        :title="Translate(props.headerTitle)"
        :style="{ '--el-dialog-width': `${(panelWidth - 200) * 2 + 615}px` }"
        @close="close"
    >
        <div class="PosTriggerChannel">
            <el-transfer
                v-model="chosedList"
                :data="data"
                :props="{
                    key: 'value',
                    label: 'label',
                }"
                :titles="[source_title, target_title]"
                :style="{ '--el-transfer-panel-width': `${panelWidth}px` }"
                @change="change"
            />
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

<script lang="ts" src="./BaseTransferDialog.v.ts"></script>
