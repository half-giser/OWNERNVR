<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:22:06
 * @Description: 人脸识别——识别成功（0,1,2,3）/陌生人tab页
-->
<template>
    <div>
        <!-- 人脸识别——识别成功 -->
        <el-form v-title>
            <!-- 人脸分组 -->
            <el-form-item v-if="taskData.ruleType === 'hit'">
                <el-form-item :label="Translate('IDCS_FACE_LIBRARY_GROUP')">
                    <el-button @click="pageData.isGroupPop = true">{{ Translate('IDCS_MORE') }}</el-button>
                    <el-checkbox
                        v-model="pageData.selectAll"
                        :label="Translate('IDCS_ALL')"
                        @change="toggleSelectAll"
                    />
                    <div
                        v-title
                        class="text-ellipsis"
                    >
                        {{ groupName }}
                    </div>
                </el-form-item>
                <el-form-item />
            </el-form-item>
            <!-- 车牌分组 -->
            <el-form-item v-if="taskData.ruleType === 'whitelist'">
                <el-form-item :label="Translate('IDCS_PLATE_LIBRARY_GROUP')">
                    <el-button @click="pageData.isGroupPop = true">{{ Translate('IDCS_MORE') }}</el-button>
                    <el-checkbox
                        v-model="pageData.selectAll"
                        :label="Translate('IDCS_ALL')"
                        @change="toggleSelectAll"
                    />
                    <div
                        v-title
                        class="text-ellipsis"
                    >
                        {{ groupName }}
                    </div>
                </el-form-item>
                <el-form-item />
            </el-form-item>
            <!-- 排程配置 -->
            <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
                <BaseScheduleSelect
                    v-model="taskData.schedule"
                    :options="scheduleList"
                    @edit="pageData.isSchedulePop = true"
                />
            </el-form-item>
            <!-- 文字提示 -->
            <el-form-item :label="Translate('IDCS_TEXT_PROMPT')">
                <el-input v-model="taskData.hintword" />
            </el-form-item>
            <!-- 语音提示 -->
            <el-form-item
                v-if="supportAlarmAudioConfig"
                :label="Translate('IDCS_VOICE_PROMPT')"
            >
                <BaseSelect
                    v-model="taskData.sysAudio"
                    :options="voiceList"
                />
            </el-form-item>
            <!-- 启用报警输出脉冲 -->
            <el-form-item v-if="taskData.ruleType === 'hit' || taskData.ruleType === 'whitelist'">
                <el-checkbox
                    v-model="taskData.pluseSwitch"
                    :label="Translate('IDCS_ENABLE_ALARM_OUTPUT')"
                />
            </el-form-item>
        </el-form>
        <div class="base-ai-linkage-content">
            <!-- 常规联动 -->
            <AlarmBaseTriggerSelector
                v-model="taskData.trigger"
                :include="['msgPushSwitch', 'buzzerSwitch', 'popVideoSwitch', 'emailSwitch', 'popMsgSwitch']"
            />
            <!-- 录像 -->
            <AlarmBaseRecordSelector v-model="taskData.record" />
            <!-- 报警输出 -->
            <AlarmBaseAlarmOutSelector v-model="taskData.alarmOut" />
            <!-- 抓图 -->
            <AlarmBaseSnapSelector v-model="taskData.snap" />
            <!-- 联动预置点 -->
            <AlarmBasePresetSelector v-model="taskData.preset" />
            <!-- Ip Speaker -->
            <AlarmBaseIPSpeakerSelector
                v-if="supportAlarmAudioConfig"
                v-model="taskData.ipSpeaker"
                :chl-id="chlId"
            />
        </div>
        <!-- 人脸分组 -->
        <BaseTableSelectPop
            v-model="pageData.isGroupPop"
            :title="Translate('IDCS_SELECT_GROUP')"
            :data="groupData"
            :current="pageData.groupSelection"
            :label-title="Translate('IDCS_GROUP_NAME')"
            value="guid"
            label="name"
            @confirm="saveGroup"
        />
        <!-- 排程管理 -->
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="pageData.isSchedulePop = false"
        />
    </div>
</template>

<script lang="ts" src="./RecognitionPanel.v.ts"></script>
