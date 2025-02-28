<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:01
 * @Description: 云台-预置点
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
                @speed="setSpeed"
            />
            <el-form
                :style="{
                    '--form-label-width': '100px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="chlOptions.length"
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
                <el-form-item :label="Translate('IDCS_PRESET')">
                    <el-select-v2
                        v-model="formData.presetIndex"
                        :options="presetOptions"
                        :props="{
                            label: 'index',
                        }"
                        :height="170"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PRESET_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!presetOptions.length"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                    <el-tooltip :content="Translate('IDCS_SAVE_CHANGE')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="save"
                                :disabled="!formData.name.trim() || !presetOptions.length"
                                @click="saveName"
                            />
                        </div>
                    </el-tooltip>
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="!tableData.length"
                        @click="addPreset(pageData.tableIndex)"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                    <el-button
                        :disabled="!presetOptions.length"
                        @click="deletePreset(pageData.tableIndex, Number(formData.presetIndex))"
                    >
                        {{ Translate('IDCS_DELETE') }}
                    </el-button>
                    <el-button
                        :disabled="!presetOptions.length"
                        @click="savePosition"
                    >
                        {{ Translate('IDCS_SAVE_POSITION') }}
                    </el-button>
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
                    :border="false"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column :formatter="(row) => Translate('IDCS_PRESET_NUM_D').formatForLang(row.presetCount)" />
                    <el-table-column type="expand">
                        <template #default="{ row, $index }: TableColumn<ChannelPtzPresetChlDto>">
                            <ChannelPtzTableExpandPanel @add="addPreset($index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in row.presets"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="preset"
                                    @delete="deletePreset($index, index)"
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
    </div>
</template>

<script lang="ts" src="./ChannelPreset.v.ts"></script>
