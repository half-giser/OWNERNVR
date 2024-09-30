<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-29 11:48:53
 * @Description: 水印设置
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-29 17:56:50
-->
<template>
    <div class="waterMark_main">
        <div class="waterMark_left">
            <div class="divWaterMarkOCX">
                <BaseVideoPlayer
                    id="player"
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <div class="settings">
                <el-form
                    :model="pageData"
                    label-width="150px"
                    label-position="left"
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
                            :placeholder="Translate('IDCS_ON')"
                            :disabled="pageData.chlData.disabled"
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
                            @focus="handleFocus(pageData.chlData.customText)"
                            @blur="handleCustomTextInput(pageData.chlData.customText)"
                        ></el-input>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div class="base-flex-box">
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
                        class-name="custom_cell"
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
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_WATER_MARK') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
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
                                @change="addEditRow(getRowById(pageData.chlData.chlId))"
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
                                class="customText_input"
                            >
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_INFORMATION') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item>
                                            <div>
                                                <el-input
                                                    v-model="pageData.customTextSetAll"
                                                    placeholder=""
                                                    @focus="handleFocus(pageData.customTextSetAll)"
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
            <el-row class="row_pagination">
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
            </el-row>
            <el-row class="base-btn-box">
                <el-button
                    :disabled="pageData.applyDisabled"
                    @click="handleApply"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelWaterMark.v.ts"></script>

<style lang="scss" scoped>
.waterMark_main {
    display: flex;
    flex-direction: row;
    width: 100%;
}

.waterMark_left {
    display: flex;
    flex-direction: column;
    width: 400px;
    margin-right: 9px;
    .divWaterMarkOCX {
        width: 400px;
        height: 300px;
    }
    .settings {
        width: 400px;
        height: 105px;
    }
}

.waterMarkGrid {
    display: flex;
    flex-direction: column;
    // width: 50%;
    height: fit-content;
    .dropDown_btn {
        margin-top: 10px;
        // .el-button {
        //     margin-right: 10px;
        // }
    }
}
</style>
