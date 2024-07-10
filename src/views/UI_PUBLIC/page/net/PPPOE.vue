<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:11:22
 * @Description: PPPoE
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-10 10:06:40
-->
<template>
    <div class="PPPoE">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            label-position="left"
            inline-message
            class="form"
        >
            <el-form-item>
                <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_ACCOUNT')"
                prop="userName"
            >
                <el-input
                    v-model.trim="formData.userName"
                    :disabled="!formData.switch"
                    :formatter="formatInputUserName"
                    :parser="formatInputUserName"
                    :maxlength="nameByteMaxLen"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_CHANGE_PWD')"
                prop="password"
            >
                <el-input
                    v-model.trim="formData.password"
                    type="password"
                    :disabled="!formData.switch || !pageData.passwordSwitch || pageData.wirelessSwitch"
                    @copy.capture.prevent=""
                    @paste.capture.prevent=""
                />
                <el-checkbox
                    v-show="pageData.isPasswordSwitch"
                    v-model="pageData.passwordSwitch"
                    :disabled="!formData.switch || pageData.wirelessSwitch"
                ></el-checkbox>
            </el-form-item>
        </el-form>
        <div class="btns">
            <el-button
                :disabled="pageData.wirelessSwitch"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./PPPOE.v.ts"></script>

<style lang="scss" scoped>
.PPPoE {
    .form {
        :deep(.el-form-item__label) {
            width: 150px;
        }

        :deep(.el-form-item) {
            margin-bottom: 0;
            padding: 10px 0 10px 15px;

            &:nth-child(even) {
                background-color: var(--bg-color5);
            }
        }

        :deep(.el-form-item__content) {
            // justify-content: flex-start;
            flex-wrap: nowrap;
        }

        .el-input {
            width: 340px;
            flex-shrink: 0;
            margin-right: 10px;
        }
        .el-select {
            width: 340px;
        }
    }

    .btns {
        width: 510px;
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
}
</style>
