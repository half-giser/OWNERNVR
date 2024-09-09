<!-- eslint-disable prettier/prettier -->
<!--
 * @Description: 人脸识别——识别成功（0,1,2,3）/陌生人tab页
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:22:06
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-06 14:15:11
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
            <el-button @click="pageData.faceGroupPopOpen = true">{{ Translate('IDCS_MORE') }}</el-button>
            <el-checkbox
                v-model="pageData.selectAll"
                :style="{ margin: '0 30px 0 10px' }"
                @change="selectAllCheckChange"
                >{{ Translate('IDCS_ALL') }}</el-checkbox
            >
            <span>{{ pageData.faceGroupName }}</span>
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
        <el-form-item
            :label="Translate('IDCS_TEXT_PROMPT')"
            class="prompt"
        >
            <el-input v-model="taskData.hintword"></el-input>
        </el-form-item>
        <!-- 语音提示 -->
        <el-form-item
            v-if="supportAlarmAudioConfig"
            :label="Translate('IDCS_VOICE_PROMPT')"
            class="prompt"
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
    <!-- 常规联动 -->
    <div
        class="linkage_box"
        :style="{ marginLeft: '15px' }"
    >
        <el-checkbox
            v-model="normalParamCheckAll"
            class="normal_param_title"
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
    <div class="linkage_box">
        <div class="linkage_title">
            <span>{{ `${Translate('IDCS_RECORD')} ` }}</span>
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
    <div class="linkage_box">
        <div class="linkage_title">
            <span>{{ `${Translate('IDCS_ALARM_OUT')} ` }}</span>
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
    <div class="linkage_box">
        <div class="linkage_title">
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
        class="linkage_box"
        :style="{ width: '350px' }"
    >
        <div
            class="linkage_title"
            :style="{ width: '330px' }"
        >
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
    <!-- 人脸分组 -->
    <el-dialog
        v-model="pageData.faceGroupPopOpen"
        :title="Translate('IDCS_SELECT_GROUP')"
        align-center
        width="320"
        @open="openFaceGroupPop"
        @close="closeFaceGroupPop"
    >
        <el-table
            ref="faceGroupTableRef"
            :data="prop.faceGroupData"
            border
            stripe
            highlight-current-row
            height="300px"
            @row-click="handleRowClick"
            @selection-change="faceGroupSelect"
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
        <el-row>
            <el-col class="el-col-flex-end btnBox">
                <el-button @click="saveFaceGroup">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="closeFaceGroupPop">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
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
        :source-data="prop.recordList"
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
        :source-data="prop.alarmOutList"
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
        :source-data="prop.snapList"
        :linked-list="taskData.snap?.map((item) => item.value) || []"
        type="snap"
        @confirm="snapConfirm"
        @close="snapClose"
    >
    </BaseTransferDialog>
</template>

<script lang="ts" src="./FaceSuccessfulRecognition.v.ts"></script>

<style lang="scss" scoped>
// 联动方式下的盒子样式
.linkage_box {
    float: left;
    width: 250px;
    height: 300px;
    margin-right: 2px;
    border: 1px solid #888888;
    :deep(.el-checkbox) {
        width: 200px;
        height: 45px;
        padding-left: 10px;
        color: #000;
    }
    .normal_param_title {
        width: 230px;
        height: 25px;
        padding: 4px 10px;
        background: #d0d0d0;
    }
    .linkage_title {
        text-align: center;
        font-size: 15px;
        width: 230px;
        height: 25px;
        padding: 4px 10px;
        background: #d0d0d0;
    }
    :deep(.el-table) {
        width: 100%;
        height: 260px;
    }
    :deep(.el-table__cell) {
        padding: 3px;
        height: 46px;
        border-bottom: none;
    }
}
.btnBox {
    margin-top: 10px;
}
.prompt {
    display: inline-flex;
    width: 600px;
}
</style>
