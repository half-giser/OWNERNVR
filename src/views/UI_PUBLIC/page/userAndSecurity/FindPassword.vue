<!--
 * @Date: 2025-05-04 14:50:55
 * @Description: 找回密码设置
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <BaseTab
            v-model="pageData.tab"
            :options="pageData.tabOptions"
        />
        <div v-show="pageData.tab === 'email'">
            <el-form
                ref="emailFormRef"
                class="stripe"
                :rules="emailFormRules"
                :model="emailFormData"
            >
                <el-form-item>
                    <el-checkbox
                        v-model="emailFormData.switch"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </el-form-item>
                <el-form-item
                    prop="email"
                    :label="Translate('IDCS_EMAIL_ADDRESS')"
                >
                    <BaseSensitiveEmailInput
                        v-model="emailFormData.email"
                        :maxlength="256"
                        :placeholder="Translate('IDCS_EMAIL_ADDRESS_INPUT').formatForLang(Translate('IDCS_EMAIL_ADDRESS'))"
                    />
                </el-form-item>
                <el-form-item>
                    <span class="text-tips">* {{ Translate('IDCS_EMAIL_ADDRESS_TIP') }}</span>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button @click="setSecureEmail">{{ Translate('IDCS_APPLY') }}</el-button>
                </div>
            </el-form>
        </div>
        <div
            v-show="pageData.tab === 'question'"
            class="base-flex-box"
        >
            <el-form class="stripe">
                <el-form-item :label="Translate('IDCS_QUESTION')">
                    <el-input
                        v-if="!isDefeultQuestion"
                        v-model="qaFormData.question"
                        :placeholder="Translate('IDCS_QUESTION_TIP')"
                    />
                    <BaseSelect
                        v-else
                        v-model="qaFormData.id"
                        :options="pageData.questionOptions"
                        :props="{
                            label: 'question',
                            value: 'id',
                        }"
                        @change="changeQuestion"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ANSWER')">
                    <el-input
                        v-model="qaFormData.answer"
                        :placeholder="Translate('IDCS_ANSWER_TIP')"
                    />
                    <el-button @click="addQuestion">{{ isDefeultQuestion ? Translate('IDCS_APPLY') : Translate('IDCS_ADD') }}</el-button>
                </el-form-item>
            </el-form>
            <div class="base-table-box">
                <el-table
                    v-title
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                >
                    <el-table-column :label="Translate('IDCS_QUESTION')">
                        <template #default="{ row }: TableColumn<UserFindPwdQuestionForm>">
                            <template v-if="isDefeultQuestion">{{ Translate(row.question) }}</template>
                            <template v-else>{{ row.question }}</template>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_ANSWER')">
                        <span>******</span>
                    </el-table-column>
                    <el-table-column
                        v-if="!isDefeultQuestion"
                        :label="Translate('IDCS_DELETE')"
                    >
                        <template #default="{ $index }: TableColumn<UserFindPwdQuestionForm>">
                            <BaseImgSpriteBtn
                                file="del"
                                @click="deleteQuestion($index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="setSecureQuestion"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @close="pageData.isCheckAuthPop = false"
            @confirm="confirmCheckAuth"
        />
    </div>
</template>

<script src="./FindPassword.v.ts" lang="ts"></script>
