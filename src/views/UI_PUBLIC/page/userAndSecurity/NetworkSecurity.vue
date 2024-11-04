<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:41:44
 * @Description: 网络安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:51:59
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableData"
            >
                <el-table-column :label="Translate('IDCS_NETWORK_CARD')">
                    <template #default="scope">
                        {{ formatNetworkCardName(scope.row.id) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_ARP_GUARD')">
                    <template #default="scope">
                        <el-checkbox v-model="tableData[scope.$index].arpSwitch" />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_GATEWAY')"
                    prop="gateway"
                />
                <el-table-column
                    :label="Translate('IDCS_AUTO_GATEWAY_MAC')"
                    width="250"
                >
                    <template #default="scope">
                        <el-checkbox
                            v-model="tableData[scope.$index].autoGetGatewayMac"
                            :disabled="!tableData[scope.$index].arpSwitch"
                            @change="handleChangeAutoGetGatewayMac(scope.row, scope.$index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_GATEWAY_MAC')"
                    width="250"
                >
                    <template #default="scope">
                        <BaseMacInput
                            v-model="tableData[scope.$index].getGatewayMac"
                            :disabled="!tableData[scope.$index].arpSwitch || tableData[scope.$index].autoGetGatewayMac"
                            @change="handleChangeMannualGatewayMac(scope.row, scope.$index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DETECTION_DEFENSE')">
                    <template #default="scope">
                        <el-checkbox
                            v-model="tableData[scope.$index].preventDetection"
                            :disabled="!tableData[scope.$index].arpSwitch"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.submitDisabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./NetworkSecurity.v.ts"></script>
