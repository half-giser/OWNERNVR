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
                    :split="1"
                    @onready="onReady"
                />
            </div>
            <el-form
                ref="formRef"
                :model="formData"
                :style="{
                    '--form-label-width': '160px',
                }"
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="selectedChlId"
                        @change="handleChlSel"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="index"
                            :value="item.id"
                            :label="item.name || ' '"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FISHEYE_STREAM_MODE')">
                    <el-select
                        v-model="formData.fishEyeMode"
                        :disabled="formData.disabled || formData.reqCfgFail"
                        @change="handleChangeVal()"
                    >
                        <el-option
                            v-for="(item, index) in fishEyeModeOption"
                            :key="index"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FISHEYE_MODE')">
                    <el-select
                        v-model="formData.installType"
                        :disabled="formData.disabled || formData.reqCfgFail"
                        @change="handleChangeVal()"
                    >
                        <el-option
                            v-for="(item, index) in installTypeOption"
                            :key="index"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ENABLE')">
                    <el-select
                        v-model="formData.fishEyeEnable"
                        :disabled="!formData.reqCfgFail"
                        @change="handleChangeVal(true)"
                    >
                        <el-option
                            v-for="item in switchOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    border
                    stripe
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus
                                :icon="scope.row.status"
                                :error-text="scope.row.statusTip"
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
                                            v-for="(item, index) in fishEyeModeOption"
                                            :key="index"
                                            @click="handleChangeAll('fishEyeMode', item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.fishEyeMode"
                                :disabled="scope.row.disabled || scope.row.reqCfgFail || scope.row.HIKVISION"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal()"
                            >
                                <el-option
                                    v-for="(item, index) in fishEyeModeOption"
                                    :key="index"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
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
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.installType"
                                :disabled="scope.row.disabled || scope.row.reqCfgFail || scope.row.HIKVISION"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal()"
                            >
                                <el-option
                                    v-for="(item, index) in installTypeOption"
                                    :key="index"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
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
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.fishEyeEnable"
                                :disabled="!scope.row.reqCfgFail || scope.row.privateProtocol"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeVal(true)"
                            >
                                <el-option
                                    v-for="item in switchOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="btnOKDisabled"
                    @click="save"
                    >{{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelFisheye.v.ts"></script>
