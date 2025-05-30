<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-18 13:54:46
 * @Description: 通道 - 鱼眼设置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                />
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
                <el-form-item :label="Translate('IDCS_FISHEYE_STREAM_MODE')">
                    <el-select-v2
                        v-model="formData.fishEyeMode"
                        :disabled="formData.disabled || formData.reqCfgFail"
                        :options="formData.fishEyeModeList"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FISHEYE_MODE')">
                    <el-select-v2
                        v-model="formData.installType"
                        :disabled="formData.disabled || formData.reqCfgFail"
                        :options="installTypeOption"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ENABLE')">
                    <el-select-v2
                        v-if="!formData.reqCfgFail"
                        model-value=""
                        :options="[]"
                        disabled
                    />
                    <el-select-v2
                        v-else
                        v-model="formData.fishEyeEnable"
                        :options="switchOptions"
                        :disabled="formData.isPrivateProtocol"
                        @change="changeFishEyeEnabled(true)"
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
                        <template #default="{ row }: TableColumn<ChannelFisheyeDto>">
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
                        :label="Translate('IDCS_FISHEYE_STREAM_MODE')"
                        min-width="180"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_FISHEYE_STREAM_MODE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(item, index) in pageData.fishEyeModeList"
                                            :key="index"
                                            @click="handleChangeAll('fishEyeMode', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelFisheyeDto>">
                            <el-select-v2
                                v-model="row.fishEyeMode"
                                :disabled="row.disabled || row.reqCfgFail || row.HIKVISION"
                                :options="row.fishEyeModeList"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_FISHEYE_MODE')"
                        min-width="180"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_FISHEYE_MODE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(item, index) in installTypeOption"
                                            :key="index"
                                            @click="handleChangeAll('installType', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelFisheyeDto>">
                            <el-select-v2
                                v-model="row.installType"
                                :disabled="row.disabled || row.reqCfgFail || row.HIKVISION"
                                :options="installTypeOption"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_ENABLE')"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ENABLE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="handleChangeAll('fishEyeEnable', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelFisheyeDto>">
                            <el-select-v2
                                v-if="!row.reqCfgFail"
                                model-value=""
                                :options="[]"
                                disabled
                            />
                            <el-select-v2
                                v-else
                                v-model="row.fishEyeEnable"
                                :disabled="row.isPrivateProtocol"
                                :options="switchOptions"
                                @change="changeFishEyeEnabled(true)"
                            />
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

<script lang="ts" src="./ChannelFisheye.v.ts"></script>
