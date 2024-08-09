<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 16:36:16
 * @Description: 排程编辑弹框
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-08 17:16:23
-->
<template>
    <el-dialog
        draggable
        center
        width="1000px"
        :title="pageData.mainTitle"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @open="onOpen"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRule"
            label-position="left"
            inline-message
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <div class="base-subheading-box">
                <el-row>
                    <el-col :span="10">
                        <el-form-item
                            :label="Translate('IDCS_SCHEDULE_NAME')"
                            prop="name"
                        >
                            <el-input v-model="formData.name" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <el-radio-group
                            v-model="pageData.dragAction"
                            class="radio-group"
                        >
                            <el-radio value="del">{{ Translate('IDCS_ERASE') }}</el-radio>
                            <el-radio value="add">{{ Translate('IDCS_ADD') }}</el-radio>
                        </el-radio-group>
                    </el-col>
                    <el-col
                        :span="6"
                        :offset="4"
                    >
                        <div class="btn-panel">
                            <a
                                @click="manualTimeInputOpen"
                                v-text="Translate('IDCS_MANUAL_INPUT')"
                            ></a>
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
                            <div
                                v-show="pageData.manualTimeInputShow"
                                class="menaulTimeInputPL"
                                @click.stop
                            >
                                <div class="row">
                                    <el-time-picker
                                        v-model="pageData.manualTimeSpan"
                                        is-range
                                        range-separator="-"
                                        :clearable="false"
                                        format="HH:mm"
                                    />
                                </div>
                                <div class="row dayList">
                                    <el-checkbox-group v-model="pageData.weekdays">
                                        <template
                                            v-for="(cpItem, cpIndex) in scheduleWeekRef?.weekdayLang"
                                            :key="cpIndex"
                                        >
                                            <el-checkbox
                                                class="dayItem"
                                                :label="Translate(cpItem)"
                                                :value="cpIndex"
                                            />
                                        </template>
                                    </el-checkbox-group>
                                </div>
                                <div class="row">
                                    <el-button
                                        size="small"
                                        @click="manualTimeInputOk"
                                        >{{ Translate('IDCS_OK') }}</el-button
                                    >
                                    <el-button
                                        size="small"
                                        @click="manualTimeInputClose"
                                        >{{ Translate('IDCS_CANCEL') }}</el-button
                                    >
                                </div>
                            </div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <el-form-item prop="timespan">
                <BaseScheduleWeek
                    ref="scheduleWeekRef"
                    :width="950"
                    :drag-action="pageData.dragAction"
                ></BaseScheduleWeek>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ScheduleEditPop.v.ts"></script>

<style lang="scss" scoped>
.base-subheading-box {
    width: 950px;
    height: 38px;
    margin-bottom: 20px;

    :deep(.el-form-item__error--inline) {
        position: absolute;
        top: 33px;
        z-index: 1000;
    }
}

#n9web .el-form .el-form-item {
    padding: 3px 0px 0px 0px;
}
.btn-panel {
    position: relative;
    flex: 0 0 auto;
    font-size: 13px;
    float: right;
    margin-right: 20px;

    :deep(a) {
        margin-left: 15px;
        text-decoration: none;
        cursor: pointer;
        color: var(--text-timeline-button);

        &:hover {
            text-decoration: underline;
            color: var(--primary--04);
        }

        &.disabled {
            cursor: default;
            color: var(--text-disabled);
            text-decoration: none;
        }
    }
}
.menaulTimeInputPL {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 230px;
    top: 20px;
    right: 0px;
    padding: 2px;
    border-radius: 5px;
    border: solid 1px var(--border-color1);
    background-color: var(--bg-color5);
    z-index: 1000;

    .dayList {
        display: flex;
        flex-wrap: wrap;
        padding: 4px;

        .dayItem {
            flex: 0 0 60px;
            font-size: 13px;
            margin: 2px 10px 2px 0px;
            height: 20px;
        }
    }

    .row {
        display: flex;
        justify-content: end;
    }
}
</style>
