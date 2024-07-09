<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 加密密码弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-05 13:47:25
-->
<template>
    <el-dialog
        :title="Translate(prop.title)"
        width="500"
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
        >
            <el-form-item
                prop="pass"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    :type="isShowPassord ? 'text' : 'password'"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
            <el-form-item
                v-show="!prop.decryptFlag"
                :label="Translate('IDCS_SHOW_PASSWORD')"
            >
                <el-checkbox v-model="isShowPassord" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button
                        v-show="!prop.upgradeFlag"
                        @click="close"
                        >{{ Translate('IDCS_CANCEL') }}</el-button
                    >
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
import { type FormInstance, type FormRules } from 'element-plus'
import { UserInputEncryptPwdForm } from '@/types/apiType/userAndSecurity'

const prop = withDefaults(
    defineProps<{
        title?: string
        tip?: string
        decryptFlag?: boolean
        upgradeFlg?: boolean
        encrypt?: string
    }>(),
    {
        title: 'IDCS_EXPORT',
        tip: '',
        decryptFlag: false,
        // NT2-3154 隐藏取消按钮
        upgradeFlag: false,
        encrypt: 'sha512',
    },
)

const emits = defineEmits<{
    (e: 'confirm', data: UserInputEncryptPwdForm): void
    (e: 'close'): void
}>()

const { Translate } = inject('appGlobalProp') as appGlobalProp
const formRef = ref<FormInstance>()
const formData = ref(new UserInputEncryptPwdForm())
const isShowPassord = ref(false)

// 校验规则
const rules = reactive<FormRules>({
    password: [
        {
            required: true,
            message: Translate('IDCS_PROMPT_PASSWORD_EMPTY'),
            trigger: 'blur',
        },
    ],
})

/**
 * @description 重置表单数据
 */
const reset = () => {
    formData.value = new UserInputEncryptPwdForm()
    formRef.value?.clearValidate()
}

/**
 * @description 认证表单数据
 */
const verify = () => {
    formRef.value!.validate(async (valid: boolean) => {
        if (valid) {
            let password = ''
            if (prop.encrypt === 'md5') {
                password = MD5_encrypt(formData.value.password)
            } else {
                password = '' + sha512_encrypt(MD5_encrypt(formData.value.password))
            }
            emits('confirm', { password })
        }
    })
}

/**
 * @description 关闭弹窗
 */
const close = () => {
    emits('close')
}
</script>
