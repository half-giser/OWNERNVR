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
                :enable-ctrl="tableData[pageData.tableIndex]?.supportPtz || tableData[pageData.tableIndex]?.supportIntegratedPtz || false"
                :enable-zoom="tableData[pageData.tableIndex]?.supportAZ || tableData[pageData.tableIndex]?.supportPtz || tableData[pageData.tableIndex]?.supportIntegratedPtz || false"
                :enable-focus="tableData[pageData.tableIndex]?.supportAZ || tableData[pageData.tableIndex]?.supportIntegratedPtz || false"
                :enable-iris="tableData[pageData.tableIndex]?.supportIris || tableData[pageData.tableIndex]?.supportIntegratedPtz || false"
                :enable-speed="tableData[pageData.tableIndex]?.supportPtz || tableData[pageData.tableIndex]?.supportIntegratedPtz || false"
                :min-speed="tableData[pageData.tableIndex]?.minSpeed || 1"
                :max-speed="tableData[pageData.tableIndex]?.maxSpeed || 1"
                @speed="setSpeed"
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
                        :disabled="!chlOptions.length"
                        empty-text=""
                        @change="changeChl"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PRESET')">
                    <BaseSelect
                        v-model="formData.presetIndex"
                        :options="presetOptions"
                        :props="{
                            label: 'index',
                        }"
                        empty-text=""
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_PRESET_NAME')"
                    prop="name"
                >
                    <BaseTextInput
                        v-model="formData.name"
                        :disabled="!presetOptions.length"
                        :maxlength="tableData[pageData.tableIndex]?.nameMaxByteLen || 63"
                    />
                    <el-tooltip :content="Translate('IDCS_SAVE_CHANGE')">
                        <div
                            class="base-chl-icon-btn"
                            :class="{ disabled: !formData.name.trim() || !presetOptions.length }"
                        >
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
                    v-title
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
            :data="pageData.addData"
            @confirm="confirmAddPreset"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ChannelPreset.v.ts"></script>
