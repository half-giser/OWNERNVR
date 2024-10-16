<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 账号密码权限认证弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-15 09:52:07
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="600"
        align-center
        draggable
        :close-on-click-modal="false"
        @close="close"
        @opened="reset"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150px"
            label-position="left"
            hide-required-asterisk
        >
            <el-form-item
                prop="user"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input
                    v-model="formData.userName"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <div
                v-show="tip"
                class="unlockTip"
            >
                {{ tip }}
            </div>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate(confirmText) }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BaseCheckAuthPop.v.ts"></script>

<style lang="scss" scoped>
.unlockTip {
    width: 100%;
    margin-top: 5px;
    height: 60px;
    overflow: auto;
}
</style>
