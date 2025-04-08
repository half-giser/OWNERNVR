<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-13 11:31:56
 * @Description: 过线检测邮件设置弹窗
-->
<template>
    <el-dialog
        width="600"
        @close="close"
        @open="open"
    >
        <!-- 添加收件人对话框 -->
        <el-dialog
            v-model="pageData.popOpen"
            draggable
            center
            append-to-body
            width="450"
            @closed="formRef?.resetFields()"
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
            >
                <el-form-item
                    :label="Translate('IDCS_EMAIL_ADDRESS')"
                    prop="address"
                >
                    <el-input v-model="formData.address" />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SCHEDULE')">
                    <el-select-v2
                        v-model="formData.schedule"
                        :options="pageData.scheduleList"
                    />
                </el-form-item>
            </el-form>
            <div class="base-btn-box collapse">
                <el-button @click="addReceiver">
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="pageData.popOpen = false">
                    {{ Translate('IDCS_CANCEL') }}
                </el-button>
            </div>
        </el-dialog>
        <el-form
            class="main"
            :style="{
                '--form-input-width': '100px',
            }"
        >
            <div class="base-ai-subheading">{{ Translate('IDCS_VIDEO_SAVE_PIC') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="pageData.data.saveSourcePicture"
                    :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                />
                <el-checkbox
                    v-model="pageData.data.saveTargetPicture"
                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                />
            </el-form-item>
            <div class="base-ai-subheading">{{ Translate('IDCS_SEND_EMAIL') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="pageData.data.sendEmailData.enableSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <div class="wrap">
                <div class="content">
                    <!-- 日报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.dailyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        :label="Translate('IDCS_DAILY_REPORT')"
                    />
                    <!-- 周报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.weeklyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        :label="Translate('IDCS_WEEKLY_REPORT')"
                    />
                    <!-- 周几 -->
                    <el-select-v2
                        v-model="pageData.data.sendEmailData.weeklyReportDate"
                        :options="pageData.weekOption"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.weeklyReportSwitch : true"
                    />
                    <!-- 月报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.mouthlyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        :label="Translate('IDCS_MONTHLY_REPORT')"
                    />
                    <!-- 几号 -->
                    <el-select-v2
                        v-model="pageData.data.sendEmailData.mouthlyReportDate"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.mouthlyReportSwitch : true"
                        :options="pageData.monthOption"
                    />
                </div>
                <span class="title">{{ Translate('IDCS_SEND_MODE') }}</span>
            </div>
            <div class="wrap">
                <div class="content">
                    <!-- timePicker -->
                    <el-time-picker
                        v-model="pageData.time"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        format="HH:mm"
                        value-format="HH:mm"
                        @change="handleTimePickerChange"
                    />
                </div>
                <span class="title">{{ Translate('IDCS_TIME') }}</span>
            </div>
            <div class="wrap">
                <div class="content receiver">
                    <!-- 收件人表 -->
                    <el-table
                        :data="pageData.data.receiverData"
                        height="100"
                        show-overflow-tooltip
                        :show-header="false"
                        class="table"
                        @row-click="handleRowClick($event)"
                    >
                        <el-table-column
                            width="170"
                            :label="Translate('IDCS_RECIPIENT')"
                        >
                            <template #default="{ row }: TableColumn<AlarmPassLinesEmailReceiverDto>">
                                {{ formatAddress(row) }}
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template #default="{ row }: TableColumn<AlarmPassLinesEmailReceiverDto>">
                                {{ formatSchedule(row) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_DELETE')"
                            width="70"
                        >
                            <template #default="{ row }: TableColumn<AlarmPassLinesEmailReceiverDto>">
                                <BaseImgSpriteBtn
                                    file="del"
                                    :disabled="!pageData.data.sendEmailData.enableSwitch"
                                    @click="delReceiver(row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                    <!-- 添加收件人 -->
                    <el-button
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        @click="pageData.popOpen = true"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                </div>
                <span class="title">{{ Translate('IDCS_RECIPIENT') }}</span>
            </div>
        </el-form>
        <div class="base-btn-box flex-start">
            {{ Translate('IDCS_TIMING_SEND_EMAIL_TIP') }}
        </div>
        <div class="base-btn-box collapse">
            <el-button @click="close">
                {{ Translate('IDCS_CLOSE') }}
            </el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PassLineEmailPop.v.ts"></script>

<style lang="scss" scoped>
.main {
    width: 100%;
    height: 100%;

    .wrap {
        position: relative;
        width: 100%;
        margin-top: 20px;
        padding: 0 15px;
        box-sizing: border-box;
        border: 1px solid var(--content-border);

        .el-checkbox {
            margin-left: 20px;
            margin-right: 0;

            &:first-child {
                margin-left: 0;
            }
        }
    }

    .content {
        margin-block: 15px;
        display: flex;
        align-items: center;
    }

    .receiver {
        align-items: flex-end;
        justify-content: space-between;
    }

    .title {
        position: absolute;
        left: 20px;
        top: -10px;
        padding: 0 5px;
        background-color: var(--dialog-bg);
    }

    .table {
        width: 420px;
    }
}
</style>
