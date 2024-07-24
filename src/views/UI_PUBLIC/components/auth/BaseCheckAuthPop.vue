<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 15:00:44
 * @Description: 账号密码权限认证弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-16 20:07:17
-->
<template>
    <el-dialog
        :title="Translate(prop.title)"
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
        >
            <el-form-item
                prop="user"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input
                    v-model="formData.userName"
                    type="password"
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

<script lang="ts" setup>
import { type FormInstance, type FormRules } from 'element-plus'
import { UserCheckAuthForm } from '@/types/apiType/userAndSecurity'

const prop = withDefaults(
    defineProps<{
        title?: string
        tip?: string
        confirmText?: string
    }>(),
    {
        title: 'IDCS_SUPER_USER_CERTIFICATION_RIGHT',
        tip: '',
        confirmText: 'IDCS_OK',
    },
)

const emits = defineEmits<{
    (e: 'confirm', data: UserCheckAuthForm): void
    (e: 'close'): void
}>()

const { Translate } = inject('appGlobalProp') as appGlobalProp
const formRef = ref<FormInstance>()
const formData = ref(new UserCheckAuthForm())
const userSession = useUserSessionStore()
// 校验规则
const rules = reactive<FormRules>({
    userName: [
        {
            required: true,
            message: Translate('IDCS_PROMPT_USERNAME_EMPTY'),
            trigger: 'blur',
        },
    ],
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
    formData.value = new UserCheckAuthForm()
    formRef.value?.clearValidate()
}

/**
 * @description 认证表单数据
 */
const verify = () => {
    formRef.value!.validate(async (valid: boolean) => {
        if (valid) {
            const nonce = userSession.nonce ? userSession.nonce : ''
            formData.value.hexHash = '' + sha512_encrypt(MD5_encrypt(formData.value.password) + '#' + nonce)
            emits('confirm', formData.value)
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

<style lang="scss" scoped>
.unlockTip {
    width: 100%;
    margin-top: 5px;
    height: 60px;
    overflow: auto;
}
</style>
