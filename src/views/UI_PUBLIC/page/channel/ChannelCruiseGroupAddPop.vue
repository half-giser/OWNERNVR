<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 10:15:35
 * @Description: 巡航线组 新增巡航线弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CRUISE')"
        width="400"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            v-title
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_CRUISE_NAME')"
            >
                <el-select-v2
                    v-model="formData.name"
                    :options="pageData.cruiseOptions"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseGroupAddPop.v.ts"></script>
