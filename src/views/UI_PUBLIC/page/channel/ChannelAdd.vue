<!-- eslint-disable vue/eqeqeq -->
<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-20 11:25:57
 * @Description: 
-->
<template>
    <div id="tabAddChl">
        <div
            v-for="item in tabs"
            v-show="item.show"
            :key="item.key"
            class="tabItem"
            :class="{ active: activeTab == item.key }"
            @click="activeTab = item.key"
        >
            {{ Translate(item.text) }}
        </div>
        <el-button
            v-show="activeTab != tabKeys.manualAdd"
            id="refreshBtn"
            @click="handleRefresh"
            >{{ Translate('IDCS_REFRESH') }}</el-button
        >
    </div>
    <el-table
        v-show="activeTab == tabKeys.quickAdd"
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
                <span :style="{ color: scope.row.activateStatus == 'UNACTIVATED' ? 'var(--color-offline)' : '' }">{{
                    scope.row.activateStatus == 'ACTIVATED' ? Translate('IDCS_ACTIVATED') : scope.row.activateStatus == 'UNACTIVATED' ? Translate('IDCS_UN_ACTIVATED') : '--'
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
    <el-form
        v-show="activeTab == tabKeys.manualAdd"
        ref="manualAddFormRef"
        :model="manualAddFormData"
        class="addChlList"
    >
        <el-table
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
                min-width="320px"
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
                                v-show="scope.row.addrType == 'ip'"
                                v-model:value="scope.row.ip"
                                class="ipInput"
                                @change="cellChange($event, scope.$index, scope.row, 'ip')"
                            />
                            <el-input
                                v-show="scope.row.addrType != 'ip'"
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
                width="100px"
            >
                <template #default="scope">
                    <el-input
                        v-model="scope.row.port"
                        v-numericalRange:[scope.row].port="[10, 65535]"
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
                        @focus="scope.row.password == '******' ? (scope.row.password = '') : ''"
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
    </el-form>
    <el-table
        v-show="activeTab == tabKeys.addRecorder"
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
    <el-row class="rowSelRowTip">
        <span
            v-show="activeTab == tabKeys.quickAdd"
            id="txtSelRowTip"
            >{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span
        >
    </el-row>
    <el-row>
        <el-col
            :span="12"
            class="colBandwidthDetail"
        >
            <span id="txtBandwidth">{{ txtBandwidth }}</span>
            <span
                id="bandwidthDetail"
                class="detailBtn"
            ></span>
        </el-col>
        <el-col
            :span="12"
            class="colOperateBtn"
        >
            <el-button
                v-show="supportsIPCActivation && activeTab == tabKeys.quickAdd"
                id="btnActivate"
                @click="handleActivate"
                >{{ Translate('IDCS_ACTIVATE') }}</el-button
            >
            <el-button
                id="btnSetDefaultPwd"
                @click="handleSetDefaultPwd"
                >{{ Translate('IDCS_DEV_DEFAULT_PWD') }}</el-button
            >
            <el-button
                v-show="activeTab == tabKeys.addRecorder"
                id="btnManualAdd"
                @click="handleManualAdd"
                >{{ Translate('IDCS_RECORD_MANUAL_ADD') }}</el-button
            >
            <el-button
                id="btnOK"
                @click="save"
                >{{ Translate('IDCS_ADD') }}</el-button
            >
            <el-button
                id="btnCancel"
                @click="handleCancel"
                >{{ Translate('IDCS_CANCEL') }}</el-button
            >
        </el-col>
    </el-row>

    <ChannelAddActivateIPCPop
        v-model="activateIPCVisable"
        :activate-ipc-data="activateIpcData"
        :close="closeActivateIPCPop"
    ></ChannelAddActivateIPCPop>
    <ChannelAddSetDefaultPwdPop
        v-model="setDefaultPwdPopVisiable"
        :close="closeSetDefaultPwdPop"
        @change="handleUpdateMapping"
    ></ChannelAddSetDefaultPwdPop>
    <ChannelAddEditIPCIpPop
        v-model="editIPCIpPopVisiable"
        :close="closeEditIPCIpPop"
        :edit-item="quickAddEditRowData"
        :mapping="mapping"
    ></ChannelAddEditIPCIpPop>
    <ChannelAddToAddRecorderPop
        v-model="toAddRecorderPopVisiable"
        :close="closeToAddRecorderPopVisiable"
        :edit-item="recoderEditItem"
        :mapping="mapping"
        :chl-count-limit="chlCountLimit"
        :face-match-limit-max-chl-num="faceMatchLimitMaxChlNum"
    ></ChannelAddToAddRecorderPop>
    <ChannelAddSetProtocolPop
        v-model="setProtocolPopVisiable"
        :manufacturer-list="nameList"
        :close="closeSetProtocolPop"
    ></ChannelAddSetProtocolPop>
    <ChannelAddMultiChlIPCAdd ref="multiChlIPCAddRef"></ChannelAddMultiChlIPCAdd>
</template>

<script lang="ts" src="./ChannelAdd.v.ts"></script>

<style scoped lang="scss">
#tabAddChl {
    display: flex;
    justify-content: center;
    padding: 5px;
    border-top: 1px solid var(--border-color6);
    border-left: 1px solid var(--border-color6);
    border-right: 1px solid var(--border-color6);
    position: relative;
    .tabItem {
        font-size: 14px;
        padding: 4px 15px 4px 15px;
        border: 1px solid var(--border-color7);
        &.active {
            background-color: var(--primary--04);
            color: var(--color-white);
        }
    }
    .tabItem:not(:first-child) {
        margin-left: -1px;
    }
}
#refreshBtn {
    position: absolute;
    right: 30px;
    height: 29px;
}
.addChlList {
    width: 100%;
    height: calc(100vh - 325px);

    .manualAddTable {
        width: 100%;
        height: 100%;

        .manualAddTableRowIp {
            width: 100%;

            .manualAddTableColIp {
                height: 25px;
                display: flex;
                align-items: center;

                .ipInput {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
}
.rowSelRowTip {
    height: 20px;
    margin-top: 5px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    font-size: 15px;
}
.colBandwidthDetail {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    font-size: 15px;
}
.colOperateBtn {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
}
</style>
