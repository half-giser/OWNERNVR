<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭下拉框内容
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-08-21 15:07:36
-->
<template>
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
        <el-row>
            <el-col
                :span="24"
                class="el-col-flex-end btnBox"
            >
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts" src="./BaseTransferPop.v.ts"></script>

<style lang="scss" scoped>
.PosTriggerChannel {
    margin: 10px;
}
.btnBox {
    margin-top: 10px;
}
</style>
