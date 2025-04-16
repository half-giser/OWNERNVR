<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-10 15:00:04
 * @Description: E-mail发送
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '340px',
            }"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_SENDER_NAME')">
                <BaseSensitiveTextInput v-model="formData.name" />
            </el-form-item>
            <el-form-item
                prop="address"
                :label="Translate('IDCS_SENDER_ADDRESS')"
            >
                <BaseSensitiveEmailInput
                    v-model="formData.address"
                    :show-value="pageData.showUserNameValue"
                    @focus="handleUserNameFocus"
                    @blur="handleUserNameBlur"
                    @input="handleAddressInput"
                />
            </el-form-item>
            <el-form-item
                prop="server"
                :label="Translate('IDCS_STMP_SERVER')"
            >
                <el-input
                    v-model="formData.server"
                    :formatter="formatSTMPServer"
                    :parser="formatSTMPServer"
                    maxlength="64"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STMP_PORT')">
                <BaseNumberInput
                    v-model="formData.port"
                    :min="10"
                    :max="65535"
                />
                <el-button @click="setDefaultPort">{{ Translate('IDCS_USE_DEFAULT') }}</el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SECURITY_LINK')">
                <el-select-v2
                    v-model="formData.ssl"
                    :options="pageData.secureConnectOptions"
                    @change="changeSecurityConnection"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ATTACH_IMAGE')">
                <el-select-v2
                    v-model="formData.attachImg"
                    :options="pageData.attachImgOptions"
                />
            </el-form-item>
            <el-form-item
                v-if="formData.attachImg === 2"
                :label="Translate('IDCS_IMAGE_NUMBER')"
            >
                <el-select-v2
                    v-model="formData.imageNumber"
                    :options="pageData.imageNumberOptions"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.anonymousSwitch"
                    :label="Translate('IDCS_ANONYMOUS_LOGIN')"
                />
            </el-form-item>
            <el-form-item
                prop="userName"
                :label="Translate('IDCS_USER_NAME')"
            >
                <el-input
                    v-if="formData.anonymousSwitch"
                    disabled
                />
                <BaseSensitiveEmailInput
                    v-else
                    v-model="formData.userName"
                    :disabled="formData.anonymousSwitch"
                    :show-value="pageData.showUserNameValue"
                />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    {{ Translate('IDCS_PASSWORD') }}
                    <el-checkbox
                        v-model="pageData.passwordSwitch"
                        :disabled="formData.anonymousSwitch"
                    />
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!pageData.passwordSwitch || formData.anonymousSwitch"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="handleEdit">{{ Translate('IDCS_RECIPIENT_EDIT') }}</el-button>
                <el-button @click="handleTest">{{ Translate('IDCS_TEST') }}</el-button>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <EmailSenderTestPop
            v-model="pageData.isTest"
            :form="formData"
            @close="pageData.isTest = false"
        />
    </div>
</template>

<script lang="ts" src="./EmailSender.v.ts"></script>
