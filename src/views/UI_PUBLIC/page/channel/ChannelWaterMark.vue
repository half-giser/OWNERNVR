<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:53
 * @Description: 水印设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-11 16:22:35
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    id="player"
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                :model="pageData"
                label-position="left"
                :style="{
                    '--form-label-width': '150px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.currChlId"
                        value-key="value"
                        :options="pageData.chlList"
                        @change="handleChlChange"
                    >
                        <el-option
                            v-for="item in pageData.chlList"
                            :key="item.chlId"
                            :label="item.chlName"
                            :value="item.chlId"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK')">
                    <el-select
                        v-model="pageData.chlData.switch"
                        value-key="value"
                        placeholder=""
                        :disabled="pageData.switchDisabled"
                        :options="pageData.options"
                        @change="handleSwitchChange"
                    >
                        <el-option
                            v-for="item in pageData.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_INFORMATION')">
                    <el-input
                        v-model="pageData.chlData.customText"
                        @input="handleFocus(pageData.chlData.customText, 'form')"
                        @blur="handleCustomTextInput(pageData.chlData.customText)"
                    ></el-input>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :data="pageData.chlList"
                    border
                    stripe
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50px"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus :icon="scope.row.status"></BaseTableRowStatus>
                        </template>
                    </el-table-column>
                    <!-- 通道名 -->
                    <el-table-column
                        prop="chlName"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        width="330px"
                    >
                        <template #default="scope">
                            <span>{{ scope.row.chlName }}</span>
                        </template>
                    </el-table-column>
                    <!-- 水印开关   -->
                    <el-table-column
                        prop="switch"
                        width="365px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_WATER_MARK') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.options"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.label"
                                            @click="handleSwitchChangeAll(item.value)"
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
                                value-key="value"
                                :disabled="scope.row.disabled"
                                :placeholder="Translate('IDCS_ON')"
                                :options="pageData.options"
                                @change="handleTableSwitchChange(scope.row)"
                            >
                                <el-option
                                    v-for="item in pageData.options"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                >
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <!-- 信息 -->
                    <el-table-column
                        prop="customText"
                        :label="Translate('IDCS_INFORMATION')"
                        width="330px"
                    >
                        <template #header>
                            <el-dropdown
                                ref="dropdownRef"
                                trigger="click"
                                :hide-on-click="false"
                                placement="bottom"
                            >
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_INFORMATION') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item>
                                            <div>
                                                <el-input
                                                    v-model="pageData.customTextSetAll"
                                                    placeholder=""
                                                    @input="handleFocus(pageData.customTextSetAll, 'table')"
                                                ></el-input>
                                                <el-row class="base-btn-box">
                                                    <el-button @click="handleSetCustomTextAll(pageData.customTextSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                                    <el-button @click="handleSetCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                                </el-row>
                                            </div>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <span>{{ scope.row.customText }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
                    v-model:current-page="pageData.pageIndex"
                    v-model:page-size="pageData.pageSize"
                    :page-sizes="pageData.pageDataCountItems"
                    layout="prev, pager, next, sizes, total, jumper"
                    :total="pageData.totalCount"
                    size="small"
                    @size-change="changePaginationSize"
                    @current-change="changePagination"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="pageData.applyDisabled"
                    @click="handleApply"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelWaterMark.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>
