<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:01
 * @Description: 云台-预置点
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:51:43
-->
<template>
    <div class="preset">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <ChannelPtzCtrlPanel
                :chl-id="tableData[pageData.tableIndex]?.chlId || ''"
                @speed="setSpeed"
            />
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
                        max-height="200px"
                        popper-class="custom-select"
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
                <el-form-item :label="Translate('IDCS_PRESET')">
                    <el-select
                        v-model="formData.presetIndex"
                        value-on-clear=""
                    >
                        <el-option
                            v-for="(item, index) in presetOptions"
                            :key="`${pageData.tableIndex}_${item.index}`"
                            :label="item.index"
                            :value="index"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PRESET_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!presetOptions.length"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                        :maxlength="nameByteMaxLen"
                        spellcheck="false"
                    />
                    <el-tooltip
                        :content="Translate('IDCS_SAVE_CHANGE')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            class="save"
                            file="save"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!formData.name || !presetOptions.length"
                            @click="saveName"
                        />
                    </el-tooltip>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button @click="addPreset(pageData.tableIndex)">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button
                        :disabled="!presetOptions.length"
                        @click="deletePreset(pageData.tableIndex, Number(formData.presetIndex))"
                        >{{ Translate('IDCS_DELETE') }}</el-button
                    >
                    <el-button
                        :disabled="!presetOptions.length"
                        @click="savePosition"
                        >{{ Translate('IDCS_SAVE_POSITION') }}</el-button
                    >
                </div>
            </el-form>
        </div>
        <div class="right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="getRowKey"
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
                            {{ Translate('IDCS_PRESET_NUM_D').formatForLang(scope.row.presetCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="scope">
                            <ChannelPtzTableExpandPanel @add="addPreset(scope.$index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in scope.row.presets"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="preset"
                                    @delete="deletePreset(scope.$index, index)"
                                />
                            </ChannelPtzTableExpandPanel>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelPresetAddPop
            v-model="pageData.isAddPop"
            :max="pageData.addPresetMax"
            :presets="pageData.addPresets"
            :chl-id="pageData.addChlId"
            @confirm="confirmAddPreset"
            @close="pageData.isAddPop = false"
        />
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelPreset.v.ts"></script>

<style>
.custom-select {
    max-height: 180px;
    overflow-y: auto;
}
</style>

<style lang="scss" scoped>
.preset {
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

.save {
    flex-shrink: 0;
    background-color: var(--ptz-btn);
    border: 1px solid var(--ptz-btn);

    &:hover {
        background-color: var(--ptz-btn);
        border-color: var(--primary);
    }

    &.disabled {
        background-color: var(--ptz-btn-disabled);

        &:hover {
            border-color: var(--ptz-btn);
        }
    }
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
}
</style>
