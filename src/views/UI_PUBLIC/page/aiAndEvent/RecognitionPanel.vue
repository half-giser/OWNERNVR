<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:22:06
 * @Description: 人脸识别——识别成功（0,1,2,3）/陌生人tab页
-->
<template>
    <!-- 人脸识别——识别成功 -->
    <el-form
        :style="{
            '--form-input-width': '215px',
        }"
    >
        <!-- 人脸分组 -->
        <el-form-item
            v-if="taskData.ruleType === 'hit'"
            :label="Translate('IDCS_FACE_LIBRARY_GROUP')"
        >
            <el-button @click="pageData.groupPopOpen = true">{{ Translate('IDCS_MORE') }}</el-button>
            <el-checkbox
                v-model="pageData.selectAll"
                :label="Translate('IDCS_ALL')"
                @change="selectAllCheckChange"
            />
            <span>{{ pageData.groupName }}</span>
        </el-form-item>
        <!-- 排程配置 -->
        <el-form-item :label="Translate('IDCS_SCHEDULE_CONFIG')">
            <el-select-v2
                v-model="taskData.schedule"
                :options="scheduleList"
            />
            <el-button @click="pageData.scheduleManagPopOpen = true">{{ Translate('IDCS_MANAGE') }}</el-button>
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
            <el-select-v2
                v-model="taskData.sysAudio"
                :options="voiceList"
            />
        </el-form-item>
        <!-- 启用报警输出脉冲 -->
        <el-form-item v-if="taskData.ruleType === 'hit'">
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
    </div>
    <!-- 人脸分组 -->
    <el-dialog
        v-model="pageData.groupPopOpen"
        :title="Translate('IDCS_SELECT_GROUP')"
        width="320"
        @open="openGroupPop"
        @close="closeGroupPop"
    >
        <el-table
            ref="groupTableRef"
            :data="groupData"
            highlight-current-row
            height="300"
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
        <div class="base-btn-box">
            <el-button @click="saveGroup">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="closeGroupPop">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
    <!-- 排程管理 -->
    <ScheduleManagPop
        v-model="pageData.scheduleManagPopOpen"
        @close="pageData.scheduleManagPopOpen = false"
    />
</template>

<script lang="ts" src="./RecognitionPanel.v.ts"></script>
