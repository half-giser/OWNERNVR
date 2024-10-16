<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:39:30
 * @Description: 隐私政策弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 11:04:25
-->
<template>
    <el-dialog
        width="800"
        align-center
        draggable
        :title="Translate('IDCS_PRIVACY')"
        :show-close="false"
        :modal="true"
        :close-on-click-modal="false"
    >
        <div>
            <textarea
                class="login-privacy"
                :readonly="true"
                :value="Translate('IDCS_PRIVACY_TEXT')"
            >
            </textarea>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    <el-checkbox
                        v-show="forceAllow"
                        v-model="pageData.isAllowPrivacy"
                    >
                        {{ Translate('IDCS_PRIVACY_ALLOW') }}
                    </el-checkbox>
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="forceAllow && !pageData.isAllowPrivacy"
                        @click="closePrivacy()"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./LoginPrivacyPop.v.ts"></script>

<style lange="scss" scoped>
.login-privacy {
    height: 350px;
    overflow: auto;
    width: 754px;
    resize: none;
    box-sizing: border-box;
    padding: 10px;
}
</style>
