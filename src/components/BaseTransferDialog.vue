<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭框弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 17:18:44
-->
<template>
    <el-dialog
        draggable
        center
        :width="(panelWidth - 200) * 2 + 615"
        :title="Translate(props.headerTitle)"
        @open="open"
        @close="close"
    >
        <div>
            <el-transfer
                v-model="chosedList"
                :data="data"
                :props="{
                    key: 'value',
                    label: 'label',
                    disabled: 'disabled',
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
