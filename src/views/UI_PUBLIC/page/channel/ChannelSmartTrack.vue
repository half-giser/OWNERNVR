<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:58:22
 * @Description: 云台-智能追踪
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 15:25:25
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                v-if="tableData.length"
                label-position="left"
                :style="{
                    '--form-label-width': '150px',
                }"
                class="inline-message"
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
                <el-form-item :label="Translate('IDCS_AUTO_TRACK_MODE')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].ptzControlMode"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in pageData.trackModeOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY')">
                    <el-checkbox
                        v-model="tableData[pageData.tableIndex].autoBackSwitch"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    ></el-checkbox>
                    <el-slider
                        v-model="tableData[pageData.tableIndex].autoBackTime"
                        :disabled="!tableData[pageData.tableIndex].autoBackSwitch || tableData[pageData.tableIndex].status !== 'success'"
                        :min="0"
                        :max="100"
                    ></el-slider>
                    <el-text class="time">{{ tableData[pageData.tableIndex].autoBackTime }}(s)</el-text>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    :data="tableData"
                    border
                    stripe
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus :icon="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                    />
                    <el-table-column :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY')">
                        <template #header>
                            <el-dropdown trigger="click">
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
                            <el-select
                                v-model="scope.row.autoBackSwitch"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in pageData.autoBackOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_HOMING_AFTER_TARGET_STATIONARY_TIME')">
                        <template #default="scope">
                            <el-input-number
                                v-model="scope.row.autoBackTime"
                                :min="0"
                                :max="100"
                                :disabled="!scope.row.autoBackSwitch || scope.row.status !== 'success'"
                                value-on-clear="min"
                                :controls="false"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelSmartTrack.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>

<style lang="scss" scoped>
.time {
    width: 80px;
    text-align: center;
}
</style>
