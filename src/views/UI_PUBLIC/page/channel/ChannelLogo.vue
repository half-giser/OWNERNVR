<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-10-23 10:36:10
 * @Description: LOGO设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-23 19:19:36
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
                label-position="left"
                :style="{
                    '--form-label-width': '150px',
                }"
                class="inline-message"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        placeholder=""
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                    <el-select
                        v-else
                        disabled
                        placeholder=""
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_LOGO')">
                    <el-select
                        v-if="tableData.length"
                        v-model="tableData[pageData.tableIndex].switch"
                        :disabled="tableData[pageData.tableIndex].disabled"
                    >
                        <el-option
                            v-for="item in pageData.switchOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                    <el-select
                        v-else
                        placeholder=""
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TRANSPARENCY')">
                    <el-slider
                        v-if="tableData.length"
                        v-model="tableData[pageData.tableIndex].opacity"
                        :min="tableData[pageData.tableIndex].minOpacity"
                        :max="tableData[pageData.tableIndex].maxOpacity"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        show-input
                        :show-input-controls="false"
                    />
                    <el-slider
                        v-else
                        disabled
                        show-input
                        :show-input-controls="false"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :data="tableData"
                    border
                    stripe
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
                            <BaseTableRowStatus :icon="scope.row.status"></BaseTableRowStatus>
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
                            <el-dropdown trigger="click">
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_LOGO') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.switchOptions"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                            @click="changeAllSwitch(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.switch"
                                :disabled="scope.row.disabled"
                                :placeholder="Translate('IDCS_ON')"
                            >
                                <el-option
                                    v-for="item in pageData.switchOptions"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                >
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <!-- 透明度 -->
                    <el-table-column :label="Translate('IDCS_TRANSPARENCY')">
                        <template #default="scope">
                            <BaseNumberInput
                                v-model="scope.row.opacity"
                                value-on-clear="min"
                                :disabled="scope.row.disabled"
                                :min="scope.row.minOpacity"
                                :max="scope.row.maxOpacity"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
                    v-model:current-page="pageData.pageIndex"
                    v-model:page-size="pageData.pageSize"
                    :page-sizes="[10, 20, 30]"
                    layout="prev, pager, next, sizes, total, jumper"
                    :total="pageData.total"
                    size="small"
                    @size-change="getData"
                    @current-change="getData"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.btnDisabled"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelLogo.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>
