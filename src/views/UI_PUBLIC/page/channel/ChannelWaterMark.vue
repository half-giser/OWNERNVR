<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:53
 * @Description: 水印设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 18:06:05
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
                :style="{
                    '--form-label-width': '150px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.currChlId"
                        @change="handleChlChange"
                    >
                        <el-option
                            v-for="item in pageData.chlList"
                            :key="item.chlId"
                            :label="item.chlName"
                            :value="item.chlId"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK')">
                    <el-select
                        v-model="pageData.chlData.switch"
                        :disabled="pageData.switchDisabled"
                        @change="handleSwitchChange"
                    >
                        <el-option
                            v-for="item in pageData.options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_INFORMATION')">
                    <el-input
                        v-model="pageData.chlData.customText"
                        :formatter="formatInput"
                        :parser="formatInput"
                        :disabled="pageData.switchDisabled"
                        @blur="handleCustomTextInput(pageData.chlData.customText)"
                    />
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
                    <!-- 通道名 -->
                    <el-table-column
                        prop="chlName"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                    />
                    <!-- 水印开关   -->
                    <el-table-column>
                        <template #header>
                            <el-dropdown>
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
                                :disabled="scope.row.disabled"
                                :placeholder="Translate('IDCS_ON')"
                                @change="handleTableSwitchChange(scope.row)"
                            >
                                <el-option
                                    v-for="item in pageData.options"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <!-- 信息 -->
                    <el-table-column
                        prop="customText"
                        :label="Translate('IDCS_INFORMATION')"
                    >
                        <template #header>
                            <el-popover
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
                            </el-popover>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
                    v-model:current-page="pageData.pageIndex"
                    v-model:page-size="pageData.pageSize"
                    :total="pageData.totalCount"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!pageData.editRows.size"
                    @click="handleApply"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelWaterMark.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>
