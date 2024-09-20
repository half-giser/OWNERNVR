<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-13 11:31:56
 * @Description: 过线检测邮件设置弹窗
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-14 11:43:40
-->
<template>
    <el-dialog
        draggable
        center
        width="600px"
        :close-on-click-modal="false"
        @close="close"
        @open="open"
    >
        <!-- 添加收件人对话框 -->
        <el-dialog
            v-model="pageData.popOpen"
            draggable
            center
            top="300px"
            :close-on-click-modal="false"
            :append-to-body="true"
            class="addEmailPop"
            width="450px"
        >
            <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-position="left"
                :style="{
                    paddingBottom: '10px',
                }"
            >
                <el-form-item
                    class="form_item"
                    label-width="150px"
                    :label="Translate('IDCS_EMAIL_ADDRESS')"
                    prop="address"
                    :style="{
                        '--form-input-width': '210px',
                        padding: '0px',
                    }"
                >
                    <el-input
                        v-model="formData.address"
                        size="small"
                    />
                    <template #error>
                        <div class="custom-error">
                            {{ error }}
                        </div>
                    </template>
                </el-form-item>
                <el-form-item
                    class="form_item"
                    label-width="150px"
                    :label="Translate('IDCS_SCHEDULE')"
                    prop="schedule"
                    :style="{
                        '--form-input-width': '210px',
                        padding: '0px',
                    }"
                >
                    <el-select
                        v-model="formData.schedule"
                        size="small"
                        :options="pageData.scheduleList"
                    >
                        <el-option
                            v-for="item in pageData.scheduleList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-row class="base-btn-box">
                <el-button
                    class="dialog_btn"
                    @click="handleAddReceiver"
                >
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button
                    class="dialog_btn"
                    @click="pageData.popOpen = false"
                >
                    {{ Translate('IDCS_CANCEL') }}
                </el-button>
            </el-row>
        </el-dialog>
        <div class="main">
            <div>
                <el-divider direction="vertical"></el-divider>
                <span>{{ Translate('IDCS_VIDEO_SAVE_PIC') }}</span>
            </div>
            <div class="row_container">
                <el-checkbox v-model="pageData.data.saveSourcePicture">{{ Translate('IDCS_SMART_SAVE_SOURCE_PIC') }}</el-checkbox>
                <el-checkbox v-model="pageData.data.saveTargetPicture">{{ Translate('IDCS_SMART_SAVE_TARGET_PIC') }}</el-checkbox>
            </div>
            <div>
                <el-divider direction="vertical"></el-divider>
                <span>{{ Translate('IDCS_SEND_EMAIL') }}</span>
            </div>
            <div class="row_container">
                <el-checkbox v-model="pageData.data.sendEmailData.enableSwitch">{{ Translate('IDCS_ENABLE') }}</el-checkbox>
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
                        >{{ Translate('IDCS_DAILY_REPORT') }}</el-checkbox
                    >
                    <!-- 周报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.weeklyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        class="inBoxCheckBox"
                        >{{ Translate('IDCS_WEEKLY_REPORT') }}</el-checkbox
                    >
                    <!-- 周几 -->
                    <el-select
                        v-model="pageData.data.sendEmailData.weeklyReportDate"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.weeklyReportSwitch : true"
                        value-key="value"
                        class="inputWidth"
                        :options="pageData.weekOption"
                        size="small"
                    >
                        <el-option
                            v-for="item in pageData.weekOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <!-- 月报 -->
                    <el-checkbox
                        v-model="pageData.data.sendEmailData.mouthlyReportSwitch"
                        :disabled="!pageData.data.sendEmailData.enableSwitch"
                        class="inBoxCheckBox"
                        >{{ Translate('IDCS_MONTHLY_REPORT') }}</el-checkbox
                    >
                    <!-- 几号 -->
                    <el-select
                        v-model="pageData.data.sendEmailData.mouthlyReportDate"
                        :disabled="pageData.data.sendEmailData.enableSwitch ? !pageData.data.sendEmailData.mouthlyReportSwitch : true"
                        value-key="value"
                        class="inputWidth"
                        :options="pageData.monthOption"
                        size="small"
                    >
                        <el-option
                            v-for="item in pageData.monthOption"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
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
                        size="small"
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
                        height="100px"
                        show-overflow-tooltip
                        :show-header="false"
                        class="table"
                        @row-click="handleRowClick($event)"
                    >
                        <el-table-column
                            prop="address"
                            width="170px"
                            :label="Translate('IDCS_RECIPIENT')"
                        >
                            <template #default="scope">
                                <span>{{ formatAddress(scope.row) }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="schedule"
                            width="140px"
                        >
                            <template #default="scope">
                                <el-select
                                    v-model="scope.row.schedule"
                                    prop="schedule"
                                    value-key="value"
                                    :options="pageData.scheduleList"
                                >
                                    <el-option
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    >
                                    </el-option>
                                </el-select>
                            </template>
                        </el-table-column>
                        <el-table-column
                            :label="Translate('IDCS_DELETE')"
                            width="70px"
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
            <el-row class="base-btn-box">
                <el-button
                    class="dialog_btn"
                    @click="close"
                >
                    {{ Translate('IDCS_CLOSE') }}
                </el-button>
            </el-row>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./passLineEmailPop.v.ts"></script>

<style lang="scss" scoped>
.el-divider--vertical {
    border-right-width: 3px;
    height: 30px;
    color: #999;
    width: 3px;
    margin: 0;
    border-left: 3px solid #999;
    padding-left: 5px;
}
.custom-error {
    color: red;
    /* 自定义错误提示的位置 */
    position: absolute;
    top: -20px; /* 调整错误提示的垂直位置 */
    left: 0;
    font-size: 13px;
}
.main {
    width: 100%;
    height: 100%;
    // display: flex;
    // flex-direction: column;
    color: black;
    .row_container {
        padding: 10px;
        .el-checkbox {
            color: black;
        }
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
        border: 1px solid #4a4848;
    }
    .contentWrap {
        margin-top: 15px;
        height: 23px;
        display: flex;
        align-items: center;
        border: 1px solid #999999;
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
        background-color: white;
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
    .dialog_btn {
        width: 80px;
        height: 25px;
        // margin-right: 10px;
    }
    .inputWidth {
        width: 100px;
    }
    .table {
        width: 420px;
    }
}
.addEmailPop {
    z-index: 999;
    height: 200px;
}
</style>
