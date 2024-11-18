<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:47:23
 * @Description: 云台-巡航线-新增/编辑预置点弹窗
-->
<template>
    <el-dialog
        :title="type === 'add' ? Translate('IDCS_ADD_PRESET') : Translate('IDCS_EDIT_PRESET')"
        width="500"
        @open="open"
    >
        <el-form
            ref="formRef"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item
                :label="Translate('IDCS_PRESET_NAME')"
                prop="name"
            >
                <el-select v-model="formData.name">
                    <el-option
                        v-for="item in pageData.nameOptions"
                        :key="item.value"
                        :value="item.label"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DURATION')">
                <el-select v-model="formData.holdTime">
                    <el-option
                        v-for="item in pageData.timeOptions"
                        :key="item"
                        :value="item"
                        :label="getTranslateForSecond(item)"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SPEED')">
                <el-select v-model="formData.speed">
                    <el-option
                        v-for="item in pageData.speedOptions"
                        :key="item"
                        :value="item"
                        :label="item"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="base-btn-box">
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseEditPresetPop.v.ts"></script>
