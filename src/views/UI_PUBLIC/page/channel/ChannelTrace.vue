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
                enable-ctrl
                enable-focus
                enable-iris
                enable-speed
                enable-zoom
                :min-speed="tableData[pageData.tableIndex]?.minSpeed || 1"
                :max-speed="tableData[pageData.tableIndex]?.maxSpeed || 1"
                :disabled="!tableData.length"
            />
            <el-form
                ref="formRef"
                v-title
                class="stripe"
                :rules
                :model="formData"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <BaseSelect
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
                        :persistent="true"
                        empty-text=""
                        :disabled="!chlOptions.length"
                        @change="changeChl"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ_TRACE')">
                    <BaseSelect
                        v-model="formData.traceIndex"
                        :options="traceOptions"
                        :props="{
                            label: 'index',
                        }"
                        :persistent="true"
                        empty-text=""
                        :disabled="!chlOptions.length"
                    />
                    <div
                        class="base-chl-icon-btn"
                        :class="{ disabled: !traceOptions.length }"
                        :title="Translate('IDCS_TRACK_PLAY')"
                    >
                        <BaseImgSpriteBtn
                            file="play"
                            :disabled="!traceOptions.length"
                            @click="playTrace"
                        />
                    </div>
                    <div
                        class="base-chl-icon-btn"
                        :class="{ disabled: !tableData.length }"
                        :title="Translate('IDCS_TRACK_STOP')"
                    >
                        <BaseImgSpriteBtn
                            file="stop"
                            :disabled="!tableData.length"
                            @click="stopTrace"
                        />
                    </div>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_TRACE_NAME')"
                    prop="name"
                >
                    <BaseTextInput
                        v-model="formData.name"
                        :disabled="!traceOptions.length"
                        :maxlength="tableData[pageData.tableIndex]?.nameMaxLen || 10"
                    />
                    <div
                        class="base-chl-icon-btn"
                        :class="{ disabled: !formData.name.trim() || !traceOptions.length }"
                        :title="Translate('IDCS_SAVE_CHANGE')"
                    >
                        <BaseImgSpriteBtn
                            file="save"
                            :disabled="!formData.name.trim() || !traceOptions.length"
                            @click="saveName"
                        />
                    </div>
                </el-form-item>
                <div class="base-btn-box">
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
                        v-show="pageData.recordTime >= 0 && pageData.recordTime < (tableData[pageData.tableIndex]?.traceMaxHoldTime || 180)"
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
            :data="pageData.addData"
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
