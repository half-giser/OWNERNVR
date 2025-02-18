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
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
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
                        <BaseImgSprite
                            file="edit (2)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
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
                                @change="cellChange($event, $index, row, 'addrType')"
                            />
                            <BaseIpInput
                                v-show="row.addrType === 'ip'"
                                v-model="row.ip"
                                class="ipInput"
                                @change="cellChange($event, $index, row, 'ip')"
                            />
                            <el-input
                                v-show="row.addrType !== 'ip'"
                                v-model="row.domain"
                                @change="cellChange($event, $index, row, 'ip')"
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
                            v-model="row.port"
                            :min="10"
                            :max="65535"
                            :disabled="row.portDisabled"
                            @change="cellChange($event, $index, row, 'port')"
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
                            @change="cellChange($event, $index, row, 'userName')"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PASSWORD')"
                    min-width="300"
                >
                    <template #default="{ row, $index }: TableColumn<ChannelManualAddDto>">
                        <el-input
                            v-model="row.password"
                            type="password"
                            @blur="cellChange($event, $index, row, 'password')"
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
                            @change="cellChange($event, $index, row, 'manufacturer')"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100"
                >
                    <template #default="{ $index }: TableColumn<ChannelManualAddDto>">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            :disabled-index="3"
                            :disabled="rowDelClass($index)"
                            @click="rowDel($index)"
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
                    @click="handleActivate"
                >
                    {{ Translate('IDCS_ACTIVATE') }}
                </el-button>
                <el-button @click="handleSetDefaultPwd">{{ Translate('IDCS_DEV_DEFAULT_PWD') }}</el-button>
                <el-button
                    v-show="activeTab === tabKeys.addRecorder"
                    @click="handleManualAdd"
                >
                    {{ Translate('IDCS_RECORD_MANUAL_ADD') }}
                </el-button>
                <el-button @click="save">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="handleCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <ChannelAddActivateIPCPop
            v-model="activateIPCVisable"
            :activate-ipc-data="activateIpcData"
            @close="closeActivateIPCPop"
        />
        <ChannelAddSetDefaultPwdPop
            v-model="setDefaultPwdPopVisiable"
            @close="closeSetDefaultPwdPop"
            @change="handleUpdateMapping"
        />
        <ChannelAddEditIPCIpPop
            v-model="editIPCIpPopVisiable"
            :edit-item="quickAddEditRowData"
            :mapping="mapping"
            @close="closeEditIPCIpPop"
        />
        <ChannelAddToAddRecorderPop
            v-model="toAddRecorderPopVisiable"
            :edit-item="recoderEditItem"
            :mapping="mapping"
            :chl-count-limit="chlCountLimit"
            :face-match-limit-max-chl-num="faceMatchLimitMaxChlNum"
            @close="closeToAddRecorderPopVisiable"
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
