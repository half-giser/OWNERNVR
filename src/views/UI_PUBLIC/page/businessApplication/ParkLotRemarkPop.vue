<!--
 * @Date: 2025-05-08 15:58:43
 * @Description: 停车场 remark弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        width="450"
        :title="Translate('IDCS_OPEN_GATE_RELEASE')"
        @close="formRef?.resetFields()"
    >
        <el-form ref="formRef">
            <el-form-item :label="Translate('IDCS_REMARK')">
                <el-input
                    v-model="formData.remark"
                    maxlength="128"
                    :formatter="formatRemark"
                    :parser="formatRemark"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ParkLotRemarkPop.v.ts"></script>
