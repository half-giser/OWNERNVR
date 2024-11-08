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
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                :style="{
                    '--form-input-width': '210px',
                }"
            >
                <el-form-item
                    :label="Translate('IDCS_EMAIL_ADDRESS')"
                    prop="address"
                >
                    <el-input v-model="formData.address" />
                    <template #error>
                        <div class="custom-error">
                            {{ error }}
                        </div>
                    </template>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_SCHEDULE')"
                    :style="{
                        '--form-input-width': '210px',
                    }"
                >
                    <el-select v-model="formData.schedule">
                        <el-option
                            v-for="item in pageData.scheduleList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="base-btn-box collapse">
                    <el-button @click="handleAddReceiver">
                        {{ Translate('IDCS_OK') }}
                    </el-button>
                    <el-button @click="pageData.popOpen = false">
                        {{ Translate('IDCS_CANCEL') }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <div class="main">
            <div class="base-ai-subheading">{{ Translate('IDCS_VIDEO_SAVE_PIC') }}</div>
            <div class="row_container">
                <el-checkbox
                    v-model="pageData.data.saveSourcePicture"
                    :label="Translate('IDCS_SMART_SAVE_SOURCE_PIC')"
                />
                <el-checkbox
                    v-model="pageData.data.saveTargetPicture"
                    :label="Translate('IDCS_SMART_SAVE_TARGET_PIC')"
                />
            </div>
            <div class="base-ai-subheading">{{ Translate('IDCS_SEND_EMAIL') }}</div>
            <div class="row_container">
                <el-checkbox
                    v-model="pageData.data.sendEmailData.enableSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </div>
            <div
                class="borderWrap"
                :style="{
                    marginTop: '0px',
                }"
            >
                <div class="contentWrap">
                    <!-- 日报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.dailyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        class="inBoxCheckBox"
                        :label="Translate('IDCS_DAILY_REPORT')"
                    />
                    <!-- 周报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.weeklyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        class="inBoxCheckBox"
                        :label="Translate('IDCS_WEEKLY_REPORT')"
                    />
                    <!-- 周几 -->
                    <el-select
                        v-model="pageData.data.sendEmailData.weeklyReportDate"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.weeklyReportSwitch : true"
                        value-key="value"
                        class="inputWidth"
                    >
                        <el-option
                            v-for="item in pageData.weekOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <!-- 月报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.mouthlyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        class="inBoxCheckBox"
                        :label="Translate('IDCS_MONTHLY_REPORT')"
                    />
                    <!-- 几号 -->
                    <el-select
                        v-model="pageData.data.sendEmailData.mouthlyReportDate"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.mouthlyReportSwitch : true"
                        value-key="value"
                        class="inputWidth"
                    >
                        <el-option
                            v-for="item in pageData.monthOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </div>
                <span class="borderTitle">{{ Translate('IDCS_SEND_MODE') }}</span>
            </div>
            <div class="borderWrap">
                <div class="contentWrap">
                    <!-- timePicker -->
                    <el-time-picker
                        v-model="pageData.time"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        format="HH:mm"
                        class="inputWidth"
                        value-format="HH:mm"
                        @change="handleTimePickerChange"
                    />
                </div>
                <span class="borderTitle">{{ Translate('IDCS_TIME') }}</span>
            </div>
            <div
                class="borderWrap"
                :style="{
                    height: '130px',
                }"
            >
                <div
                    class="contentWrap"
                    :style="{
                        height: '100px',
                    }"
                >
                    <!-- 收件人表 -->
                    <el-table
                        :data="pageData.data.receiverData"
                        stripe
                        border
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
                            <template #default="scope">
                                {{ formatAddress(scope.row) }}
                            </template>
                        </el-table-column>
                        <el-table-column width="140">
                            <template #default="scope">
                                <el-select v-model="scope.row.schedule">
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_DELETE')"
                            width="70"
                        >
                            <template #default="scope">
                                <BaseImgSprite
                                    file="del"
                                    :chunk="4"
                                    :index="0"
                                    :hover-index="1"
                                    :active-index="1"
                                    :disabled="pageData.data.receiverData.length === 1"
                                    @click="handleDelReceiver(scope.row)"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                    <!-- 添加收件人 -->
                    <el-button
                        class="addReceiver"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        @click="pageData.popOpen = true"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                </div>
                <span class="borderTitle">{{ Translate('IDCS_RECIPIENT') }}</span>
            </div>
            <div class="endRow_container">{{ Translate('IDCS_TIMING_SEND_EMAIL_TIP') }}</div>
        </div>
        <template #footer>
            <div class="base-btn-box collapse">
                <el-button @click="close">
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PassLinesEmailPop.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

<style lang="scss" scoped>
.custom-error {
    color: var(--color-error);
    /* 自定义错误提示的位置 */
    position: absolute;
    top: -20px; /* 调整错误提示的垂直位置 */
    left: 0;
    font-size: 13px;
}
.main {
    width: 100%;
    height: 100%;
    .row_container {
        padding: 10px;
    }
    .endRow_container {
        padding: 10px;
        margin-bottom: 32px;
    }
    .borderWrap {
        position: relative;
        width: 100%;
        height: 50px;
        margin-top: 20px;
        padding: 0 10px;
        box-sizing: border-box;
        border: 1px solid var(--content-border);
    }
    .contentWrap {
        margin-top: 15px;
        height: 23px;
        display: flex;
        align-items: center;
        .inBoxCheckBox:first-child {
            margin-left: 4px;
        }
        .inBoxCheckBox:nth-child(4) {
            margin-left: 9px;
        }
    }
    .inBoxCheckBox {
        margin-right: 20px;
    }
    .borderTitle {
        position: absolute;
        left: 20px;
        top: -10px;
        padding: 0 5px;
        background-color: var(--dialog-bg);
    }
    .disabled {
        background-color: transparent;
    }
    .addReceiver {
        width: 80px;
        height: 25px;
        position: absolute;
        bottom: 12px;
        right: 11px;
    }

    .inputWidth {
        width: 100px;
    }
    .table {
        width: 420px;
    }
}
</style>
