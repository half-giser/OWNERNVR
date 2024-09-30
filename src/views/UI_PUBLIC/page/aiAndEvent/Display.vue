<!--
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:16
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-29 14:42:43
-->
<template>
    <el-form
        ref="popVideoRef"
        :model="videoFormData"
        :style="{
            '--form-input-width': '215px',
        }"
        label-position="left"
        inline-message
    >
        <div class="base-subheading-box">{{ Translate('IDCS_POPUP_VIDEO') }}</div>
        <el-form-item
            prop="popVideoDuration"
            :label="Translate('IDCS_DURATION')"
        >
            <el-select v-model="videoFormData.popVideoDuration">
                <el-option
                    v-for="value in pageData.popVideoDurationOption"
                    :key="value"
                    :value="value"
                    :label="displayDurationOption(value)"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item
            v-show="videoFormData.popVideoOutputShow"
            prop="popVideoOutput"
            :label="Translate('IDCS_OUTPUT')"
        >
            <el-select v-model="videoFormData.popVideoOutput">
                <el-option
                    v-for="item in pageData.popVideoOutputOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                >
                </el-option>
            </el-select>
        </el-form-item>
    </el-form>
    <el-form
        ref="popMsgRef"
        :model="msgFormData"
        class="msgbox"
        label-position="left"
        inline-message
        :style="{
            '--form-input-width': '215px',
        }"
    >
        <div class="base-subheading-box">{{ Translate('IDCS_POPUP_MESSAGEBOX') }}</div>
        <el-form-item>
            <el-checkbox v-model="msgFormData.popMsgShow">{{ Translate('IDCS_NO_MESSAGEBOX') }}</el-checkbox>
        </el-form-item>
        <el-form-item
            prop="popMsgDuration"
            :label="Translate('IDCS_DURATION')"
        >
            <el-select v-model="msgFormData.popMsgDuration">
                <el-option
                    v-for="value in pageData.popMsgDurationOption"
                    :key="value"
                    :value="value"
                    :label="displayDurationOption(value)"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <div
            class="base-btn-box"
            :style="{ paddingTop: '40px' }"
        >
            <el-button
                class="btn-ok"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </el-form>
</template>

<script lang="ts" src="./Display.v.ts"></script>

<style scoped>
.msgbox {
    margin-top: 50px;
}
</style>
