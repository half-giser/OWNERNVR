<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:44:13
 * @Description: 录像-模式配置
-->
<template>
    <div>
        <div class="base-head-box">{{ Translate('IDCS_RECORD_MODE') }}</div>
        <el-form v-title>
            <el-form-item :label="Translate('IDCS_MODE')">
                <el-select-v2
                    v-model="formData.mode"
                    :options="pageData.recModeTypeList"
                    @change="setData(false)"
                />
            </el-form-item>
        </el-form>
        <div class="mode">
            <div v-show="formData.mode === 'manually'">
                <div class="base-btn-box flex-start padding gap">
                    <span>{{ Translate('IDCS_SCHEDULE_CONFIG') }}</span>
                    <!-- <el-button @click="openSchedulePop">{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button> -->
                </div>
                <el-table
                    v-title
                    :data="tableData"
                    height="390"
                >
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="name"
                        min-width="190"
                        show-overflow-tooltip
                    />
                    <!-- 传感器录像排程 -->
                    <el-table-column v-if="!pageData.isSupportAllEvent">
                        <template #header>
                            <BaseScheduleTableDropdown
                                :label="Translate('IDCS_SENSOR_RECORD_SCHEDULE')"
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'alarmRec')"
                                @edit="openSchedulePop"
                            />
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.alarmRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                    <!-- 移动录像排程 -->
                    <el-table-column v-if="!pageData.isSupportAllEvent">
                        <template #header>
                            <BaseScheduleTableDropdown
                                :label="Translate('IDCS_MOTION_RECORD_SCHEDULE')"
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'motionRec')"
                                @edit="openSchedulePop"
                            />
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.motionRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                    <!-- AI录像排程 -->
                    <el-table-column v-if="!pageData.isSupportAllEvent || ipChlMaxCount === 0">
                        <template #header>
                            <BaseScheduleTableDropdown
                                :label="Translate('IDCS_AI_RECORD_SCHEDULE')"
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'intelligentRec')"
                                @edit="openSchedulePop"
                            />
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.intelligentRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                    <!-- POS录像排程 -->
                    <el-table-column v-if="!pageData.isSupportAllEvent && supportPOS">
                        <template #header>
                            <BaseScheduleTableDropdown
                                :label="Translate('IDCS_POS_RECORD_SCHEDULE')"
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'posRec')"
                                @edit="openSchedulePop"
                            />
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.posRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="pageData.isSupportAllEvent"
                        min-width="190"
                    >
                        <template #header>
                            <BaseScheduleTableDropdown
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'allEventRec')"
                                @edit="openSchedulePop"
                            >
                                <div class="base-cell-box">
                                    <span>{{ Translate('IDCS_ALL_EVENT_RECORD') }}</span>
                                    <BaseImgSprite
                                        file="aq"
                                        :index="1"
                                        :hover-index="0"
                                        :chunk="3"
                                        :title="allEventTips"
                                    />
                                </div>
                            </BaseScheduleTableDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.allEventRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                    <!-- 定时录像排程 -->
                    <el-table-column :min-width="pageData.isSupportAllEvent ? 190 : ''">
                        <template #header>
                            <BaseScheduleTableDropdown
                                :label="Translate('IDCS_TIME_RECORD_SCHEDULE')"
                                :options="pageData.scheduleList"
                                @change="changeAllSchedule($event, 'scheduleRec')"
                                @edit="openSchedulePop"
                            />
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <BaseScheduleSelect
                                v-model="row.scheduleRec"
                                :options="pageData.scheduleList"
                                @edit="openSchedulePop"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div v-show="formData.mode === 'auto'">
                <el-radio-group
                    v-if="pageData.showIcon"
                    v-model="formData.autoModeId"
                    class="line-break stripe"
                >
                    <el-radio
                        v-for="item in recAutoModeList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.text"
                    >
                        <div class="radio">
                            <div class="radio-text">{{ item.text }}</div>
                            <div class="radio-icon">
                                <BaseImgSprite
                                    v-for="(icon, index) in getIcons(item)"
                                    :key="index"
                                    :file="icon"
                                    :hover-index="0"
                                />
                            </div>
                        </div>
                    </el-radio>
                </el-radio-group>
                <el-radio-group
                    v-else
                    v-model="formData.autoModeId"
                    class="line-break stripe"
                >
                    <el-radio
                        v-for="item in recAutoModeList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.text"
                        :class="item.id === 'ALLEVENT' ? 'allevent' : ''"
                    >
                        <div class="radio">
                            <div class="radio-text">
                                <div class="radio-text-label">
                                    <span>{{ item.text }}</span>
                                    <BaseImgSprite
                                        v-if="item.id === 'ALLEVENT'"
                                        :key="item.id"
                                        file="aq"
                                        :index="1"
                                        :hover-index="0"
                                        :chunk="3"
                                        :title="allEventTips"
                                    />
                                </div>
                                <div
                                    v-if="item.id === 'ALLEVENT'"
                                    class="radio-text-discribe"
                                >
                                    {{ Translate('IDCS_ALL_EVENT_RECORD_LITE_TIP') }}
                                </div>
                            </div>
                        </div>
                    </el-radio>
                </el-radio-group>
                <div class="base-btn-box flex-start gap">
                    <el-button @click="pageData.isAdvancePop = true">{{ Translate('IDCS_ADVANCED') }}</el-button>
                </div>
            </div>
        </div>
        <div class="base-head-box">{{ Translate('IDCS_MANUAL_RECORD_OPTION') }}</div>
        <el-form v-title>
            <el-form-item :label="Translate('IDCS_MANUAL_RECORD_OPTION')">
                <el-select-v2
                    v-model="formData.urgencyRecDuration"
                    :options="pageData.urgencyRecDurationList"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="watchEdit.disabled.value && !watchRows.size()"
                @click="setData(true)"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <!-- 高级模式事件选择弹窗 -->
        <RecordModeAdvancePop
            v-model="pageData.isAdvancePop"
            :advance-rec-modes="pageData.advanceRecModes"
            :advance-rec-mode-id="pageData.advanceRecModeId"
            :advance-rec-mode-all-events="pageData.isSupportAllEvent"
            @confirm="confirmAdvancePop"
            @close="pageData.isAdvancePop = false"
        />
        <!-- 录像模式码流参数设置弹窗 -->
        <RecordModeStreamPop
            v-model="pageData.isRecModeStreamPop"
            :advance-rec-mode-map="advanceRecModeMap"
            :auto-mode-id="formData.autoModeId"
            @close="closeStreamPop"
        />
        <!-- 排程管理弹窗 -->
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="pageData.isSchedulePop = false"
        />
    </div>
</template>

<script lang="ts" src="./RecordMode.v.ts"></script>

<style lang="scss" scoped>
.el-radio.allevent {
    height: 46px !important;
}

.radio {
    display: flex;
    width: 100%;

    &-text {
        width: 600px;
        flex-shrink: 0;
        line-height: 15px;

        &-suffix {
            display: inline-block;
        }

        &-discribe {
            font-size: 12px;
            color: var(--main-text-light);
        }

        &-label {
            display: flex;
            align-items: center;
        }
    }

    &-icon {
        display: flex;

        .Sprite + .Sprite {
            margin-left: 20px;

            &::before {
                margin-left: -15px;
                content: '+';
            }
        }
    }
}

.mode {
    margin-bottom: 10px;
}
</style>
