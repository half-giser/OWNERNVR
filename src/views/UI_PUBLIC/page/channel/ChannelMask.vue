<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-16 17:39:53
 * @Description: 通道 - 视频遮挡配置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                    @message="notify"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="formData.disabled"
                    @click="editStatus = !editStatus"
                >
                    {{ editStatus ? Translate('IDCS_STOP_DRAW') : Translate('IDCS_DRAW_AREA') }}
                </el-button>
                <el-button
                    :disabled="formData.disabled"
                    @click="handleClearArea"
                >
                    {{ Translate('IDCS_CLEAR_AREA') }}
                </el-button>
            </div>
            <el-form
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-model="selectedChlId"
                        :options="chlOptions"
                        @change="handleChlSel"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_VIDEO_MASK')">
                    <el-select-v2
                        v-if="formData.isSpeco"
                        model-value=""
                        :options="[]"
                        disabled
                    />
                    <el-select-v2
                        v-else
                        v-model="formData.switch"
                        :disabled="formData.disabled"
                        :options="switchOptions"
                        @change="handleChangeSwitch"
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
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="180"
                    />
                    <el-table-column
                        :label="Translate('IDCS_VIDEO_MASK')"
                        min-width="180"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_WATER_MARK') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.value"
                                            @click="changeSwitchAll(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            <el-select-v2
                                v-if="!row.isSpeco"
                                v-model="row.switch"
                                :disabled="row.disabled"
                                :options="switchOptions"
                                @focus="handleRowClick(row)"
                                @change="handleChangeSwitch()"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_COLOR')"
                        min-width="120"
                    >
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            <span v-if="!row.isSpeco">{{ colorMap[row.color] }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!editRows.size()"
                    @click="save"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelMask.v.ts"></script>
