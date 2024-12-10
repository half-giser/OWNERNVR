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
                :style="{
                    '--form-label-width': '150px',
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
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_LOGO')">
                    <el-select-v2
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].switch"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        :options="pageData.switchOptions"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        disabled
                        :options="[]"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TRANSPARENCY')">
                    <el-slider
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].opacity"
                        :min="tableData[pageData.tableIndex].minOpacity"
                        :max="tableData[pageData.tableIndex].maxOpacity"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        show-input
                    />
                    <el-slider
                        v-else
                        disabled
                        show-input
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    highlight-current-row
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
                    <!-- 通道名 -->
                    <el-table-column
                        prop="chlName"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        show-overflow-tooltip
                    />
                    <!-- LOGO开关   -->
                    <el-table-column :label="Translate('IDCS_LOGO')">
                        <template #header>
                            <el-dropdown>
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
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select-v2
                                v-model="scope.row.switch"
                                :disabled="scope.row.disabled"
                                :options="pageData.switchOptions"
                            />
                        </template>
                    </el-table-column>
                    <!-- 透明度 -->
                    <el-table-column :label="Translate('IDCS_TRANSPARENCY')">
                        <template #default="scope">
                            <BaseNumberInput
                                v-model="scope.row.opacity"
                                :disabled="scope.row.disabled"
                                :min="scope.row.minOpacity"
                                :max="scope.row.maxOpacity"
                                @keydown.enter="handleKeydownEnter($event)"
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
