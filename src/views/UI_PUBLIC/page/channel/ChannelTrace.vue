<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:42
 * @Description: 云台-轨迹
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-21 11:49:39
-->
<template>
    <div class="trace">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <ChannelPtzCtrlPanel :chl-id="tableData[pageData.tableIndex]?.chlId || ''" />
            <el-form
                label-position="left"
                :style="{
                    '--form-label-width': '100px',
                }"
                class="narrow inline-message"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.tableIndex"
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ_TRACE')">
                    <el-select
                        v-model="formData.traceIndex"
                        value-on-clear=""
                    >
                        <el-option
                            v-for="(item, index) in traceOptions"
                            :key="`${pageData.tableIndex}_${item.index}`"
                            :label="item.index"
                            :value="index"
                        />
                    </el-select>
                    <el-tooltip
                        :show-after="500"
                        :content="Translate('IDCS_TRACK_PLAY')"
                    >
                        <BaseImgSprite
                            class="icon-btn"
                            file="play"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!traceOptions.length"
                            @click="playTrace"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :show-after="500"
                        :content="Translate('IDCS_TRACK_STOP')"
                    >
                        <BaseImgSprite
                            class="icon-btn"
                            file="stop"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!traceOptions.length"
                            @click="stopTrace"
                        />
                    </el-tooltip>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TRACE_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!traceOptions.length"
                        spellcheck="false"
                    />
                    <el-tooltip
                        :content="Translate('IDCS_SAVE_CHANGE')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            class="icon-btn"
                            file="save"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!formData.name || !traceOptions.length"
                            @click="saveName"
                        />
                    </el-tooltip>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button @click="addTrace(pageData.tableIndex)">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button
                        :disabled="!traceOptions.length"
                        @click="deleteTrace(pageData.tableIndex, Number(formData.traceIndex))"
                        >{{ Translate('IDCS_DELETE') }}</el-button
                    >
                    <el-button
                        v-show="!pageData.recordStatus"
                        :disabled="!traceOptions.length"
                        @click="startRecord"
                        >{{ Translate('IDCS_START_RECORD') }}</el-button
                    >
                    <el-button
                        v-show="pageData.recordStatus"
                        :disabled="!traceOptions.length"
                        @click="stopRecord"
                        >{{ Translate('IDCS_STOP_RECORD') }}</el-button
                    >
                    <p
                        v-show="pageData.recordTime >= 0 && pageData.recordTime < pageData.maxRecordTime"
                        class="seconds"
                    >
                        {{ pageData.recordTime }}
                    </p>
                </div>
            </el-form>
        </div>
        <div class="right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="(row) => row.chlId"
                    :expand-row-key="pageData.expandRowKey"
                    highlight-current-row
                    border
                    stripe
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="scope">
                            {{ Translate('IDCS_TRACE_NUM_D').formatForLang(scope.row.traceCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="scope">
                            <div class="expand">
                                <div
                                    v-for="(item, index) in scope.row.trace"
                                    :key="item.index"
                                    class="expand-item"
                                >
                                    <span>{{ item.index }}. {{ item.name }}</span>
                                    <BaseImgSprite
                                        file="delItem"
                                        class="expand-del"
                                        @click="deleteTrace(scope.$index, index)"
                                    />
                                </div>
                                <BaseImgSprite
                                    class="expand-add"
                                    file="addItem"
                                    :index="0"
                                    :disabled-index="1"
                                    :disabled="scope.row.trace.length >= scope.row.maxCount"
                                    :chunk="2"
                                    @click="addTrace(scope.$index)"
                                />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelTraceAddPop
            v-model="pageData.isAddPop"
            :max="pageData.addTraceMax"
            :trace="pageData.addTrace"
            :chl-id="pageData.addChlId"
            @confirm="confirmAddTrace"
            @close="pageData.isAddPop = false"
        />
        <BaseNotification v-model:notification="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelTrace.v.ts"></script>

<style lang="scss" scoped>
.trace {
    width: 100%;
    height: var(--content-height);
    display: flex;
}

.left {
    width: 400px;
}

.player {
    width: 400px;
    height: 300px;
}

.icon-btn {
    flex-shrink: 0;
    background-color: var(--bg-icon-btn);
    border: 1px solid var(--bg-icon-btn);

    &:hover {
        background-color: var(--bg-icon-btn);
        border-color: var(--primary--04);
    }

    &.disabled {
        background-color: var(--bg-icon-btn-disabled);

        &:hover {
            border-color: var(--bg-icon-btn);
        }
    }

    & + .icon-btn {
        margin-left: 5px;
    }
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
}

.seconds {
    margin: 0;
    width: 50px;
    text-align: center;
    color: var(--primary--04);
    font-size: 22px;
    line-height: 32px;
    padding-right: 10px;
    // font-size: ;
}

.expand {
    display: flex;
    flex-wrap: wrap;
    padding: 15px;

    &-item {
        width: 200px;
        padding-bottom: 15px;

        &:hover {
            .expand-del {
                opacity: 1;
            }
        }
    }

    &-del {
        opacity: 0;
        cursor: pointer;
        margin-left: 5px;
    }

    &-add {
        cursor: pointer;
    }
}
</style>
