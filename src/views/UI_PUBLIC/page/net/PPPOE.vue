<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 09:11:22
 * @Description: PPPoE
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 13:32:20
-->
<template>
    <div>
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
            inline-message
            class="stripe"
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
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.wirelessSwitch"
                    @click="setData"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PPPOE.v.ts"></script>
