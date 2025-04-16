<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 09:08:21
 * @Description: POS配置
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
            >
                <el-table-column
                    :label="Translate('IDCS_POS')"
                    prop="name"
                />
                <!-- 启用 -->
                <el-table-column width="100">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENABLE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.switchOption"
                                        :key="opt.value"
                                        @click="changeAllSwitch(opt.value)"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemPosList>">
                        <el-select-v2
                            v-model="row.switch"
                            :options="pageData.switchOption"
                        />
                    </template>
                </el-table-column>
                <!-- 连接方式 -->
                <el-table-column width="240">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_CONNECTION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.connectionTypeList"
                                        :key="opt.value"
                                        @click="changeAllConnectionType(opt.value)"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemPosList>">
                        <el-select-v2
                            v-model="row.connectionType"
                            :options="pageData.connectionTypeList"
                        />
                    </template>
                </el-table-column>
                <!-- 连接设置 -->
                <el-table-column
                    :label="Translate('IDCS_CONNECTION_SETTINGS')"
                    width="150"
                >
                    <template #default="{ $index }: TableColumn<SystemPosList>">
                        <el-button @click="setConnection($index)">{{ Translate('IDCS_CONFIG') }}</el-button>
                    </template>
                </el-table-column>
                <!-- 协议 -->
                <el-table-column width="160">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_PROTOCOL') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.manufacturersList"
                                        :key="opt.value"
                                        @click="changeAllManufacturers(opt.value)"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemPosList>">
                        <el-select-v2
                            v-model="row.manufacturers"
                            :options="pageData.manufacturersList"
                        />
                    </template>
                </el-table-column>
                <!-- 联动通道 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_TRGGER')"
                    width="150"
                >
                    <template #default="{ row, $index }: TableColumn<SystemPosList>">
                        <div class="base-cell-box">
                            <el-checkbox
                                v-model="row.triggerChl.switch"
                                @change="changeTriggerChannel($index)"
                            />
                            <el-button
                                :disabled="!row.triggerChl.switch"
                                @click="setTriggerChannel($index)"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
                <!-- 显示设置 -->
                <el-table-column width="150">
                    <template #header>
                        <BaseTableDropdownLink @click="setAllDisplay">
                            {{ Translate('IDCS_DISPLAY_SETTINGS') }}
                        </BaseTableDropdownLink>
                    </template>
                    <template #default="{ $index }: TableColumn<SystemPosList>">
                        <el-button @click="setDisplay($index)">{{ Translate('IDCS_CONFIG') }}</el-button>
                    </template>
                </el-table-column>
                <!-- 编码格式 -->
                <el-table-column width="200">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENCODE_FORMAT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.encodeList"
                                        :key="opt.value"
                                        @click="changeAllEncodeFormat(opt.value)"
                                    >
                                        {{ opt.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemPosList>">
                        <el-select-v2
                            v-model="row.encodeFormat"
                            :options="pageData.encodeList"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="watchEdit.disabled.value"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <PosConnectionSettingsPop
            v-model="pageData.isConnectionDialog"
            :data="tableData[pageData.connectionDialogIndex]"
            @confirm="confirmSetConnection"
            @close="pageData.isConnectionDialog = false"
        />
        <BaseTransferDialog
            v-model="pageData.isTriggerChannelDialog"
            header-title="IDCS_CHANNEL_TRGGER"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="filterChlList"
            :linked-list="pageData.triggerChannels"
            limit-tip="IDCS_ALARMOUT_LIMIT"
            @confirm="confirmSetTriggerChannel"
            @close="closeTriggerChannel"
        />
        <PosHayleyTriggerChannelPop
            v-model="pageData.isHayleyTriggerChannleDialog"
            :max="pageData.tillNumberMax"
            :link-chls="linkChls"
            :chls="tableData[pageData.triggerChannelDialogIndex]?.triggerChl.chls || []"
            @confirm="confirmSetTriggerChannel"
            @close="closeTriggerChannel"
        />
        <PosDisplaySettingPop
            v-model="pageData.isDisplayDialog"
            :data="tableData[pageData.displayDialogIndex]?.displaySetting"
            :limit="pageData.displaysetList"
            :color-data="pageData.colorData"
            @confirm="confirmSetDisplay"
            @close="pageData.isDisplayDialog = false"
        />
    </div>
</template>

<script lang="ts" src="./PosSettings.v.ts"></script>
