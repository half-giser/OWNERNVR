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
                '--form-label-width': 'auto',
            }"
        >
            <el-form-item :label="Translate('IDCS_MODE')">
                <el-select
                    v-model="formData.mode"
                    @change="setData(false)"
                >
                    <el-option
                        v-for="item in pageData.recModeTypeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="subcontent-box">
            <div v-show="formData.mode === 'manually'">
                <div
                    class="base-btn-box"
                    span="2"
                >
                    <span class="chlRecScheduleTb">{{ Translate('IDCS_SCHEDULE_OF_RECORD_SET') }}</span>
                    <div>
                        <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button>
                    </div>
                </div>
                <el-table
                    stripe
                    border
                    :data="formData.recordScheduleList"
                    height="390"
                    show-overflow-tooltip
                >
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="name"
                        min-width="190"
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select v-model="scope.row.alarmRec">
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select v-model="scope.row.motionRec">
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select v-model="scope.row.intelligentRec">
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select v-model="scope.row.posRec">
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select v-model="scope.row.scheduleRec">
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
                        <div class="radio">{{ item.text }}</div>

                        <span
                            v-for="(icon, index) in pageData.icons[item.id]"
                            :key="index"
                        >
                            <span>&nbsp;</span>
                            <BaseImgSprite
                                :file="icon"
                                :index="0"
                                :hover-index="0"
                                :chunk="1"
                            />
                            <span v-if="index !== pageData.icons[item.id].length - 1">&nbsp;+</span>
                        </span>
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
                <div
                    class="base-btn-box"
                    span="start"
                >
                    <el-button @click="pageData.advancePopOpen = true">{{ Translate('IDCS_ADVANCED') }}</el-button>
                </div>
            </div>
        </div>
        <div class="base-subheading-box">{{ Translate('IDCS_MANUAL_RECORD_OPTION') }}</div>
        <el-form
            :style="{
                '--form-input-width': '250px',
                '--form-label-width': 'auto',
            }"
        >
            <el-form-item :label="Translate('IDCS_MANUAL_RECORD_OPTION')">
                <el-select v-model="formData.urgencyRecDuration">
                    <el-option
                        v-for="item in pageData.urgencyRecDurationList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </el-form-item>
        </el-form>
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
        />

        <!-- 录像模式码流参数设置弹窗 -->
        <RecordModeStreamPop
            v-model="pageData.recModeStreamPopOpen"
            :advance-rec-mode-map="advanceRecModeMap"
            :auto-mode-id="formData.autoModeId"
            @close="streamPopClose"
        />

        <!-- 排程管理弹窗 -->
        <ScheduleManagPop
            v-model="pageData.scheduleManagPopOpen"
            @close="pageData.scheduleManagPopOpen = false"
        />
    </div>
</template>

<script lang="ts" src="./RecordMode.v.ts"></script>

<style lang="scss" scoped>
.subcontent-box {
    padding: 0 0 30px 15px;
    font-size: 15px;

    .base-btn-box {
        margin-bottom: 10px;
    }
}

.chlRecScheduleTb {
    font-size: 20px;
}
</style>
