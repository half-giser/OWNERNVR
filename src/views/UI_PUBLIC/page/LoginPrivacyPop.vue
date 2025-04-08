<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-24 14:39:30
 * @Description: 隐私政策弹窗
-->
<template>
    <el-dialog
        width="800"
        :title="Translate('IDCS_PRIVACY')"
        :show-close="false"
    >
        <div>
            <el-input
                type="textarea"
                :readonly="true"
                :model-value="Translate('IDCS_PRIVACY_TEXT')"
            />
        </div>
        <div class="base-btn-box space-between">
            <div>
                <el-checkbox
                    v-show="forceAllow"
                    v-model="pageData.isAllowPrivacy"
                    :label="Translate('IDCS_PRIVACY_ALLOW')"
                />
            </div>
            <el-button
                :disabled="forceAllow && !pageData.isAllowPrivacy"
                @click="closePrivacy()"
            >
                {{ Translate('IDCS_OK') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./LoginPrivacyPop.v.ts"></script>

<style lange="scss" scoped>
:deep(.el-textarea__inner) {
    height: 350px;
    width: 754px;
    resize: none;
}
</style>
