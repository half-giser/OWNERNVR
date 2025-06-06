<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-18 09:33:05
 * @Description: 开机向导
-->
<template>
    <div class="guide">
        <div class="content">
            <!-- 向导 -->
            <div
                v-show="pageData.current === 'languageAndRegion'"
                class="lang"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <div ref="langRef">
                        <div class="lang-title">{{ Translate('IDCS_LANGUAGE') }}</div>
                        <BaseListBox
                            class="lang-list"
                            border
                        >
                            <BaseListBoxItem
                                v-for="(item, key) in pageData.langTypes"
                                :key="key"
                                :active="langFormData.lang === key"
                                @click="changeLangType(key)"
                            >
                                {{ item }}
                            </BaseListBoxItem>
                        </BaseListBox>
                    </div>
                    <div ref="regionRef">
                        <div class="lang-title">{{ Translate('IDCS_LOCALITY') }}</div>
                        <BaseListBox
                            class="region-list"
                            border
                        >
                            <BaseListBoxItem
                                v-for="item in pageData.regionList"
                                :key="item.id"
                                :active="langFormData.regionId === item.id"
                                @click="changeRegion(item.id, item.code)"
                            >
                                {{ Translate(item.name) }}
                            </BaseListBoxItem>
                        </BaseListBox>
                    </div>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- 隐私声明 -->
            <div
                v-show="pageData.current === 'privacy'"
                class="privacy"
            >
                <div class="title">{{ Translate('IDCS_PRIVACY') }}</div>
                <div class="box">
                    <el-input
                        class="privacy-text"
                        type="textarea"
                        readonly
                        :model-value="Translate('IDCS_PRIVACY_TEXT')"
                    />
                </div>
                <div class="base-btn-box padding">
                    <el-checkbox
                        v-model="privacyFormData.checked"
                        :label="Translate('IDCS_PRIVACY_ALLOW')"
                    />
                    <el-button
                        :disabled="!privacyFormData.checked"
                        @click="handleNext"
                    >
                        {{ Translate('IDCS_OK') }}
                    </el-button>
                </div>
            </div>
            <!-- 日期与时间 -->
            <div
                v-show="pageData.current === 'dateAndTimezone'"
                class="date"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <el-form
                        ref="dateTimeFormRef"
                        v-title
                        :rules="dateTimeFormRules"
                        :style="{
                            '--form-input-width': '100%',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_TIME_ZONE')">
                            <BaseSelect
                                v-model="dateTimeFormData.timeZone"
                                :options="pageData.timeZoneOption"
                                :props="{
                                    value: 'timeZone',
                                }"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_SYSTEM_TIME')">
                            <BaseDatePicker
                                v-model="dateTimeFormData.systemTime"
                                :disabled="dateTimeFormData.syncType === 'NTP'"
                                :format="formatSystemTime"
                                type="datetime"
                                @visible-change="pendingSystemTimeChange"
                                @change="handleSystemTimeChange"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_DATE_FORMAT')">
                            <BaseSelect
                                v-model="dateTimeFormData.dateFormat"
                                :options="pageData.dateFormatOptions"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                            <BaseSelect
                                v-model="dateTimeFormData.timeFormat"
                                :options="pageData.timeFormatOptions"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_DST')">
                            <el-checkbox
                                v-model="dateTimeFormData.enableDST"
                                :disabled="isDSTDisabled"
                                :label="Translate('IDCS_ENABLE')"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_SYNC_WAY')">
                            <BaseSelect
                                v-model="dateTimeFormData.syncType"
                                :options="pageData.syncTypeOptions"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_TIME_SERVER')">
                            <BaseSelectInput
                                v-model="dateTimeFormData.timeServer"
                                :options="pageData.timeServerOptions"
                                :disabled="dateTimeFormData.syncType !== 'NTP'"
                                :validate="checkTimeServer"
                            />
                        </el-form-item>
                        <el-form-item
                            v-if="dateTimeFormData.syncType === 'Gmouse'"
                            :label="Translate('IDCS_BAUD_RATE')"
                        >
                            <BaseSelectInput
                                v-model="dateTimeFormData.gpsBaudRate"
                                :options="pageData.gpsBaudRateOptions"
                                :disabled="dateTimeFormData.syncType !== 'Gmouse'"
                                :validate="checkGPSBaudRate"
                            />
                        </el-form-item>
                        <el-form-item
                            :label="`${Translate('IDCS_NTP_INTERVAL')}[${Translate('IDCS_MINUTE')}]`"
                            prop="ntpInterval"
                        >
                            <BaseNumberInput
                                v-model="dateTimeFormData.ntpInterval"
                                :min="dateTimeFormData.ntpIntervalMin"
                                :max="dateTimeFormData.ntpIntervalMax"
                                :disabled="dateTimeFormData.syncType !== 'NTP'"
                                @out-of-range="handleNtpIntervalOutOfRange"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_VIDEO_FORMAT')">
                            <BaseSelect
                                v-model="dateTimeFormData.videoType"
                                :options="pageData.videoTypeOptions"
                            />
                        </el-form-item>
                    </el-form>
                </div>
                <div class="base-btn-box padding">
                    <el-button
                        v-show="steps.indexOf('dateAndTimezone') > 0"
                        @click="handlePrev"
                        >{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button
                    >
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- 账户 -->
            <div
                v-show="pageData.current === 'user'"
                class="user"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <el-form
                        v-title
                        :style="{
                            '--form-input-width': '100%',
                        }"
                    >
                        <el-form-item>
                            <el-text class="user-title">{{ Translate('IDCS_ADMIN_PASSWORD_SETUP').formatForLang(userFormData.userName) }}</el-text>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ADMIN_NAME')">
                            <el-input
                                :model-value="userFormData.userName"
                                disabled
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_NEW_PASSWORD')">
                            <BasePasswordInput
                                v-model="userFormData.password"
                                maxlength="16"
                            />
                        </el-form-item>
                        <el-form-item>
                            <BasePasswordStrength :strength="passwordStrengthForUser" />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')">
                            <BasePasswordInput
                                v-model="userFormData.confirmPassword"
                                maxlength="16"
                            />
                        </el-form-item>
                        <el-form-item>
                            <span
                                v-clean-html="pageData.passwordNoticeMsg"
                                class="base-rich-text"
                            ></span>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="base-btn-box padding">
                    <el-button
                        v-show="steps.indexOf('user') > 0"
                        @click="handlePrev"
                    >
                        {{ Translate('IDCS_PREVIOUS_STEP') }}
                    </el-button>
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- 通道配置（通道默认协议密码/通道IP规划） -->
            <div
                v-show="pageData.current === 'chlConfig'"
                class="chlConfig"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <el-tabs
                        v-model="pageData.chlConfigTab"
                        class="base-chlConfig-tabs"
                    >
                        <!-- 通道预设密码 -->
                        <el-tab-pane
                            v-if="pageData.supportsIPCActivation"
                            :label="Translate('IDCS_DEV_DEFAULT_PWD')"
                            name="pwd"
                        >
                            <el-form
                                v-title
                                :style="{
                                    '--form-input-width': '100%',
                                }"
                            >
                                <el-form-item :label="Translate('IDCS_DEFAULT_PASSWORD')">
                                    <BasePasswordInput
                                        v-model="chlConfigFormData.password"
                                        maxlength="16"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <BasePasswordStrength :strength="passwordStrengthForChlConfig" />
                                </el-form-item>
                                <el-form-item>
                                    <span
                                        v-clean-html="pageData.passwordNoticeMsg"
                                        class="base-rich-text"
                                    ></span>
                                </el-form-item>
                                <el-form-item>
                                    <span class="base-rich-text ipc-password-tip">{{ Translate('IDCS_DEFAULT_PASSWORD_TIP') }}</span>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <!-- 通道IP规划 -->
                        <el-tab-pane
                            :label="Translate('IDCS_DEV_CHANNEL_IP_PLANNING')"
                            name="ip"
                        >
                            <el-form
                                v-title
                                :style="{
                                    '--form-input-width': '100%',
                                }"
                            >
                                <el-form-item>
                                    <el-checkbox
                                        v-model="chlConfigFormData.checked"
                                        :label="Translate('IDCS_ENABLE')"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <span class="base-rich-text ipc-ip-tip">{{ Translate('IDCS_DEV_CHANNEL_IP_PLANNING_TEXT') }}</span>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="handlePrev">{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button>
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- Email和创建问题答案 -->
            <div
                v-show="pageData.current === 'emailAndQa'"
                class="emailAndQa"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <el-tabs
                        v-model="pageData.emailAndQaTab"
                        class="base-emailAndQa-tabs"
                    >
                        <!-- E-mail -->
                        <el-tab-pane
                            v-if="pageData.supportsIPCActivation"
                            :label="Translate('IDCS_EMAIL')"
                            name="email"
                        >
                            <el-form
                                v-title
                                :style="{
                                    '--form-input-width': '69%',
                                }"
                            >
                                <el-form-item>
                                    <el-checkbox
                                        v-model="qaEmailData.checked"
                                        :label="Translate('IDCS_ENABLE')"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_EMAIL_ADDRESS')">
                                    <el-input
                                        v-model="qaEmailData.email"
                                        :placeholder="Translate('IDCS_EMAIL_ADDRESS_INPUT').formatForLang(Translate('IDCS_EMAIL_ADDRESS'))"
                                        maxlength="256"
                                    />
                                </el-form-item>
                                <el-form-item>
                                    <span class="base-rich-text email-tip">{{ `'*' ${Translate('IDCS_EMAIL_ADDRESS_TIP')}` }}</span>
                                </el-form-item>
                            </el-form>
                        </el-tab-pane>
                        <!-- 密保问题 -->
                        <el-tab-pane
                            :label="Translate('IDCS_PASSWORD_PROTECT_QUESTION')"
                            name="qa"
                        >
                            <el-form
                                v-title
                                :style="{
                                    '--form-input-width': '340px',
                                }"
                            >
                                <el-form-item :label="Translate('IDCS_QUESTION')">
                                    <el-input
                                        v-if="!isDefeultQuestion"
                                        v-model="qaFormData.question"
                                    />
                                    <BaseSelect
                                        v-else
                                        v-model="qaFormData.id"
                                        :options="questionOptions"
                                        :props="{
                                            label: 'question',
                                            value: 'id',
                                        }"
                                        @change="changeQuestion"
                                    />
                                </el-form-item>
                                <el-form-item :label="Translate('IDCS_ANSWER')">
                                    <el-input v-model="qaFormData.answer" />
                                    <el-button @click="addQuestion">{{ isDefeultQuestion ? Translate('IDCS_APPLY') : Translate('IDCS_ADD') }}</el-button>
                                </el-form-item>
                            </el-form>
                            <div class="base-table-box">
                                <el-table
                                    v-title
                                    :height="238"
                                    :data="qaTableData"
                                    show-overflow-tooltip
                                >
                                    <el-table-column :label="Translate('IDCS_QUESTION')">
                                        <template #default="{ row }: TableColumn<SystemGuideQuestionForm>">
                                            <template v-if="isDefeultQuestion">{{ Translate(row.question) }}</template>
                                            <template v-else>{{ row.question }}</template>
                                        </template>
                                    </el-table-column>
                                    <el-table-column :label="Translate('IDCS_ANSWER')">
                                        <template #default="{ row }: TableColumn<SystemGuideQuestionForm>">
                                            <template v-if="!isDefeultQuestion || (isDefeultQuestion && !row.answer)">******</template>
                                            <template v-else>{{ row.answer }}</template>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        v-if="!isDefeultQuestion"
                                        :label="Translate('IDCS_DELETE')"
                                    >
                                        <template #default="{ $index }: TableColumn<SystemGuideQuestionForm>">
                                            <BaseImgSpriteBtn
                                                file="del"
                                                @click="deleteQuestion($index)"
                                            />
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="handlePrev">{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button>
                    <el-button @click="handleNext">{{ Translate('IDCS_DONE') }}</el-button>
                </div>
            </div>
            <!-- 磁盘（将“激活向导”中的磁盘配置转移到“开机向导”中（web只有激活向导，没有开机向导，所以直接隐藏磁盘配置）） -->
            <div
                v-show="pageData.current === 'disk'"
                class="disk"
            >
                <div class="title">{{ Translate('IDCS_DISK_CONFIG') }}</div>
                <div class="box">
                    <el-table
                        v-title
                        :data="diskTableData"
                        show-overflow-tooltip
                        highlight-current-row
                        height="100%"
                    >
                        <el-table-column
                            :label="Translate('IDCS_DISK')"
                            prop="name"
                        />
                        <el-table-column
                            :label="Translate('IDCS_TYPE')"
                            prop="type"
                        />
                        <el-table-column
                            :label="Translate('IDCS_CAPACITY')"
                            prop="size"
                        />
                        <el-table-column
                            :label="Translate('IDCS_DISK_SERIAL_NUMBER')"
                            prop="serialNum"
                        />
                        <el-table-column
                            :label="Translate('IDCS_STATE')"
                            prop="combinedStatus"
                        />
                        <el-table-column>
                            <template #default="{ row, $index }: TableColumn<SystemGuideDiskList>">
                                <el-button
                                    :disabled="row.diskStatus !== 'bad'"
                                    @click="formatCurrentDisk($index)"
                                >
                                    {{ Translate('IDCS_FORMATTING') }}
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="handlePrev">{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button>
                    <el-button @click="handleNext">{{ Translate('IDCS_DONE') }}</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./Guide.v.ts"></script>

<style lang="scss" scoped>
.guide {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    .base-btn-box.padding {
        padding-inline: 20px;
    }
}

.content {
    position: relative;
    width: 744px;
    height: 522px;
    border: 1px solid var(--content-border);

    & > div {
        width: 100%;
        height: 100%;
    }
}

.box {
    display: flex;
    padding: 20px;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 100px);
}

.title {
    height: 40px;
    line-height: 40px;
    width: 100%;
    text-align: center;
    font-size: 20px;
    background-color: var(--primary);
    color: var(--btn-text);
}

.lang {
    .box {
        justify-content: space-between;

        & > div {
            width: 320px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .BaseListBox {
            height: 100%;
        }
    }

    &-title {
        width: 100%;
        line-height: 30px;
        height: 30px;
        text-align: center;
        background-color: var(--btn-bg);
        color: var(--btn-text);
        border: 1px solid var(--btn-bg);
    }
}

.privacy {
    :deep(.el-textarea__inner) {
        width: 100%;
        height: 100%;
        resize: none;
    }

    .el-checkbox {
        margin-right: 15px;
    }

    .base-btn-box {
        align-items: center;
    }
}

.date {
    .box {
        justify-content: center;
        align-items: center;
    }

    .el-form {
        width: 600px;
    }
}

.user {
    .box {
        justify-content: center;
    }

    .el-form {
        width: 600px;
    }

    &-title {
        width: 100%;
        text-align: center;
        margin-bottom: 10px;

        &::first-letter {
            text-transform: capitalize;
        }
    }
}

.chlConfig {
    .box {
        .base-chlConfig-tabs {
            width: 100%;
            height: 100%;

            :deep(.el-tabs__header) {
                background-color: var(--subheading-bg);
                padding: 0 14px;

                .el-tabs__nav-wrap::after,
                .el-tabs__active-bar {
                    display: none;
                }
            }

            :deep(.el-tabs__content) {
                padding: 4px 40px;
            }

            .ipc-password-tip {
                margin-top: 44px;
            }
        }
    }
}

.emailAndQa {
    .box {
        flex-direction: column;

        .base-emailAndQa-tabs {
            width: 100%;
            height: 100%;

            :deep(.el-tabs__header) {
                background-color: var(--subheading-bg);
                padding: 0 14px;

                .el-tabs__nav-wrap::after,
                .el-tabs__active-bar {
                    display: none;
                }
            }

            :deep(.el-tabs__content) {
                padding: 0 4px;
            }
        }
    }
}
</style>
