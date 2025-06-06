<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-06-04 17:18:19
 * @Description: 新增/编辑工作机弹窗
-->
<template>
    <el-dialog
        :title="type === 'add' ? Translate('IDCS_HOT_STANDBY_ADD_WORK_MACHINE') : Translate('IDCS_HOT_STANDBY_EDIT_WORK_MACHINE')"
        width="400"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
        >
            <!-- ip -->
            <el-form-item
                label="IPV4"
                prop="ip"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <!-- 端口 -->
            <el-form-item :label="Translate('IDCS_PORT')">
                <BaseNumberInput
                    v-model="formData.port"
                    :min="10"
                    :max="65535"
                />
            </el-form-item>
            <!-- 用户名 -->
            <el-form-item
                :label="Translate('IDCS_USERNAME')"
                prop="userName"
            >
                <BaseTextInput
                    v-model="formData.userName"
                    :disabled="true"
                />
            </el-form-item>
            <!-- 密码 -->
            <el-form-item :label="Translate('IDCS_PASSWORD')">
                <BasePasswordInput v-model="formData.password" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="test">{{ Translate('IDCS_TEST') }}</el-button>
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./HotStandbyWorkMachineAddPop.v.ts"></script>

<style lang="scss" scoped>
.tip {
    margin-bottom: 10px;
}
</style>
