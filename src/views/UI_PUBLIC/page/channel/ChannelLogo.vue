<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-23 10:36:10
 * @Description: LOGO设置
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
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
                        :persistent="true"
                        :disabled="!chlOptions.length"
                        empty-text=""
                        @change="changeChl"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_LOGO')">
                    <BaseSelect
                        :model-value="tableData[pageData.tableIndex]?.switch || ''"
                        :disabled="!tableData[pageData.tableIndex] || tableData[pageData.tableIndex].disabled"
                        :persistent="true"
                        empty-text=""
                        :options="pageData.switchOptions"
                        @update:model-value="tableData[pageData.tableIndex].switch = $event"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TRANSPARENCY')">
                    <BaseSliderInput
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].opacity"
                        :min="tableData[pageData.tableIndex].minOpacity"
                        :max="tableData[pageData.tableIndex].maxOpacity"
                        :disabled="!tableData[pageData.tableIndex] || tableData[pageData.tableIndex].disabled"
                    />
                    <BaseSliderInput
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
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelLogoSetDto>">
                            <BaseTableRowStatus :icon="row.status" />
                        </template>
                    </el-table-column>
                    <!-- 通道名 -->
                    <el-table-column
                        prop="chlName"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        show-overflow-tooltip
                    />
                    <!-- LOGO开关   -->
                    <el-table-column :label="Translate('IDCS_LOGO')">
                        <template #header>
                            <BaseDropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_LOGO') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.switchOptions"
                                            :key="item.value"
                                            @click="changeAllSwitch(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </BaseDropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelLogoSetDto>">
                            <BaseSelect
                                v-model="row.switch"
                                :disabled="row.disabled"
                                :options="pageData.switchOptions"
                            />
                        </template>
                    </el-table-column>
                    <!-- 透明度 -->
                    <el-table-column :label="Translate('IDCS_TRANSPARENCY')">
                        <template #default="{ row }: TableColumn<ChannelLogoSetDto>">
                            <BaseNumberInput
                                v-model="row.opacity"
                                :disabled="row.disabled"
                                :min="row.minOpacity"
                                :max="row.maxOpacity"
                                @keyup.enter="blurInput"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageData.pageIndex"
                    v-model:page-size="pageData.pageSize"
                    :total="pageData.total"
                    @size-change="getData"
                    @current-change="getData"
                />
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

<script lang="ts" src="./ChannelLogo.v.ts"></script>
