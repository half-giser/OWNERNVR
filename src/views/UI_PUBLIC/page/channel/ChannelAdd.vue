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
                    >{{ Translate(item.text) }}</el-radio-button
                >
            </el-radio-group>
            <div>
                <el-button
                    v-show="activeTab !== tabKeys.manualAdd"
                    @click="handleRefresh"
                    >{{ Translate('IDCS_REFRESH') }}</el-button
                >
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                v-show="activeTab === tabKeys.quickAdd"
                ref="quickAddTableRef"
                border
                stripe
                :data="quickAddTableData"
                class="addChlList"
                table-layout="fixed"
                show-overflow-tooltip
                highlight-current-row
                empty-text=" "
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
            >
                <el-table-column
                    type="index"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80px"
                />
                <el-table-column
                    type="selection"
                    width="50px"
                />
                <el-table-column
                    v-if="supportsIPCActivation"
                    prop="activateStatus"
                    :label="Translate('IDCS_IPC_ACTIVATE_STATE')"
                    min-width="140px"
                >
                    <template #default="scope">
                        <span :style="{ color: scope.row.activateStatus === 'UNACTIVATED' ? 'var(--color-offline)' : '' }">{{
                            scope.row.activateStatus === 'ACTIVATED' ? Translate('IDCS_ACTIVATED') : scope.row.activateStatus === 'UNACTIVATED' ? Translate('IDCS_UN_ACTIVATED') : '--'
                        }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="140px"
                >
                    <template #default="scope">
                        <span>{{ scope.row.poeIndex ? Translate('IDCS_POE_PREFIX').formatForLang(scope.row.poeIndex) + scope.row.ip : scope.row.ip }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="port"
                    :label="Translate('IDCS_PORT')"
                    width="100px"
                />
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="120px"
                    align="center"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="openEditIPCIpPop(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="mask"
                    :label="Translate('IDCS_SUBNET_MASK')"
                    min-width="140px"
                />
                <el-table-column
                    prop="manufacturer"
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="200px"
                >
                    <template #default="scope">
                        <span>{{ formatDisplayManufacturer(scope.row) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="productModel.innerText"
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="200px"
                />
                <el-table-column
                    prop="version"
                    :label="Translate('IDCS_VERSION')"
                    min-width="140px"
                />
                <el-table-column
                    prop="mac"
                    :label="Translate('IDCS_SERIAL_NO')"
                    min-width="200px"
                />
            </el-table>
            <el-table
                v-show="activeTab === tabKeys.manualAdd"
                ref="manualAddTableRef"
                border
                stripe
                :data="manualAddFormData"
                class="manualAddTable"
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
            >
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_ADDRESS')"
                    width="340px"
                    :show-overflow-tooltip="false"
                >
                    <template #default="scope">
                        <el-row class="manualAddTableRowIp">
                            <el-col :span="12">
                                <el-select
                                    v-model="scope.row.addrType"
                                    value-key="id"
                                    size="small"
                                    @change="cellChange($event, scope.$index, scope.row, 'addrType')"
                                >
                                    <el-option
                                        v-for="item in manualAddTypeOptions"
                                        :key="item.value"
                                        :label="item.text"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-col>
                            <el-col :span="1"></el-col>
                            <el-col
                                :span="11"
                                class="manualAddTableColIp"
                            >
                                <BaseIpInput
                                    v-show="scope.row.addrType === 'ip'"
                                    v-model="scope.row.ip"
                                    class="ipInput"
                                    size="small"
                                    @change="cellChange($event, scope.$index, scope.row, 'ip')"
                                />
                                <el-input
                                    v-show="scope.row.addrType !== 'ip'"
                                    v-model="scope.row.domain"
                                    size="small"
                                    @change="cellChange($event, scope.$index, scope.row, 'ip')"
                                />
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    width="150px"
                >
                    <template #default="scope">
                        <el-input-number
                            v-model="scope.row.port"
                            :min="10"
                            :max="65535"
                            value-on-clear="min"
                            :controls="false"
                            :disabled="scope.row.portDisabled"
                            size="small"
                            @change="cellChange($event, scope.$index, scope.row, 'port')"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="userName"
                    :label="Translate('IDCS_USERNAME')"
                    min-width="300px"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.userName"
                            size="small"
                            maxlength="63"
                            @change="cellChange($event, scope.$index, scope.row, 'userName')"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="password"
                    :label="Translate('IDCS_PASSWORD')"
                    min-width="300px"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.password"
                            type="password"
                            size="small"
                            @blur="cellChange($event, scope.$index, scope.row, 'password')"
                            @focus="scope.row.password === '******' ? (scope.row.password = '') : ''"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="manufacturer"
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="300px"
                >
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.manufacturer"
                            value-key="id"
                            size="small"
                            @change="cellChange($event, scope.$index, scope.row, 'manufacturer')"
                        >
                            <el-option
                                v-for="item in manufacturerList"
                                :key="item.value"
                                :label="item.text"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100px"
                >
                    <template #default="scope">
                        <div
                            class="iconDel"
                            :class="{ disabled: rowDelClass(scope.$index) }"
                            @click="rowDel(scope.$index)"
                        ></div>
                    </template>
                </el-table-column>
            </el-table>
            <el-table
                v-show="activeTab === tabKeys.addRecorder"
                ref="addRecorderTableRef"
                border
                stripe
                :data="addRecorderTableData"
                class="addChlList"
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
                highlight-current-row
                @row-click="handleRecorderRowClick"
                @row-dblclick="handleRecorderRowDbClick"
            >
                <el-table-column
                    type="index"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80px"
                />
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_DEVICE_NAME')"
                    min-width="300px"
                />
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_IP_ADDRESS')"
                    min-width="250px"
                />
                <el-table-column
                    prop="port"
                    :label="Translate('IDCS_PORT')"
                    width="100px"
                >
                </el-table-column>
                <el-table-column
                    prop="productModel"
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="300px"
                />
                <el-table-column
                    prop="serialNum"
                    :label="Translate('IDCS_SERIAL_NO')"
                    min-width="250px"
                />
            </el-table>
        </div>
        <div
            class="base-btn-box"
            span="start"
        >
            <span v-show="activeTab === tabKeys.quickAdd">{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span>
        </div>
        <div
            class="base-btn-box collapse"
            :span="2"
        >
            <div>
                <span>{{ txtBandwidth }}</span>
            </div>
            <div>
                <el-button
                    v-show="supportsIPCActivation && activeTab === tabKeys.quickAdd"
                    @click="handleActivate"
                    >{{ Translate('IDCS_ACTIVATE') }}</el-button
                >
                <el-button @click="handleSetDefaultPwd">{{ Translate('IDCS_DEV_DEFAULT_PWD') }}</el-button>
                <el-button
                    v-show="activeTab === tabKeys.addRecorder"
                    @click="handleManualAdd"
                    >{{ Translate('IDCS_RECORD_MANUAL_ADD') }}</el-button
                >
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
    justify-content: center;
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

.manualAddTable {
    width: 100%;
    height: 100%;

    .manualAddTableRowIp {
        width: 100%;

        .manualAddTableColIp {
            height: 25px;
            display: flex;
            align-items: center;
        }
    }
}
</style>
