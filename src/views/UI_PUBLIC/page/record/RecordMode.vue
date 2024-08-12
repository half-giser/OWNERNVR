<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:44:13
 * @Description: 录像-模式配置
-->

<template>
    <div id="RecordModeView">
        <div class="base-subheading-box">{{ Translate('IDCS_RECORD_MODE') }}</div>

        <div class="subcontent-box">
            <el-row>
                <el-col :span="3">
                    {{ Translate('IDCS_MODE') }}
                </el-col>
                <el-col :span="3">
                    <el-select
                        v-model="formData.mode"
                        size="small"
                        @change="setData(false)"
                    >
                        <el-option
                            v-for="item in pageData.recModeTypeList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-col>
            </el-row>

            <div v-show="formData.mode === 'manually'">
                <div id="chlRecScheduleTb">
                    <span v-text="Translate('IDCS_SCHEDULE_OF_RECORD_SET')"></span>
                    <el-button
                        size="small"
                        @click="pageData.scheduleManagPopOpen = true"
                        >{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button
                    >
                </div>
                <el-table
                    stripe
                    border
                    :data="formData.recordScheduleList"
                    height="390"
                >
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="name"
                        width="190px"
                    />

                    <!-- 传感器录像排程 -->
                    <el-table-column width="210px">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_SENSOR_RECORD_SCHEDULE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'alarmRec')"
                                        >
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.alarmRec"
                                size="small"
                            >
                                <el-option
                                    v-for="opt in pageData.scheduleList"
                                    :key="opt.value"
                                    :label="Translate(opt.label)"
                                    :value="opt.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- 移动录像排程 -->
                    <el-table-column width="210px">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_MOTION_RECORD_SCHEDULE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'motionRec')"
                                        >
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.motionRec"
                                size="small"
                            >
                                <el-option
                                    v-for="opt in pageData.scheduleList"
                                    :key="opt.value"
                                    :label="Translate(opt.label)"
                                    :value="opt.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- AI录像排程 -->
                    <el-table-column width="210px">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_AI_RECORD_SCHEDULE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'intelligentRec')"
                                        >
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.intelligentRec"
                                size="small"
                            >
                                <el-option
                                    v-for="opt in pageData.scheduleList"
                                    :key="opt.value"
                                    :label="Translate(opt.label)"
                                    :value="opt.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- POS录像排程 -->
                    <el-table-column
                        v-if="supportPOS"
                        width="210px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_POS_RECORD_SCHEDULE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'posRec')"
                                        >
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.posRec"
                                size="small"
                            >
                                <el-option
                                    v-for="opt in pageData.scheduleList"
                                    :key="opt.value"
                                    :label="Translate(opt.label)"
                                    :value="opt.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <!-- 定时录像排程 -->
                    <el-table-column width="210px">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_TIME_RECORD_SCHEDULE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.scheduleList"
                                            :key="opt.value"
                                            @click="changeAllSchedule(opt.value, 'scheduleRec')"
                                        >
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.scheduleRec"
                                size="small"
                            >
                                <el-option
                                    v-for="opt in pageData.scheduleList"
                                    :key="opt.value"
                                    :label="Translate(opt.label)"
                                    :value="opt.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div v-show="formData.mode === 'auto'">
                <el-radio-group
                    v-model="formData.autoModeId"
                    class="radio-group"
                >
                    <el-radio
                        v-for="item in recAutoModeList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.text"
                    />
                </el-radio-group>
                <el-button
                    id="btnAdvance"
                    @click="pageData.advancePopOpen = true"
                    >{{ Translate('IDCS_ADVANCED') }}</el-button
                >
            </div>
        </div>

        <div class="base-subheading-box">{{ Translate('IDCS_MANUAL_RECORD_OPTION') }}</div>

        <div class="subcontent-box">
            <el-row>
                <el-col :span="3">
                    {{ Translate('IDCS_MANUAL_RECORD_OPTION') }}
                </el-col>
                <el-col :span="3">
                    <el-select
                        v-model="formData.urgencyRecDuration"
                        size="small"
                    >
                        <el-option
                            v-for="item in pageData.urgencyRecDurationList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-col>
            </el-row>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="setData(true)"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>

        <!-- 高级模式事件选择弹窗 -->
        <RecordModeAdvancePop
            v-model="pageData.advancePopOpen"
            :advance-rec-modes="pageData.advanceRecModes"
            @confirm="advancePopConfirm"
            @close="pageData.advancePopOpen = false"
        ></RecordModeAdvancePop>

        <!-- 录像模式码流参数设置弹窗 -->
        <RecordModeStreamPop
            v-model="pageData.recModeStreamPopOpen"
            :advance-rec-mode-map="advanceRecModeMap"
            :auto-mode-id="formData.autoModeId"
            @close="streamPopClose"
        >
        </RecordModeStreamPop>

        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="pageData.scheduleManagPopOpen = false"
        >
        </ScheduleManagPop>
    </div>
</template>

<script lang="ts" src="./RecordMode.v.ts"></script>

<style lang="scss" scoped>
.subcontent-box {
    padding: 10px 0px 30px 15px;
    font-size: 15px;
    .el-radio {
        --el-radio-font-size: 15px;
        color: unset;
    }
}

#chlRecScheduleTb {
    height: 30px;
    padding: 20px 0px 5px 0px;
    > span {
        float: left;
        font-size: 20px;
    }

    > button {
        float: right;
    }
}

.el-radio-group {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
    width: 100%;
    label {
        box-sizing: border-box;
        width: 100%;
        height: 40px;
        padding: 0px 0px 0px 30px;
    }

    label.el-radio:nth-child(odd) {
        background-color: unset;
    }

    label.el-radio:nth-child(even) {
        background-color: var(--bg-color5);
    }
}

#btnAdvance {
    margin: 5px 0px 0px 30px;
}
</style>
