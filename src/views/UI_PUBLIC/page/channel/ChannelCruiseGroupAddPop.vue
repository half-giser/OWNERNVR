<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 10:15:35
 * @Description: 巡航线组 新增巡航线弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CRUISE')"
        width="500"
        @open="open"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item prop="name">
                <el-select v-model="formData.name">
                    <el-option
                        v-for="item in pageData.cruiseOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseGroupAddPop.v.ts"></script>
