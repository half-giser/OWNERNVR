<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-20 17:25:13
 * @Description: 自动维护
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-21 10:55:23
-->
<template>
    <div class="AutoMaintenance">
        <el-form
            ref="formRef"
            class="form"
            label-position="left"
            hide-required-asterisk
            inline-message
            :rules
            :model="formData"
        >
            <el-form-item>
                <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_INTERVAL_DAYS')"
                prop="interval"
            >
                <el-input
                    v-model="formData.interval"
                    type="number"
                    :placeholder="Translate('IDCS_INTERVAL_DAYS')"
                />
                <span class="date_span">{{ Translate('IDCS_DAYS') }}</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_POINT_TIME')"
                prop="time"
            >
                <el-time-picker
                    v-model="formData.time"
                    format="HH:mm"
                    editable
                    prefix-icon=""
                    :placeholder="Translate('IDCS_POINT_TIME')"
                />
            </el-form-item>
        </el-form>
        <p
            v-show="pageData.isAutoResttartTip"
            class="tip"
        >
            {{ pageData.autoRestartTip }}
        </p>
        <div class="btns">
            <el-button
                class="btn-ok"
                @click="verify"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./AutoMaintenance.v.ts"></script>

<style lang="scss" scoped>
.AutoMaintenance {
    .form {
        :deep(.el-form-item__label) {
            width: 100px;
        }

        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__content) {
            flex-wrap: nowrap;
        }

        .el-select,
        .el-input {
            width: 220px;
            flex-shrink: 0;
        }

        .date_span {
            margin-left: 10px;
        }
    }

    .tip {
        margin: 0;
        padding-top: 20px;
        font-size: 15px;
    }

    .btns {
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }
}
</style>
