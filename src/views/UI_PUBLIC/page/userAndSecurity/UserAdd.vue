<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:47:30
 * @Description: 添加用户页面
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 14:18:10
-->
<template>
    <div class="UserAdd">
        <el-form
            ref="formRef"
            class="form stripe"
            label-position="left"
            :rules
            :model="formData"
            :style="{
                '--form-input-width': '340px',
                '--form-label-width': '150px',
            }"
            hide-required-asterisk
            inline-message
        >
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USERNAME')"
            >
                <el-input
                    v-model.trim="formData.userName"
                    type="text"
                    :placeholder="Translate('IDCS_USERNAME')"
                    :formatter="formatInputUserName"
                    :parser="formatInputUserName"
                    :maxlength="nameByteMaxLen"
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                    :placeholder="Translate('IDCS_PASSWORD')"
                    @copy.capture.prevent=""
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <BasePasswordStrength
                :strength
                class="strength"
            />
            <el-form-item
                prop="confirmPassword"
                :label="Translate('IDCS_CONFIRM_PASSWORD')"
            >
                <el-input
                    v-model="formData.confirmPassword"
                    type="password"
                    :placeholder="Translate('IDCS_CONFIRM_PASSWORD')"
                    @copy.capture.prevent=""
                    @paste.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="allowModifyPassword"
                :label="Translate('IDCS_ALLOW_CHANGE_PWD')"
            >
                <el-checkbox v-model="formData.allowModifyPassword"></el-checkbox>
            </el-form-item>
            <el-form-item
                prop="email"
                :label="Translate('IDCS_EMAIL_ADDRESS')"
            >
                <BaseSensitiveEmailInput
                    v-model="formData.email"
                    :placeholder="Translate('IDCS_EMAIL_ADDRESS')"
                />
            </el-form-item>
            <el-form-item
                prop="authGroup"
                :label="Translate('IDCS_RIGHT_GROUP')"
            >
                <el-select v-model="formData.authGroup">
                    <el-option
                        v-for="item in authGroupOptions"
                        :key="item.id"
                        :label="displayAuthGroup(item.name)"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
            <div class="notice">{{ noticeMsg }}</div>
            <div class="base-btn-box">
                <el-button
                    class="btn-ok"
                    @click="verify"
                    >{{ Translate('IDCS_ADD') }}</el-button
                >
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="isAuthDialog"
            @close="isAuthDialog = false"
            @confirm="doCreateUser"
        />
    </div>
</template>

<script lang="ts" src="./UserAdd.v.ts"></script>

<style lang="scss" scoped>
.strength {
    width: calc(var(--form-input-width) + var(--form-label-width) + 15px);
}

.notice {
    margin: 15px 15px;
    font-size: 15px;
}
</style>
