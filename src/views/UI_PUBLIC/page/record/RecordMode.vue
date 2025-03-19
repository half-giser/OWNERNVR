<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:44:13
 * @Description: 录像-模式配置
-->
<template>
    <div>
        <div class="base-subheading-box">{{ Translate('IDCS_RECORD_MODE') }}</div>
        <el-form
            :style="{
                '--form-input-width': '250px',
                '--form-label-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_MODE')">
                <el-select-v2
                    v-model="formData.mode"
                    :options="pageData.recModeTypeList"
                    @change="setData(false)"
                />
            </el-form-item>
        </el-form>
        <div class="subcontent-box">
            <div v-show="formData.mode === 'manually'">
                <div class="base-btn-box space-between">
                    <span class="chlRecScheduleTb">{{ Translate('IDCS_SCHEDULE_OF_RECORD_SET') }}</span>
                    <div>
                        <el-button @click="pageData.isSchedulePop = true">{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button>
                    </div>
                </div>
                <el-table
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
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_SENSOR_RECORD_SCHEDULE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'alarmRec')"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <el-select-v2
                                v-model="row.alarmRec"
                                :options="pageData.scheduleList"
                            />
                        </template>
                    </el-table-column>

                    <!-- 移动录像排程 -->
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_MOTION_RECORD_SCHEDULE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'motionRec')"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <el-select-v2
                                v-model="row.motionRec"
                                :options="pageData.scheduleList"
                            />
                        </template>
                    </el-table-column>

                    <!-- AI录像排程 -->
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_AI_RECORD_SCHEDULE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'intelligentRec')"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <el-select-v2
                                v-model="row.intelligentRec"
                                :options="pageData.scheduleList"
                            />
                        </template>
                    </el-table-column>

                    <!-- POS录像排程 -->
                    <el-table-column v-if="supportPOS">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_POS_RECORD_SCHEDULE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'posRec')"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <el-select-v2
                                v-model="row.posRec"
                                :options="pageData.scheduleList"
                            />
                        </template>
                    </el-table-column>

                    <!-- 定时录像排程 -->
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_TIME_RECORD_SCHEDULE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'scheduleRec')"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<RecordScheduleDto>">
                            <el-select-v2
                                v-model="row.scheduleRec"
                                :options="pageData.scheduleList"
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
                    />
                </el-radio-group>
                <div class="base-btn-box flex-start">
                    <el-button @click="pageData.isAdvancePop = true">{{ Translate('IDCS_ADVANCED') }}</el-button>
                </div>
            </div>
        </div>
        <div class="base-subheading-box">{{ Translate('IDCS_MANUAL_RECORD_OPTION') }}</div>
        <el-form
            :style="{
                '--form-input-width': '250px',
                '--form-label-width': '200px',
            }"
        >
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
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="pageData.isSchedulePop = false"
        />
    </div>
</template>

<script lang="ts" src="./RecordMode.v.ts"></script>

<style lang="scss" scoped>
.subcontent-box {
    padding: 0 0 30px;
    font-size: 15px;

    .base-btn-box {
        margin-bottom: 10px;
        padding: 0 15px;
        box-sizing: border-box;
    }
}

.radio {
    display: flex;
    width: 100%;
    line-height: 30px;

    &-text {
        width: 600px;
        flex-shrink: 0;
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

.chlRecScheduleTb {
    font-size: 20px;
}
</style>
