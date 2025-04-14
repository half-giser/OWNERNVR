<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:35:06
 * @Description: 云台-巡航线
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
            <el-form
                v-title
                :style="{
                    '--form-label-width': '100px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
                        @change="changeChl"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CRUISE')">
                    <el-select-v2
                        v-model="formData.cruiseIndex"
                        :options="cruiseOptions"
                        :props="{ label: 'index' }"
                    />
                    <el-tooltip :content="Translate('IDCS_START_CRUISE')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="play"
                                :disabled="!cruiseOptions.length"
                                @click="playCruise"
                            />
                        </div>
                    </el-tooltip>
                    <el-tooltip :content="Translate('IDCS_STOP_CRUISE')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="stop"
                                :disabled="!tableData.length"
                                @click="stopCruise"
                            />
                        </div>
                    </el-tooltip>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CRUISE_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!cruiseOptions.length"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                    <el-tooltip :content="Translate('IDCS_SAVE_CHANGE')">
                        <div class="base-chl-icon-btn">
                            <BaseImgSpriteBtn
                                file="save"
                                :disabled="!formData.name.trim() || !cruiseOptions.length"
                                @click="saveName"
                            />
                        </div>
                    </el-tooltip>
                </el-form-item>
            </el-form>
            <div class="base-table-box">
                <el-table
                    ref="presetTableRef"
                    v-title
                    :data="presetTableData"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handlePresetRowClick"
                >
                    <el-table-column
                        :label="Translate('IDCS_PRESET')"
                        prop="index"
                    />
                    <el-table-column
                        :label="Translate('IDCS_PRESET_NAME')"
                        prop="name"
                        width="92"
                    />
                    <el-table-column
                        :label="Translate('IDCS_SPEED')"
                        prop="speed"
                        width="60"
                    />
                    <el-table-column
                        :label="Translate('IDCS_TIME')"
                        prop="holdTime"
                        width="60"
                    />
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_EDIT') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="deleteAllPreset">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ $index }: TableColumn<ChannelPtzCruisePresetDto>">
                            <div class="base-cell-box">
                                <BaseImgSpriteBtn
                                    file="edit2"
                                    @click="editPreset($index)"
                                />
                                <BaseImgSpriteBtn
                                    file="del"
                                    @click="deletePreset($index)"
                                />
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box space-between">
                <el-button
                    :disabled="!cruiseOptions.length"
                    @click="addPreset"
                >
                    {{ Translate('IDCS_ADD_PRESET') }}
                </el-button>
                <div>
                    <el-button
                        :disabled="!presetTableData.length || pageData.presetIndex === 0"
                        @click="moveUpPreset"
                    >
                        {{ Translate('IDCS_UP') }}
                    </el-button>
                    <el-button
                        :disabled="!presetTableData.length || pageData.presetIndex === presetTableData.length - 1"
                        @click="moveDownPreset"
                    >
                        {{ Translate('IDCS_DOWN') }}
                    </el-button>
                </div>
            </div>
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
                    :border="false"
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="{ row }: TableColumn<ChannelPtzCruiseChlDto>">
                            {{ Translate('IDCS_CRUISE_NUM_D').formatForLang(row.cruiseCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="{ row, $index }: TableColumn<ChannelPtzCruiseChlDto>">
                            <ChannelPtzTableExpandPanel @add="addCruise($index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in row.cruise"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="cruise"
                                    @delete="deleteCruise($index, index)"
                                />
                            </ChannelPtzTableExpandPanel>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelCruiseEditPresetPop
            v-model="pageData.isPresetPop"
            :chl-id="tableData[pageData.tableIndex]?.chlId || ''"
            :type="pageData.presetType"
            :data="presetTableData[pageData.presetIndex] || undefined"
            @confirm="confirmChangePreset"
            @close="pageData.isPresetPop = false"
        />
        <ChannelCruiseAddPop
            v-model="pageData.isAddPop"
            :max="pageData.addCruiseMax"
            :cruise="pageData.addCruise"
            :chl-id="pageData.addChlId"
            @confirm="confirmAddCruise"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ChannelCruise.v.ts"></script>
