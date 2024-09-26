<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 14:51:27
 * @Description: 编辑用户信息弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-24 18:26:09
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_USER_INFO')"
        width="600"
        align-center
        draggable
        @open="handleOpen"
    >
        <el-form
            ref="formRef"
            class="form stripe"
            label-position="left"
            :rules
            :model="formData"
            :class="{
                '--form-label-width': '200px',
            }"
            hide-required-asterisk
            inline-message
        >
            <el-form-item prop="enabled">
                <el-checkbox
                    v-model="formData.enabled"
                    :disabled="pageData.isEnableDisabled"
                    >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                >
            </el-form-item>
            <el-form-item
                prop=""
                :label="Translate('IDCS_USERNAME')"
            >
                <el-input
                    v-model="formData.userName"
                    :placeholder="Translate('IDCS_USERNAME')"
                    disabled
                >
                </el-input>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CLOSE_PERMISSION_CONTROL')">
                <el-checkbox
                    v-model="formData.authEffective"
                    :disabled="pageData.isAuthEffectiveDisabled"
                ></el-checkbox>
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
                v-show="pageData.isAuthGroup"
                prop="authGroup"
                :label="Translate('IDCS_RIGHT_GROUP')"
            >
                <el-select
                    v-model="formData.authGroup"
                    :disabled="pageData.isAuthGroupDisabled"
                >
                    <el-option
                        v-for="item in authGroupOptions"
                        :key="item.id || 'null'"
                        :label="displayAuthGroup(item.name)"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        v-show="pageData.isChangePasswordBtn"
                        class="btn-ok"
                        @click="changePassword"
                        >{{ Translate('IDCS_CHANGE_PWD') }}</el-button
                    >
                    <el-button
                        class="btn-ok"
                        @click="verify"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
                    <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./UserEditPop.v.ts"></script>
