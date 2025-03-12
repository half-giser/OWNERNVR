<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-20 11:25:57
 * @Description: 新增通道
-->
<template>
    <div class="base-flex-box">
        <div class="tabs">
            <div></div>
            <el-radio-group v-model="activeTab">
                <el-radio-button
                    v-for="item in tabs"
                    v-show="item.show"
                    :key="item.key"
                    :value="item.key"
                    :label="Translate(item.text)"
                />
            </el-radio-group>
            <div>
                <el-button
                    v-show="activeTab !== tabKeys.manualAdd"
                    @click="handleRefresh"
                >
                    {{ Translate('IDCS_REFRESH') }}
                </el-button>
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                v-show="activeTab === tabKeys.quickAdd"
                ref="quickAddTableRef"
                :data="quickAddTableData"
                show-overflow-tooltip
                highlight-current-row
                @row-click="handleQuickAddRowClick"
                @selection-change="handleQuickAddSelectionChange"
            >
                <el-table-column
                    type="index"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80"
                />
                <el-table-column
                    type="selection"
                    width="50"
                />
                <el-table-column
                    v-if="supportsIPCActivation"
                    :label="Translate('IDCS_IPC_ACTIVATE_STATE')"
                    min-width="140"
                >
                    <template #default="{ row }: TableColumn<ChannelQuickAddDto>">
                        <span :class="[row.activateStatus === 'UNACTIVATED' ? 'text-offline' : '']">
                            {{ row.activateStatus === 'ACTIVATED' ? Translate('IDCS_ACTIVATED') : row.activateStatus === 'UNACTIVATED' ? Translate('IDCS_UN_ACTIVATED') : '--' }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="140"
                >
                    <template #default="{ row }: TableColumn<ChannelQuickAddDto>">
                        {{ row.poeIndex ? Translate('IDCS_POE_PREFIX').formatForLang(row.poeIndex) + row.ip : row.ip }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="port"
                    :label="Translate('IDCS_PORT')"
                    width="100"
                />
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="120"
                    align="center"
                >
                    <template #default="{ row }: TableColumn<ChannelQuickAddDto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="openEditIPCIpPop(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="mask"
                    :label="Translate('IDCS_SUBNET_MASK')"
                    min-width="140"
                />
                <el-table-column
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="200"
                >
                    <template #default="{ row }: TableColumn<ChannelQuickAddDto>">
                        {{ formatDisplayManufacturer(row) }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="productModel.innerText"
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="200"
                />
                <el-table-column
                    prop="version"
                    :label="Translate('IDCS_VERSION')"
                    min-width="140"
                />
                <el-table-column
                    prop="mac"
                    :label="Translate('IDCS_SERIAL_NO')"
                    min-width="200"
                />
            </el-table>
            <el-table
                v-show="activeTab === tabKeys.manualAdd"
                ref="manualAddTableRef"
                :data="manualAddFormData"
                show-overflow-tooltip
            >
                <el-table-column
                    :label="Translate('IDCS_ADDRESS')"
                    width="340"
                    :show-overflow-tooltip="false"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <div class="base-cell-box">
                            <el-select-v2
                                v-model="row.addrType"
                                :options="manualAddTypeOptions"
                                @change="addManualAddRow($index)"
                            />
                            <BaseIpInput
                                v-show="row.addrType === 'ip'"
                                v-model="row.ip"
                                class="ipInput"
                                @change="addManualAddRow($index)"
                            />
                            <el-input
                                v-show="row.addrType !== 'ip'"
                                v-model="row.domain"
                                @change="addManualAddRow($index)"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    width="150"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <BaseNumberInput
                            v-if="row.port === 0"
                            :model-value="undefined"
                            disabled
                        />
                        <BaseNumberInput
                            v-else
                            v-model="row.port"
                            :min="10"
                            :max="65535"
                            :disabled="row.portDisabled"
                            @change="addManualAddRow($index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_USERNAME')"
                    min-width="300"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <el-input
                            v-model="row.userName"
                            maxlength="63"
                            @change="addManualAddRow($index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PASSWORD')"
                    min-width="300"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <BasePasswordInput
                            v-model="row.password"
                            @blur="addManualAddRow($index)"
                            @focus="row.password === '******' ? (row.password = '') : ''"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="300"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <el-select-v2
                            v-model="row.manufacturer"
                            :options="manufacturerList"
                            @change="changeManufacturer($index, row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100"
                >
                    <template #default="{ $index }: TableColumn<ChannelManualAddDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            :disabled="isDelManualAddRowDisabled($index)"
                            @click="delManualAddRow($index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <el-table
                v-show="activeTab === tabKeys.addRecorder"
                ref="addRecorderTableRef"
                :data="addRecorderTableData"
                show-overflow-tooltip
                highlight-current-row
                @row-click="handleRecorderRowClick"
                @row-dblclick="handleRecorderRowDbClick"
            >
                <el-table-column
                    type="index"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80"
                />
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_DEVICE_NAME')"
                    min-width="300"
                />
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_IP_ADDRESS')"
                    min-width="250"
                />
                <el-table-column
                    prop="port"
                    :label="Translate('IDCS_PORT')"
                    width="100"
                />
                <el-table-column
                    prop="productModel"
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="300"
                />
                <el-table-column
                    prop="serialNum"
                    :label="Translate('IDCS_SERIAL_NO')"
                    min-width="250"
                />
            </el-table>
        </div>
        <div class="base-btn-box flex-start">
            <span v-show="activeTab === tabKeys.quickAdd">{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span>
        </div>
        <div class="base-btn-box space-between collapse">
            <div>
                {{ txtBandwidth }}
            </div>
            <div>
                <el-button
                    v-show="supportsIPCActivation && activeTab === tabKeys.quickAdd"
                    @click="activateIPC"
                >
                    {{ Translate('IDCS_ACTIVATE') }}
                </el-button>
                <el-button @click="setDefaultPwd">{{ Translate('IDCS_DEV_DEFAULT_PWD') }}</el-button>
                <el-button
                    v-show="activeTab === tabKeys.addRecorder"
                    @click="addRecorder"
                >
                    {{ Translate('IDCS_RECORD_MANUAL_ADD') }}
                </el-button>
                <el-button @click="save">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <ChannelAddActivateIPCPop
            v-model="isActivateIPCPop"
            :activate-ipc-data="activateIpcData"
            @close="closeActivateIPCPop"
        />
        <ChannelAddSetDefaultPwdPop
            v-model="isSetDefaultPwdPop"
            @close="closeSetDefaultPwdPop"
            @change="changeDefaultPwd"
        />
        <ChannelAddEditIPCIpPop
            v-model="isEditIPCIpPop"
            :edit-item="quickAddEditRowData"
            :mapping="mapping"
            @close="closeEditIPCIpPop"
        />
        <ChannelAddToAddRecorderPop
            v-model="isAddRecorderPop"
            :edit-item="recoderEditItem"
            :mapping="mapping"
            @close="closeAddRecorderPop"
        />
        <ChannelAddSetProtocolPop
            v-model="setProtocolPopVisiable"
            :manufacturer-list="nameList"
            @close="closeSetProtocolPop"
        />
        <ChannelAddMultiChlIPCAdd ref="multiChlIPCAddRef" />
    </div>
</template>

<script lang="ts" src="./ChannelAdd.v.ts"></script>

<style scoped lang="scss">
.tabs {
    display: flex;
    padding: 5px 15px;
    border: 1px solid var(--table-border);
    flex-shrink: 0;
    position: relative;
    justify-content: space-between;

    & > div:not(:nth-child(2)) {
        width: 100px;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
