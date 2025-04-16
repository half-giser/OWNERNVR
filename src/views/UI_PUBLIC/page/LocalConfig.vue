<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 11:40:59
 * @Description: 本地配置
-->
<template>
    <div class="local-config">
        <el-form
            ref="formRef"
            v-title
            :rules="formRule"
            :model="formData"
            class="stripe"
            :style="{
                '--form-input-width': '340px',
                '--form-label-width': '150px',
            }"
        >
            <el-form-item :label="Translate('IDCS_SNAP_COUNT')">
                <el-select-v2
                    v-model="formData.snapCount"
                    :disabled="pageData.disabled"
                    :options="pageData.snapOptions"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SNAP_SAVE_PATH')"
                prop="liveSnapSavePath"
            >
                <el-input
                    :model-value="formData.liveSnapSavePath"
                    readonly
                />
                <el-button
                    :disabled="pageData.disabled"
                    @click="changeSnapSavePath"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_REC_FILE_SAVE_PATH')"
                prop="recSavePath"
            >
                <el-input
                    :model-value="formData.recSavePath"
                    readonly
                />
                <el-button
                    :disabled="pageData.disabled"
                    @click="changeRecSavePath"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.disabled"
                    @click="verify"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./LocalConfig.v.ts"></script>

<style lang="scss" scoped>
.local-config {
    width: 100%;
    height: 100%;
    border: 1px solid var(--content-border);
    box-sizing: border-box;
    padding: 10px;
}
</style>
