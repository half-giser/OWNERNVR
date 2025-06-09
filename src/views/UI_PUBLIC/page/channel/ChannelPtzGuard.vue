<!--
 * @Date: 2025-05-06 09:11:58
 * @Description: 云台-看守位
 * @Author: yejiahao yejiahao@tvt.net.cn
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
                enable-ctrl
                enable-focus
                enable-iris
                enable-speed
                enable-zoom
                :min-speed="tableData[pageData.tableIndex]?.minSpeed || 1"
                :max-speed="tableData[pageData.tableIndex]?.maxSpeed || 1"
            />
            <el-form
                v-title
                class="stripe"
                :data="tableData"
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
                <el-form-item :label="Translate('IDCS_ENABLE')">
                    <BaseSelect
                        :model-value="tableData[pageData.tableIndex]?.enable || ''"
                        :disabled="!tableData[pageData.tableIndex] || tableData[pageData.tableIndex].disabled"
                        :options="pageData.switchOptions"
                        empty-text=""
                        @update:model-value="tableData[pageData.tableIndex].enable = $event"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_HOME_POSITION_TYPE')">
                    <BaseSelect
                        :model-value="tableData[pageData.tableIndex]?.location || ''"
                        :disabled="!tableData[pageData.tableIndex] || tableData[pageData.tableIndex].disabled"
                        :options="pageData.locationOptions"
                        empty-text=""
                        @update:model-value="tableData[pageData.tableIndex].location = $event"
                        @change="changeLocationPosition(tableData[pageData.tableIndex])"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NAME')">
                    <BaseSelect
                        :model-value="typeof tableData[pageData.tableIndex]?.number === 'number' ? tableData[pageData.tableIndex].number : ''"
                        :disabled="!tableData[pageData.tableIndex] || tableData[pageData.tableIndex].disabled"
                        :options="tableData[pageData.tableIndex] ? getNameOption(tableData[pageData.tableIndex]) : []"
                        empty-text=""
                        @update:model-value="tableData[pageData.tableIndex].number = $event"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WAITTING_TIME')">
                    <BaseNumberInput
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].waitTime"
                        :min="tableData[pageData.tableIndex].waitTimeMin"
                        :max="tableData[pageData.tableIndex].waitTimeMax"
                    />
                    <el-input
                        v-else
                        disabled
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    v-title
                    :data="tableData"
                    :border="false"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelFisheyeDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                    />
                    <el-table-column>
                        <template #header>
                            <BaseDropdown>
                                <BaseTableDropdownLink>{{ Translate('IDCS_ENABLE') }}</BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(opt, index) in pageData.switchOptions"
                                            :key="index"
                                            @click="changeAllEnabled(opt.value)"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </BaseDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelPtzGuardDto>">
                            <BaseSelect
                                v-if="row.disabled"
                                model-value=""
                                :options="[]"
                                disabled
                            />
                            <BaseSelect
                                v-else
                                v-model="row.enable"
                                :options="pageData.switchOptions"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column>
                        <template #header>
                            <BaseDropdown>
                                <BaseTableDropdownLink>{{ Translate('IDCS_HOME_POSITION') }}</BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.locationOptions"
                                            :key="opt.value"
                                            @click="changeAllLocationPosition(opt.value)"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </BaseDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelPtzGuardDto>">
                            <BaseSelect
                                v-if="row.disabled"
                                model-value=""
                                :options="[]"
                                disabled
                            />
                            <BaseSelect
                                v-else
                                v-model="row.location"
                                :options="pageData.locationOptions"
                                @change="changeLocationPosition(row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_NAME')">
                        <template #default="{ row }: TableColumn<ChannelPtzGuardDto>">
                            <BaseSelect
                                v-if="row.disabled"
                                model-value=""
                                :options="[]"
                                disabled
                            />
                            <BaseSelect
                                v-else
                                v-model="row.number"
                                :options="getNameOption(row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_WAITTING_TIME')">
                        <template #default="{ row }: TableColumn<ChannelPtzGuardDto>">
                            <el-input
                                v-if="row.disabled"
                                disabled
                            />
                            <BaseNumberInput
                                v-else
                                v-model="row.waitTime"
                                :min="row.waitTimeMin"
                                :max="row.waitTimeMax"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!editRows.size()"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelPtzGuard.v.ts"></script>
