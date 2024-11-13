<!--
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:16
-->
<template>
    <el-form
        ref="popVideoRef"
        :model="videoFormData"
        :style="{
            '--form-input-width': '215px',
        }"
        inline-message
    >
        <div class="base-subheading-box">{{ Translate('IDCS_POPUP_VIDEO') }}</div>
        <el-form-item :label="Translate('IDCS_DURATION')">
            <el-select v-model="videoFormData.popVideoDuration">
                <el-option
                    v-for="item in pageData.popVideoDurationOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-select>
        </el-form-item>
        <el-form-item
            v-show="videoFormData.popVideoOutputShow"
            :label="Translate('IDCS_OUTPUT')"
        >
            <el-select v-model="videoFormData.popVideoOutput">
                <el-option
                    v-for="item in pageData.popVideoOutputOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-select>
        </el-form-item>
    </el-form>
    <el-form
        ref="popMsgRef"
        :model="msgFormData"
        class="msgbox"
        inline-message
        :style="{
            '--form-input-width': '215px',
        }"
    >
        <div class="base-subheading-box">{{ Translate('IDCS_POPUP_MESSAGEBOX') }}</div>
        <el-form-item>
            <el-checkbox
                v-model="msgFormData.popMsgShow"
                :label="Translate('IDCS_NO_MESSAGEBOX')"
            />
        </el-form-item>
        <el-form-item :label="Translate('IDCS_DURATION')">
            <el-select v-model="msgFormData.popMsgDuration">
                <el-option
                    v-for="item in pageData.popMsgDurationOption"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
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
