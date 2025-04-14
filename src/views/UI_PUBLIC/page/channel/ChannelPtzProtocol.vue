<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:05
 * @Description: 云台-协议
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
                :style="{
                    '--form-label-width': '150px',
                }"
                class="stripe"
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
                <el-form-item :label="Translate('IDCS_PTZ')">
                    <el-select-v2
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].ptz"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        :options="pageData.ptzOptions"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PROTOCOL')">
                    <el-select-v2
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].protocol"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        :options="tableData[pageData.tableIndex].protocolOptions"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BAUD_RATE')">
                    <el-select-v2
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].baudRate"
                        :disabled="tableData[pageData.tableIndex].disabled"
                        :options="tableData[pageData.tableIndex].baudRateOptions"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                        disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADDRESS')">
                    <BaseNumberInput
                        v-if="tableData[pageData.tableIndex]"
                        v-model="tableData[pageData.tableIndex].address"
                        :min="tableData[pageData.tableIndex].addressMin"
                        :max="tableData[pageData.tableIndex].addressMax"
                        :disabled="tableData[pageData.tableIndex].disabled"
                    />
                    <el-input
                        v-else
                        disabled
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    v-title
                    :data="tableData"
                    highlight-current-row
                    flexible
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelPtzProtocolDto>">
                            <BaseTableRowStatus :icon="row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                        width="185"
                    />
                    <el-table-column :label="Translate('IDCS_PTZ')">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_PTZ') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.ptzOptions"
                                            :key="item.label"
                                            @click="changeAllPtz(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>

                        <template #default="{ row }: TableColumn<ChannelPtzProtocolDto>">
                            <el-select-v2
                                v-model="row.ptz"
                                :disabled="row.disabled"
                                :options="pageData.ptzOptions"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_PROTOCOL')">
                        <template #default="{ row }: TableColumn<ChannelPtzProtocolDto>">
                            <el-select-v2
                                v-model="row.protocol"
                                :disabled="row.disabled"
                                :options="row.protocolOptions"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_BAUD_RATE')">
                        <template #default="{ row }: TableColumn<ChannelPtzProtocolDto>">
                            <el-select-v2
                                v-model="row.baudRate"
                                :disabled="row.disabled"
                                :options="row.baudRateOptions"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_ADDRESS')">
                        <template #default="{ row }: TableColumn<ChannelPtzProtocolDto>">
                            <BaseNumberInput
                                v-model="row.address"
                                :min="row.addressMin"
                                :max="row.addressMax"
                                :disabled="row.disabled"
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
            <div class="base-btn-box space-between">
                <div class="text-error">
                    {{ Translate('IDCS_PTZOPEN_AND_PROTOCOLSET_RULE') }}
                </div>
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

<script lang="ts" src="./ChannelPtzProtocol.v.ts"></script>

<style lang="scss" scoped>
.time {
    width: 80px;
    text-align: center;
}
</style>
