<!--
 * @Description: 人脸识别——识别成功（0,1,2,3）/陌生人tab页
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:22:06
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-16 15:28:52
-->
<template>
    <!-- 人脸识别——识别成功 -->
    <el-form
        class="narrow"
        :style="{
            '--form-input-width': '215px',
        }"
        label-position="left"
        inline-message
    >
        <!-- 人脸分组 -->
        <el-form-item
            v-if="taskData.ruleType === 'hit'"
            :label="Translate('IDCS_FACE_LIBRARY_GROUP')"
        >
            <el-button @click="pageData.groupPopOpen = true">{{ Translate('IDCS_MORE') }}</el-button>
            <el-checkbox
                v-model="pageData.selectAll"
                :style="{ margin: '0 30px 0 10px' }"
                @change="selectAllCheckChange"
                >{{ Translate('IDCS_ALL') }}</el-checkbox
            >
            <span>{{ pageData.groupName }}</span>
        </el-form-item>
        <!-- 排程配置 -->
        <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
            <el-select v-model="taskData.schedule">
                <el-option
                    v-for="item in prop.scheduleList"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                >
                </el-option>
            </el-select>
            <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
        </el-form-item>
        <!-- 文字提示 -->
        <el-form-item :label="Translate('IDCS_TEXT_PROMPT')">
            <el-input v-model="taskData.hintword"></el-input>
        </el-form-item>
        <!-- 语音提示 -->
        <el-form-item
            v-if="supportAlarmAudioConfig"
            :label="Translate('IDCS_VOICE_PROMPT')"
        >
            <el-select v-model="taskData.sysAudio">
                <el-option
                    v-for="item in prop.voiceList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-option>
            </el-select>
        </el-form-item>
        <!-- 启用报警输出脉冲 -->
        <el-form-item v-if="taskData.ruleType === 'hit'">
            <el-checkbox v-model="taskData.pluseSwitch">{{ Translate('IDCS_ENABLE_ALARM_OUTPUT') }}</el-checkbox>
        </el-form-item>
    </el-form>
    <div class="base-ai-linkage-content">
        <!-- 常规联动 -->
        <div
            class="base-ai-linkage-box"
            :style="{ marginLeft: '15px' }"
        >
            <el-checkbox
                v-model="normalParamCheckAll"
                class="base-ai-linkage-title"
                @change="handleNormalParamCheckAll"
                >{{ Translate('IDCS_TRIGGER_NOMAL') }}</el-checkbox
            >
            <el-checkbox-group
                v-model="normalParamCheckList"
                @change="handleNormalParamCheck"
            >
                <el-checkbox
                    v-for="item in normalParamList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                >
                </el-checkbox>
            </el-checkbox-group>
        </div>
        <!-- 录像 -->
        <div class="base-ai-linkage-box">
            <div class="base-ai-linkage-title">
                <span>{{ Translate('IDCS_RECORD') }}</span>
                <el-button
                    size="small"
                    @click="pageData.recordIsShow = true"
                    >{{ Translate('IDCS_CONFIG') }}</el-button
                >
            </div>
            <el-table
                :data="taskData.record"
                empty-text=" "
                :show-header="false"
            >
                <el-table-column prop="label" />
            </el-table>
        </div>
        <!-- 报警输出 -->
        <div class="base-ai-linkage-box">
            <div class="base-ai-linkage-title">
                <span>{{ Translate('IDCS_ALARM_OUT') }}</span>
                <el-button
                    size="small"
                    @click="pageData.alarmOutIsShow = true"
                    >{{ Translate('IDCS_CONFIG') }}</el-button
                >
            </div>
            <el-table
                :data="taskData.alarmOut"
                empty-text=" "
                :show-header="false"
            >
                <el-table-column prop="label" />
            </el-table>
        </div>
        <!-- 抓图 -->
        <div class="base-ai-linkage-box">
            <div class="base-ai-linkage-title">
                <span>{{ `${Translate('IDCS_SNAP')} ` }}</span>
                <el-button
                    size="small"
                    @click="pageData.snapIsShow = true"
                    >{{ Translate('IDCS_CONFIG') }}</el-button
                >
            </div>
            <el-table
                :data="taskData.snap"
                empty-text=" "
                :show-header="false"
            >
                <el-table-column prop="label" />
            </el-table>
        </div>
        <!-- 联动预置点 -->
        <div
            class="base-ai-linkage-box"
            :style="{ width: '350px' }"
        >
            <div class="base-ai-linkage-title">
                <span>{{ Translate('IDCS_TRIGGER_ALARM_PRESET') }}</span>
            </div>
            <el-table
                stripe
                border
                :data="PresetTableData"
            >
                <el-table-column
                    prop="name"
                    width="180px"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                >
                </el-table-column>
                <el-table-column
                    width="170px"
                    :label="Translate('IDCS_PRESET_NAME')"
                >
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.preset.value"
                            size="small"
                            :empty-values="[undefined, null]"
                            @visible-change="getPresetById(scope.row)"
                            @change="presetChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.presetList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
    <!-- 人脸分组 -->
    <el-dialog
        v-model="pageData.groupPopOpen"
        :title="Translate('IDCS_SELECT_GROUP')"
        align-center
        width="320"
        @open="openGroupPop"
        @close="closeGroupPop"
    >
        <el-table
            ref="groupTableRef"
            :data="prop.groupData"
            border
            stripe
            highlight-current-row
            height="300px"
            @row-click="handleRowClick"
            @selection-change="groupSelect"
        >
            <el-table-column
                type="selection"
                prop="guid"
                width="50"
            />
            <el-table-column
                :label="Translate('IDCS_GROUP_NAME')"
                prop="name"
                width="228"
            />
        </el-table>
        <template #footer>
            <el-row>
                <el-col class="el-col-flex-end btnBox">
                    <el-button @click="saveGroup">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="closeGroupPop">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
    <!-- 排程管理 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="
            () => {
                pageData.scheduleManagPopOpen = false
            }
        "
    />
    <BaseTransferDialog
        v-model="pageData.recordIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_RECORD"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="prop.recordList || []"
        :linked-list="taskData.record?.map((item) => item.value) || []"
        type="record"
        @confirm="recordConfirm"
        @close="recordClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.alarmOutIsShow"
        header-title="IDCS_TRIGGER_ALARM_OUT"
        source-title="IDCS_ALARM_OUT"
        target-title="IDCS_TRIGGER_ALARM_OUT"
        :source-data="prop.alarmOutList || []"
        :linked-list="taskData.alarmOut?.map((item) => item.value) || []"
        type="alarmOut"
        @confirm="alarmOutConfirm"
        @close="alarmOutClose"
    >
    </BaseTransferDialog>
    <BaseTransferDialog
        v-model="pageData.snapIsShow"
        header-title="IDCS_TRIGGER_CHANNEL_SNAP"
        source-title="IDCS_CHANNEL"
        target-title="IDCS_CHANNEL_TRGGER"
        :source-data="prop.snapList || []"
        :linked-list="taskData.snap?.map((item) => item.value) || []"
        type="snap"
        @confirm="snapConfirm"
        @close="snapClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./SuccessfulRecognition.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
