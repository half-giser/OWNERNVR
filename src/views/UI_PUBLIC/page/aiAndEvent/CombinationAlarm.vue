<!--
 * @Description: 普通事件——组合报警
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-22 16:04:47
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                highlight-current-row
                :data="tableData"
                @current-change="changeCombinedAlarmInfo"
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50"
                >
                    <template #default="scope">
                        <BaseTableRowStatus :icon="scope.row.status" />
                    </template>
                </el-table-column>

                <!-- 名称 -->
                <el-table-column
                    width="160"
                    :label="Translate('IDCS_NAME')"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.name"
                            maxlength="32"
                            @focus="focusName(scope.row.name)"
                            @blur="blurName(scope.row)"
                            @keyup.enter="keydownEnterName($event)"
                        />
                    </template>
                </el-table-column>

                <!-- 组合报警 -->
                <el-table-column
                    :label="Translate('IDCS_COMBINATION_ALARM')"
                    width="180"
                >
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.combinedAlarm.switch"
                                @change="switchCombinedAlarm(scope.row)"
                            />
                            <el-button
                                :disabled="!scope.row.combinedAlarm.switch"
                                @click="openCombinedAlarmPop(scope.row)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 录像 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseRecordPop
                            :visible="pageData.isRecordPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeRecord"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.record.switch"
                                @change="switchRecord(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.record.switch"
                                @click="openRecord(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 抓图 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseSnapPop
                            :visible="pageData.isSnapPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeSnap"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.snap.switch"
                                @change="switchSnap(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.snap.switch"
                                @click="openSnap(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 声音，supportAudio -->
                <el-table-column
                    v-if="pageData.supportAudio"
                    width="150"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_AUDIO') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'sysAudio')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.sysAudio"
                            :options="pageData.audioList"
                        />
                    </template>
                </el-table-column>

                <!-- 推送 -->
                <el-table-column width="150">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PUSH') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'msgPushSwitch')"
                                    >
                                        {{ Translate(item.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.msgPush"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>

                <!-- 报警输出 -->
                <el-table-column width="180">
                    <template #header>
                        <AlarmBaseAlarmOutPop
                            :visible="pageData.isAlarmOutPop"
                            :data="tableData"
                            :index="pageData.triggerDialogIndex"
                            @confirm="changeAlarmOut"
                        />
                    </template>
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.alarmOut.switch"
                                @change="switchAlarmOut(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.alarmOut.switch"
                                @click="openAlarmOut(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 预置点名称 -->
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    width="180"
                >
                    <template #default="scope">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="scope.row.preset.switch"
                                @change="switchPreset(scope.$index)"
                            />
                            <el-button
                                :disabled="!scope.row.preset.switch"
                                @click="openPreset(scope.$index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>

                <!-- 蜂鸣器 -->
                <el-table-column width="100">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BUZZER') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'buzzerSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.beeper"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>

                <!-- 视频弹出 -->
                <el-table-column width="125">
                    <template #header>
                        <el-dropdown max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoPopupChlList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'videoPopUp')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.popVideo.chl.value"
                            :options="pageData.videoPopupChlList"
                        />
                    </template>
                </el-table-column>

                <!-- 消息框弹出 -->
                <el-table-column width="170">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MESSAGEBOX_POPUP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'popMsgSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.msgBoxPopup"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>

                <!-- Email -->
                <el-table-column width="100">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>Email</BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchList"
                                        :key="item.value"
                                        @click="changeAllValue(item.value, 'emailSwitch')"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.email"
                            :options="pageData.switchList"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between">
            <div>{{ pageData.CombinedALarmInfo }}</div>
            <el-button
                :disabled="!editRows.size()"
                @click="setData()"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <!-- 预置点名称 -->
        <AlarmBasePresetPop
            v-model="pageData.isPresetPop"
            :data="tableData"
            :index="pageData.triggerDialogIndex"
            @confirm="changePreset"
        />
        <CombinationAlarmPop
            v-model="pageData.isCombinedAlarmPop"
            :linked-id="pageData.combinedAlarmLinkedId"
            :linked-list="pageData.combinedAlarmLinkedList"
            :curr-row-face-obj="pageData.currRowFaceObj"
            @confirm="confirmCombinedAlarm"
            @close="closeCombinedAlarmPop"
        />
    </div>
</template>

<script lang="ts" src="./CombinationAlarm.v.ts"></script>
