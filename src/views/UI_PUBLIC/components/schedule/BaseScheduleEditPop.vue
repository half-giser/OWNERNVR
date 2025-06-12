<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 16:36:16
 * @Description: 排程编辑弹框
-->
<template>
    <el-dialog
        width="1000"
        :title="pageData.mainTitle"
        destroy-on-close
        @open="onOpen"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <div class="base-btn-box space-between form">
                <el-form-item
                    :label="Translate('IDCS_SCHEDULE_NAME')"
                    prop="name"
                    class="form-panel"
                >
                    <el-input
                        v-model="formData.name"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                    <el-radio-group
                        v-model="pageData.dragAction"
                        class="radio-group"
                    >
                        <el-radio
                            value="add"
                            :label="Translate('IDCS_ADD')"
                        />
                        <el-radio
                            value="del"
                            :label="Translate('IDCS_ERASE')"
                        />
                    </el-radio-group>
                </el-form-item>
                <div class="btn-panel">
                    <BasePopover
                        v-model:visible="pageData.manualTimeInputShow"
                        width="250"
                    >
                        <template #reference>
                            <a v-text="Translate('IDCS_MANUAL_INPUT')"></a>
                        </template>
                        <div class="menaulTimeInputPL">
                            <div class="row">
                                <BaseTimePicker
                                    v-model="pageData.manualTimeSpan[0]"
                                    :range="[null, `${pageData.manualTimeSpan[1]}:00`]"
                                    unit="minute"
                                    :teleported="false"
                                />
                                <span class="splitter">--</span>
                                <BaseTimePicker
                                    v-model="pageData.manualTimeSpan[1]"
                                    :range="[`${pageData.manualTimeSpan[0]}:00`, null]"
                                    unit="minute"
                                    :teleported="false"
                                />
                            </div>
                            <div class="row dayList">
                                <el-checkbox-group
                                    v-model="pageData.weekdays"
                                    class="inline"
                                >
                                    <template
                                        v-for="(cpItem, cpIndex) in scheduleWeekRef?.weekdayLang"
                                        :key="cpIndex"
                                    >
                                        <el-checkbox
                                            :label="Translate(cpItem)"
                                            :value="cpIndex"
                                        />
                                    </template>
                                </el-checkbox-group>
                            </div>
                            <div class="base-btn-box">
                                <el-button @click="manualTimeInputOk">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="manualTimeInputClose">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </div>
                    </BasePopover>
                    <a
                        @click="scheduleWeekRef?.resetSameValue([['00:00', '23:59']])"
                        v-text="Translate('IDCS_SELECT_ALL')"
                    ></a>
                    <a
                        @click="scheduleWeekRef?.invert()"
                        v-text="Translate('IDCS_REVERSE_SELECT')"
                    ></a>
                    <a
                        @click="scheduleWeekRef?.resetSameValue([])"
                        v-text="Translate('IDCS_CLEAR')"
                    ></a>
                </div>
            </div>
            <el-form-item prop="timespan">
                <BaseScheduleWeek
                    ref="scheduleWeekRef"
                    :width="950"
                    :drag-action="pageData.dragAction"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close', true)">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BaseScheduleEditPop.v.ts"></script>

<style lang="scss" scoped>
.form {
    width: 950px;
    height: 38px;
    margin-bottom: 20px;
    padding: 0 10px;
    box-sizing: border-box;
    background-color: var(--schedule-form-bg);

    :deep(.el-form-item) {
        margin-bottom: 0;
    }

    #n9web & :deep(.el-radio) {
        --el-radio-text-color: var(--schedule-form-text);
    }
}

.radio-group {
    margin-left: 20px;
}

#n9web .el-form .el-form-item {
    padding: 3px 0 0;
}

.form-panel {
    :deep(.el-form-item__label) {
        color: var(--schedule-form-text) !important;
    }
}

.btn-panel {
    flex: 0 0 auto;
    font-size: 13px;

    a {
        margin-left: 15px;
        text-decoration: none;
        cursor: pointer;
        color: var(--schedule-form-btn);

        &:hover {
            text-decoration: underline;
            color: var(--primary);
        }

        &.disabled {
            cursor: default;
            color: var(--input-text-disabled);
            text-decoration: none;
        }
    }
}

.menaulTimeInputPL {
    display: flex;
    flex-direction: column;

    .row {
        display: flex;
        justify-content: end;
        margin-bottom: 5px;

        & > .splitter {
            flex-shrink: 0;
            margin: 0 8px;
        }
    }
}
</style>
