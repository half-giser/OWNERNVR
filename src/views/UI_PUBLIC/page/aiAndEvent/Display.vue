<!--
 * @Description: AI/事件——事件通知——显示
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-30 09:23:16
-->
<template>
    <el-form
        ref="popVideoRef"
        v-title
        class="stripe"
    >
        <div class="base-head-box">{{ Translate('IDCS_POPUP_VIDEO') }}</div>
        <el-form-item :label="Translate('IDCS_DURATION')">
            <el-select-v2
                v-model="videoFormData.popVideoDuration"
                :options="pageData.popVideoDurationOption"
            />
        </el-form-item>
        <el-form-item
            v-show="pageData.popVideoOutputOption.length >= 2"
            :label="Translate('IDCS_OUTPUT')"
        >
            <el-select-v2
                v-model="videoFormData.popVideoOutput"
                :options="pageData.popVideoOutputOption"
            />
        </el-form-item>
    </el-form>
    <el-form
        ref="popMsgRef"
        v-title
        class="stripe"
    >
        <div class="base-head-box">{{ Translate('IDCS_POPUP_MESSAGEBOX') }}</div>
        <el-form-item>
            <el-checkbox
                v-model="msgFormData.popMsgShow"
                :label="Translate('IDCS_NO_MESSAGEBOX')"
            />
        </el-form-item>
        <el-form-item :label="Translate('IDCS_DURATION')">
            <el-select-v2
                v-model="msgFormData.popMsgDuration"
                :options="pageData.popMsgDurationOption"
            />
        </el-form-item>
        <div class="base-btn-box">
            <el-button @click="setData">
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </el-form>
</template>

<script lang="ts" src="./Display.v.ts"></script>

<!-- <style scoped>
.gap {
    margin-top: 40px;
}
</style> -->
