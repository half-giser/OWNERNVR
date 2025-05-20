<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-24 14:21:16
 * @Description: IP Speaker - 设置通道默认密码弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_XXX_DEFAULT_PWD').formatForLang(Translate('IDCS_IPSPEAKER'))"
        width="700"
        @opened="opened"
        @closed="formRef?.resetFields()"
    >
        <el-form
            ref="formRef"
            :model="formData"
        >
            <el-table
                v-title
                :data="formData.params"
                height="300"
                flexible
            >
                <el-table-column
                    prop="displayName"
                    :label="Translate('IDCS_PROTOCOL')"
                    width="130"
                    show-overflow-tooltip
                />
                <el-table-column
                    :label="Translate('IDCS_USERNAME')"
                    min-width="240"
                    class-name="cell-with-form-rule"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelDefaultPwdDto>">
                        <el-form-item
                            :prop="`params.${$index}.userName`"
                            :rules="rules.userName"
                        >
                            <el-input
                                v-model="row.userName"
                                :validate-event="false"
                                :formatter="formatInputMaxLength"
                                :parser="formatInputMaxLength"
                                @keyup.enter="blurInput"
                            />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PASSWORD')"
                    width="240"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelDefaultPwdDto>">
                        <span
                            v-show="!row.showInput"
                            @click="togglePwd($index, row)"
                            >{{ row.password ? Array(row.password.length).fill('*').join('') : '******' }}</span
                        >
                        <BasePasswordInput
                            v-show="row.showInput"
                            :ref="(ref) => (passwordInputRef[$index] = ref)"
                            v-model="row.password"
                            maxlength="64"
                            @blur="togglePwd($index, row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <BaseCheckAuthPop
            v-model="isCheckAuthPop"
            @confirm="setData"
            @close="isCheckAuthPop = false"
        />
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelIpSpeakerSetDefaultPwdPop.v.ts"></script>
