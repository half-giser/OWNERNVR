<!--
 * @Date: 2025-04-27 20:04:22
 * @Description: 诊断数据
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <el-form class="stripe">
            <div class="base-head-box">{{ Translate('IDCS_DEBUG_MODE') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="formData.debugModeSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item :label="`${Translate('IDCS_VALIDITY_PERIOD')}(${Translate('IDCS_DAY_TIME')})`">
                <el-select-v2
                    v-model="formData.timeLen"
                    :options="pageData.periodOptions"
                    :disabled="!formData.debugModeSwitch"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.userName && formData.password"
                :label="Translate('IDCS_ACCESS_AUTH')"
            >
                <div class="info">
                    <span>{{ Translate('IDCS_USERNAME') }}</span>
                    <span>({{ formData.userName }})</span>
                    <span> | </span>
                    <span>{{ Translate('IDCS_PASSWORD') }}</span>
                    <span>( {{ pageData.isShowPassword ? formData.password : '********' }} )</span>
                    <BaseImgSprite
                        file="icon_mask"
                        :index="pageData.isShowPassword ? 0 : 2"
                        :hover-index="pageData.isShowPassword ? 1 : 3"
                        :chunk="4"
                        @click="toggleMask()"
                    />
                </div>
            </el-form-item>
            <el-form-item
                v-show="formData.startTime && formData.endTime"
                :label="Translate('IDCS_DEADLINE')"
            >
                {{ displayTime }}
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <el-form
            class="stripe"
            :style="{
                '--form-label-width': '0px',
                '--form-input-width': '400px',
            }"
        >
            <div class="base-head-box">{{ Translate('IDCS_EXPORT_DEBUG_DATA') }}</div>
            <el-form-item>
                <el-radio-group
                    v-model="exportFormData.infoLeve"
                    class="line-break"
                    :disabled="!pageData.debugModeSwitch"
                >
                    <el-radio
                        v-for="item in pageData.exportOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-radio-group>
            </el-form-item>
            <el-form-item v-show="exportFormData.infoLeve === 'advanced' && pageData.debugModeSwitch">
                <el-input
                    v-model="exportFormData.filter"
                    type="textarea"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    v-show="exportFormData.infoLeve === 'advanced' && pageData.debugModeSwitch"
                    @click="clearFilter"
                >
                    {{ Translate('IDCS_CLEAR') }}
                </el-button>
                <label
                    v-show="exportFormData.infoLeve === 'advanced' && pageData.debugModeSwitch"
                    class="el-button"
                    for="h5BrowerImport"
                >
                    <input
                        id="h5BrowerImport"
                        accept=".txt"
                        type="file"
                        hidden
                        @change="changeFile"
                    />
                    <span>{{ Translate('IDCS_UPLOAD_FILTER') }}</span>
                </label>
                <el-button
                    :disabled="!pageData.debugModeSwitch"
                    @click="exportData"
                >
                    {{ Translate('IDCS_EXPORT') }}
                </el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmSetData"
            @close="pageData.isCheckAuthPop = false"
        />
        <BaseInputEncryptPwdPop
            v-model="pageData.isEncryptPwdPop"
            title="IDCS_ENCRYPTION"
            @confirm="confirmExportData"
            @close="pageData.isEncryptPwdPop = false"
        />
    </div>
</template>

<script lang="ts" src="./DebugMode.v.ts"></script>

<style lang="scss" scoped>
.info {
    & > span {
        margin-right: 10px;
    }
}

:deep(.el-textarea__inner) {
    min-height: 100px !important;
}
</style>
