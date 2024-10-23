<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭下拉框内容
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-22 20:05:00
-->
<template>
    <div class="Transfer">
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
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./BaseTransferPop.v.ts"></script>

<style lang="scss" scoped>
.Transfer {
    margin: 10px;
}
.btnBox {
    margin-top: 10px;
}
</style>
