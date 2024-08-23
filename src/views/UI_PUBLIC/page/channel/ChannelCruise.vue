<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:35:06
 * @Description: 云台-巡航线
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 20:35:27
-->
<template>
    <div class="cruise">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
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
                <el-form-item :label="Translate('IDCS_CRUISE')">
                    <el-select
                        v-model="formData.cruiseIndex"
                        value-on-clear=""
                    >
                        <el-option
                            v-for="(item, index) in cruiseOptions"
                            :key="`${pageData.tableIndex}_${item.index}`"
                            :label="item.index"
                            :value="index"
                        />
                    </el-select>
                    <el-tooltip
                        :show-after="500"
                        :content="Translate('IDCS_START_CRUISE')"
                    >
                        <BaseImgSprite
                            class="icon-btn"
                            file="play"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!cruiseOptions.length"
                            @click="playCruise"
                        />
                    </el-tooltip>
                    <el-tooltip
                        :show-after="500"
                        :content="Translate('IDCS_STOP_CRUISE')"
                    >
                        <BaseImgSprite
                            class="icon-btn"
                            file="stop"
                            :index="0"
                            :hover-index="2"
                            :disabled-index="3"
                            :chunk="4"
                            :disabled="!tableData.length"
                            @click="stopCruise"
                        />
                    </el-tooltip>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CRUISE_NAME')">
                    <el-input
                        v-model="formData.name"
                        :disabled="!cruiseOptions.length"
                        spellcheck="false"
                        :maxlength="nameByteMaxLen"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
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
                            :disabled="!formData.name || !cruiseOptions.length"
                            @click="saveName"
                        />
                    </el-tooltip>
                </el-form-item>
            </el-form>
            <div class="base-table-box">
                <el-table
                    ref="presetTableRef"
                    :data="presetTableData"
                    border
                    stripe
                    highlight-current-row
                    @row-click="handlePresetRowClick"
                >
                    <el-table-column
                        :label="Translate('IDCS_PRESET_NAME')"
                        prop="name"
                    >
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_SPEED')"
                        prop="speed"
                    />
                    <el-table-column
                        :label="Translate('IDCS_TIME')"
                        prop="holdTime"
                    />
                    <el-table-column :label="Translate('IDCS_EDIT')">
                        <template #default="scope">
                            <BaseImgSprite
                                file="edit (2)"
                                :index="2"
                                :hover-index="0"
                                :disabled-index="3"
                                :chunk="4"
                                @click="editPreset(scope.$index)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_DELETE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="deleteAllPreset">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <BaseImgSprite
                                file="del"
                                :index="2"
                                :hover-index="0"
                                :disabled-index="3"
                                :chunk="4"
                                @click="deletePreset(scope.$index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <el-button
                        :disabled="!cruiseOptions.length"
                        @click="addPreset"
                        >{{ Translate('IDCS_ADD_PRESET') }}</el-button
                    >
                </div>
                <div>
                    <el-button
                        :disabled="!presetTableData.length || pageData.presetIndex === 0"
                        @click="moveUpPreset"
                        >{{ Translate('IDCS_UP') }}</el-button
                    >
                    <el-button
                        :disabled="!presetTableData.length || pageData.presetIndex === presetTableData.length - 1"
                        @click="moveDownPreset"
                        >{{ Translate('IDCS_DOWN') }}</el-button
                    >
                </div>
            </div>
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
                            {{ Translate('IDCS_CRUISE_NUM_D').formatForLang(scope.row.cruiseCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="scope">
                            <ChannelPtzTableExpandPanel @add="addCruise(scope.$index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in scope.row.cruise"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="cruise"
                                    @delete="deleteCruise(scope.$index, index)"
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
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelCruise.v.ts"></script>

<style lang="scss" scoped>
.cruise {
    width: 100%;
    height: var(--content-height);
    display: flex;
}

.left {
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.player {
    width: 400px;
    height: 300px;
    flex-shrink: 0;
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
</style>
