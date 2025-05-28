<!--
 * @Date: 2025-04-27 19:45:17
 * @Description: 网络检测
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                :label="Translate('IDCS_DESTINATION_ADDRESS')"
                prop="address"
            >
                <el-input
                    v-model="formData.address"
                    :maxlength="59"
                    :formatter="formatAddress"
                    :parser="formatAddress"
                />
            </el-form-item>
            <el-form-item>
                {{ Translate('IDCS_DESCRITION_TIP') }}
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="test">{{ Translate('IDCS_TEST') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./NetworkDetection.v.ts"></script>
