<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:58:22
 * @Description: 云台-智能追踪
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
                class="stripe"
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
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_AUTO_TRACK_MODE')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="tableData[pageData.tableIndex].ptzControlMode"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        :options="pageData.trackModeOptions"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY')">
                    <template v-if="tableData.length">
                        <el-checkbox
                            v-model="tableData[pageData.tableIndex].autoBackSwitch"
                            :disabled="tableData[pageData.tableIndex].disabled"
                        />
                        <BaseSliderInput
                            v-model="tableData[pageData.tableIndex].autoBackTime"
                            :disabled="!tableData[pageData.tableIndex].autoBackSwitch || tableData[pageData.tableIndex].disabled"
                        />
                        <span class="time">(s)</span>
                    </template>
                    <template v-else>
                        <el-checkbox disabled />
                        <BaseSliderInput disabled />
                        <span class="time">(s)</span>
                    </template>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    v-title
                    :data="tableData"
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelPtzSmartTrackDto>">
                            <BaseTableRowStatus :icon="row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                        show-overflow-tooltip
                    />
                    <el-table-column :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY')">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.autoBackOptions"
                                            :key="item.label"
                                            @click="changeAllAutoBack(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelPtzSmartTrackDto>">
                            <el-select-v2
                                v-model="row.autoBackSwitch"
                                :options="pageData.autoBackOptions"
                                :disabled="row.disabled"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY_TIME')">
                        <template #default="{ row }: TableColumn<ChannelPtzSmartTrackDto>">
                            <BaseNumberInput
                                v-model="row.autoBackTime"
                                :max="100"
                                :disabled="!row.autoBackSwitch || row.disabled"
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

<script lang="ts" src="./ChannelSmartTrack.v.ts"></script>
