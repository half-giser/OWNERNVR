<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:42
 * @Description: 云台-轨迹
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="handlePlayerReady"
                />
            </div>
            <ChannelPtzCtrlPanel
                :chl-id="tableData[pageData.tableIndex]?.chlId || ''"
                :disabled="!tableData.length"
            />
            <el-form
                :style="{
                    '--form-label-width': '100px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        :height="170"
                        :options="chlOptions"
                        @change="changeChl"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ_TRACE')">
                    <el-select-v2
                        v-model="formData.traceIndex"
                        :options="traceOptions"
                        :props="{
                            label: 'index',
                        }"
                        :height="170"
                    />
                    <el-tooltip :content="Translate('IDCS_TRACK_PLAY')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="play"
                                :disabled="!traceOptions.length"
                                @click="playTrace"
                            />
                        </div>
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_TRACK_STOP')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="stop"
                                :disabled="!tableData.length"
                                @click="stopTrace"
                            />
                        </div>
                    </el-tooltip>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TRACE_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!traceOptions.length"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                    <el-tooltip :content="Translate('IDCS_SAVE_CHANGE')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="save"
                                :disabled="!formData.name.trim() || !traceOptions.length"
                                @click="saveName"
                            />
                        </div>
                    </el-tooltip>
                </el-form-item>
                <div class="base-btn-box padding">
                    <el-button
                        :disabled="!tableData.length"
                        @click="addTrace(pageData.tableIndex)"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                    <el-button
                        :disabled="!traceOptions.length"
                        @click="deleteTrace(pageData.tableIndex, Number(formData.traceIndex))"
                    >
                        {{ Translate('IDCS_DELETE') }}
                    </el-button>
                    <el-button
                        v-show="!pageData.recordStatus"
                        :disabled="!traceOptions.length"
                        @click="startRecord"
                    >
                        {{ Translate('IDCS_START_RECORD') }}
                    </el-button>
                    <el-button
                        v-show="pageData.recordStatus"
                        :disabled="!traceOptions.length"
                        @click="stopRecord"
                    >
                        {{ Translate('IDCS_STOP_RECORD') }}
                    </el-button>
                    <p
                        v-show="pageData.recordTime >= 0 && pageData.recordTime < pageData.maxRecordTime"
                        class="seconds"
                    >
                        {{ pageData.recordTime }}
                    </p>
                </div>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="getRowKey"
                    :expand-row-key="pageData.expandRowKey"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="{ row }: TableColumn<ChannelPtzTraceChlDto>">
                            {{ Translate('IDCS_TRACE_NUM_D').formatForLang(row.traceCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="{ row, $index }: TableColumn<ChannelPtzTraceChlDto>">
                            <ChannelPtzTableExpandPanel @add="addTrace($index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in row.trace"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    @delete="deleteTrace($index, index)"
                                />
                            </ChannelPtzTableExpandPanel>
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
    </div>
</template>

<script lang="ts" src="./ChannelTrace.v.ts"></script>

<style lang="scss" scoped>
.seconds {
    margin: 0;
    width: 50px;
    text-align: center;
    color: var(--primary);
    font-size: 22px;
    line-height: 32px;
    padding-right: 10px;
}
</style>
