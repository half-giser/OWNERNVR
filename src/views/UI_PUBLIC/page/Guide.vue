<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-18 09:33:05
 * @Description: 开机向导
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-26 16:31:32
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
                    <div>
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
                    <div>
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
                    <textarea
                        class="privacy-text"
                        readonly
                        :value="Translate('IDCS_PRIVACY_TEXT')"
                    ></textarea>
                </div>
                <div class="base-btn-box padding">
                    <el-checkbox v-model="privacyFormData.checked">{{ Translate('IDCS_PRIVACY_ALLOW') }}</el-checkbox>
                    <el-button
                        :disabled="!privacyFormData.checked"
                        @click="handleNext"
                        >{{ Translate('IDCS_OK') }}</el-button
                    >
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
                        label-position="left"
                        class="narrow"
                    >
                        <el-form-item :label="Translate('IDCS_TIME_ZONE')">
                            <el-select v-model="dateTimeFormData.timeZone">
                                <el-option
                                    v-for="(item, index) in pageData.timeZoneOption"
                                    :key="item.timeZone"
                                    :label="displayTimeZone(index)"
                                    :value="item.timeZone"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_SYSTEM_TIME')">
                            <el-date-picker
                                v-model="dateTimeFormData.systemTime"
                                :disabled="dateTimeFormData.syncType === 'NTP'"
                                :value-format="formatSystemTime"
                                :format="formatSystemTime"
                                :cell-class-name="handleCalendarCellHighLight"
                                clear-icon=""
                                type="datetime"
                                :placeholder="Translate('IDCS_SYSTEM_TIME')"
                                @visible-change="pendingSystemTimeChange"
                                @change="handleSystemTimeChange"
                            />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_DATE_FORMAT')">
                            <el-select v-model="dateTimeFormData.dateFormat">
                                <el-option
                                    v-for="item in pageData.dateFormatOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                            <el-select v-model="dateTimeFormData.timeFormat">
                                <el-option
                                    v-for="item in pageData.timeFormatOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_DST')">
                            <el-checkbox
                                v-model="dateTimeFormData.enableDST"
                                :disabled="isDSTDisabled"
                                >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                            >
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_SYNC_WAY')">
                            <el-select v-model="dateTimeFormData.syncType">
                                <el-option
                                    v-for="item in pageData.syncTypeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_TIME_SERVER')">
                            <el-select
                                v-model="dateTimeFormData.timeServer"
                                filterable
                            >
                                <el-option
                                    v-for="item in pageData.timeServerOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_VIDEO_FORMAT')">
                            <el-select v-model="dateTimeFormData.videoType">
                                <el-option
                                    v-for="item in pageData.videoTypeOptions"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
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
                        label-position="left"
                        class="narrow"
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
                            <el-input
                                v-model="userFormData.password"
                                type="password"
                                autocomplete="new-password"
                                maxlength="16"
                                @paste.capture.prevent=""
                                @copy.capture.prevent=""
                            />
                        </el-form-item>
                        <el-form-item>
                            <BasePasswordStrength :strength="passwordStrength" />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_CONFIRM_NEW_PASSWORD')">
                            <el-input
                                v-model="userFormData.confirmPassword"
                                type="password"
                                autocomplete="new-password"
                                maxlength="16"
                                @paste.capture.prevent=""
                                @copy.capture.prevent=""
                            />
                        </el-form-item>
                        <el-form-item>
                            <el-text>{{ pageData.passwordNoticeMsg }}</el-text>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="base-btn-box padding">
                    <el-button
                        v-show="steps.indexOf('user') > 0"
                        @click="handlePrev"
                        >{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button
                    >
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- 创建问题答案 -->
            <div
                v-show="pageData.current === 'questionAndAnswer'"
                class="qa"
            >
                <div class="title">{{ Translate('IDCS_WIZARD') }}</div>
                <div class="box">
                    <el-form
                        label-position="left"
                        class="narrow inline-message"
                        :style="{
                            '--form-input-width': '340px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_QUESTION')">
                            <el-input
                                v-if="!isDefeultQuestion"
                                v-model="qaFormData.question"
                            />
                            <el-select
                                v-else
                                v-model="qaFormData.id"
                                @change="changeQuestion"
                            >
                                <el-option
                                    v-for="item in pageData.questionOptions"
                                    :key="item.id"
                                    :label="item.question"
                                    :value="item.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_ANSWER')">
                            <el-input v-model="qaFormData.answer" />
                            <el-button @click="addQuestion">{{ isDefeultQuestion ? Translate('IDCS_APPLY') : Translate('IDCS_ADD') }}</el-button>
                        </el-form-item>
                    </el-form>
                    <div class="base-table-box">
                        <el-table
                            :data="qaTableData"
                            border
                            stripe
                        >
                            <el-table-column
                                :label="Translate('IDCS_QUESTION')"
                                prop="question"
                            >
                            </el-table-column>
                            <el-table-column :label="Translate('IDCS_ANSWER')">
                                <template #default="scope">
                                    <template v-if="!isDefeultQuestion || (isDefeultQuestion && !scope.row.answer)">******</template>
                                    <template v-else>{{ scope.row.answer }}</template>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-if="!isDefeultQuestion"
                                :label="Translate('IDCS_DELETE')"
                            >
                                <template #default="scope">
                                    <BaseImgSprite
                                        file="del"
                                        :chunk="4"
                                        :index="0"
                                        :hover-index="1"
                                        :active-index="1"
                                        @click="deleteQuestion(scope.$index)"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
                <div class="base-btn-box padding">
                    <el-button @click="handlePrev">{{ Translate('IDCS_PREVIOUS_STEP') }}</el-button>
                    <el-button @click="handleNext">{{ Translate('IDCS_NEXT_STEP') }}</el-button>
                </div>
            </div>
            <!-- 磁盘 -->
            <div
                v-show="pageData.current === 'disk'"
                class="disk"
            >
                <div class="title">{{ Translate('IDCS_DISK_CONFIG') }}</div>
                <div class="box">
                    <el-table
                        :data="diskTableData"
                        border
                        stripe
                        height="100%"
                    >
                        <el-table-column
                            :label="Translate('IDCS_DISK')"
                            prop="name"
                        >
                        </el-table-column>

                        <el-table-column
                            :label="Translate('IDCS_TYPE')"
                            prop="combinedStatus"
                        >
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_CAPACITY')"
                            prop="size"
                        >
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_DISK_SERIAL_NUMBER')"
                            prop="serialNum"
                        >
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_STATE')"
                            prop="combinedStatus"
                        >
                        </el-table-column>
                        <el-table-column>
                            <template #default="scope">
                                <el-button
                                    :disabled="scope.row.diskStatus !== 'bad'"
                                    @click="formatCurrentDisk(scope.$index)"
                                    >{{ Translate('IDCS_FORMATTING') }}</el-button
                                >
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
    &-text {
        overflow: auto;
        width: 100%;
        resize: none;
        padding: 10px;
    }

    .el-checkbox {
        margin-right: 15px;
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

.qa {
    .box {
        flex-direction: column;
    }
}
</style>
