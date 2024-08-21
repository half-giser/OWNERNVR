<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:01
 * @Description: 云台-预置点
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-21 10:49:31
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
                            {{ Translate('IDCS_PRESET_NUM_D').formatForLang(scope.row.presetCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="scope">
                            <div class="expand">
                                <div
                                    v-for="(item, index) in scope.row.presets"
                                    :key="item.index"
                                    class="expand-item"
                                >
                                    <BaseImgSprite file="preset" />
                                    <span>{{ item.index }}. {{ item.name }}</span>
                                    <BaseImgSprite
                                        file="delItem"
                                        class="expand-del"
                                        @click="deletePreset(scope.$index, index)"
                                    />
                                </div>
                                <BaseImgSprite
                                    class="expand-add"
                                    file="addItem"
                                    :index="0"
                                    :disabled-index="1"
                                    :disabled="scope.row.presets.length >= scope.row.maxCount"
                                    :chunk="2"
                                    @click="addPreset(scope.$index)"
                                />
                            </div>
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
        <BaseNotification v-model:notification="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelPreset.v.ts"></script>

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
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
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
