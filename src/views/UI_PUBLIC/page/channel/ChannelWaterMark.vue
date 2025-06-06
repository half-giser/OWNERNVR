<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:53
 * @Description: 水印设置
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
                    <BaseSelect
                        v-model="pageData.currChlId"
                        :options="chlOptions"
                        :persistent="true"
                        @change="handleChlChange"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK')">
                    <BaseSelect
                        v-model="pageData.chlData.switch"
                        :disabled="pageData.switchDisabled"
                        :options="pageData.options"
                        :persistent="true"
                        @change="handleSwitchChange"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_INFORMATION')">
                    <el-input
                        v-model="pageData.chlData.customText"
                        :formatter="formatInput"
                        :parser="formatInput"
                        :disabled="pageData.switchDisabled"
                        maxlength="15"
                        @blur="handleCustomTextInput(pageData.chlData.customText)"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    v-title
                    :data="pageData.chlList"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelWaterMarkDto>">
                            <BaseTableRowStatus :icon="row.status" />
                        </template>
                    </el-table-column>
                    <!-- 通道名 -->
                    <el-table-column
                        prop="chlName"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                    />
                    <!-- 水印开关   -->
                    <el-table-column>
                        <template #header>
                            <BaseDropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_WATER_MARK') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.options"
                                            :key="item.value"
                                            @click="handleSwitchChangeAll(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </BaseDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelWaterMarkDto>">
                            <BaseSelect
                                v-model="row.switch"
                                :disabled="row.disabled"
                                :placeholder="Translate('IDCS_ON')"
                                :options="pageData.options"
                                @change="handleTableSwitchChange(row)"
                            />
                        </template>
                    </el-table-column>
                    <!-- 信息 -->
                    <el-table-column
                        prop="customText"
                        :label="Translate('IDCS_INFORMATION')"
                    >
                        <template #header>
                            <BasePopover
                                v-model:visible="pageData.informationPop"
                                placement="bottom"
                                width="200"
                            >
                                <template #reference>
                                    <BaseTableDropdownLink>
                                        {{ Translate('IDCS_INFORMATION') }}
                                    </BaseTableDropdownLink>
                                </template>
                                <div>
                                    <el-input
                                        v-model="pageData.customTextSetAll"
                                        :formatter="formatInput"
                                        :parser="formatInput"
                                    />
                                    <div class="base-btn-box">
                                        <el-button @click="handleSetCustomTextAll(pageData.customTextSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                        <el-button @click="handleSetCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                    </div>
                                </div>
                            </BasePopover>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageData.pageIndex"
                    v-model:page-size="pageData.pageSize"
                    :total="pageData.totalCount"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!editRows.size()"
                    @click="handleApply"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelWaterMark.v.ts"></script>
