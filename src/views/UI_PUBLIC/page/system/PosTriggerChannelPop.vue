<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 15:55:47
 * @Description: POS联动通道设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-03 15:26:53
-->
<template>
    <el-dialog
        draggable
        center
        width="700px"
        :title="Translate('IDCS_CHANNEL_TRGGER')"
        @before-color="close"
        @open="open"
    >
        <div class="PosTriggerChannel">
            <el-transfer
                v-model="value"
                :data="chlList"
                :props="{
                    key: 'id',
                    label: 'text',
                }"
                :titles="[Translate('IDCS_CHANNEL'), Translate('IDCS_CHANNEL_TRGGER')]"
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

<script lang="ts" src="./PosTriggerChannelPop.v.ts"></script>
