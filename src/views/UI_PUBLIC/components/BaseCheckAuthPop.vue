<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-27 09:38:00
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate(title)"
        width="450"
        align-center
        :before-close="beforCloseCallback"
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="150px"
            label-position="left"
        >
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input
                    v-model="formData.userName"
                    :placeholder="Translate('IDCS_ACCOUNT_TIP')"
                    :title="Translate('IDCS_ACCOUNT_TIP')"
                    @input="
                        (val) => {
                            formData.userName = val.replace(/([`\^\[\]]|[^A-z\d!@#%(){}~_\\'./\-\s])/g, '')
                        }
                    "
                />
            </el-form-item>
            <el-form-item
                prop="password"
                :label="Translate('IDCS_PASSWORD')"
            >
                <el-input
                    v-model="formData.password"
                    type="password"
                    autocomplete="new-password"
                    :placeholder="Translate('IDCS_PASSWORD_TIP')"
                    :title="Translate('IDCS_PASSWORD_TIP')"
                    @paste.capture.prevent=""
                    @copy.capture.prevent=""
                />
            </el-form-item>
        </el-form>
        <el-scrollbar height="60px"> {{ tip }} </el-scrollbar>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="save">{{ Translate(btnOkText) }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BaseCheckAuthPop.v.ts"></script>

<style scoped lang="scss"></style>
