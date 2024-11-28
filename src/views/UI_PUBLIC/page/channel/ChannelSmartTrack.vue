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
            <el-form v-if="tableData.length">
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
                        v-if="tableData[pageData.tableIndex]"
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
                    <template v-if="tableData[pageData.tableIndex]">
                        <el-checkbox
                            v-model="tableData[pageData.tableIndex].autoBackSwitch"
                            :disabled="tableData[pageData.tableIndex].disabled"
                        />
                        <el-slider
                            v-model="tableData[pageData.tableIndex].autoBackTime"
                            :disabled="!tableData[pageData.tableIndex].autoBackSwitch || tableData[pageData.tableIndex].disabled"
                            :min="0"
                            :max="100"
                        />
                    </template>
                    <template v-else>
                        <el-checkbox disabled />
                        <el-slider disabled />
                    </template>
                    <el-text class="time">{{ tableData[pageData.tableIndex].autoBackTime }}(s)</el-text>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    :data="tableData"
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus :icon="scope.row.status" />
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
                        <template #default="scope">
                            <el-select-v2
                                v-model="scope.row.autoBackSwitch"
                                :options="pageData.autoBackOptions"
                                :disabled="scope.row.disabled"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY_TIME')">
                        <template #default="scope">
                            <BaseNumberInput
                                v-model="scope.row.autoBackTime"
                                :min="0"
                                :max="100"
                                :disabled="!scope.row.autoBackSwitch || scope.row.disabled"
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

<style lang="scss" scoped>
.time {
    width: 80px;
    text-align: center;
}
</style>
