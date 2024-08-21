<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭框弹窗
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-20 10:21:39
-->
<template>
    <el-dialog
        draggable
        center
        width="615px"
        :title="Translate(props.headerTitle)"
        @open="open"
    >
        <div class="PosTriggerChannel">
            <el-transfer
                v-model="chosedList"
                :data="data"
                :props="{
                    key: 'value',
                    label: 'label',
                }"
                :titles="[Translate(props.sourceTitle), Translate(props.targetTitle)]"
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
