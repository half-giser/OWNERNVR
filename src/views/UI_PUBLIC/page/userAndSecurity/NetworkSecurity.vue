<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:41:44
 * @Description: 网络安全
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 15:38:10
-->
<template>
    <div class="NetworkSecurity">
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
                    <el-checkbox v-model="tableData[scope.$index].arpSwitch"></el-checkbox>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_GATEWAY')"
                prop="gateway"
            ></el-table-column>
            <el-table-column
                :label="Translate('IDCS_AUTO_GATEWAY_MAC')"
                width="250px"
            >
                <template #default="scope">
                    <el-checkbox
                        v-model="tableData[scope.$index].autoGetGatewayMac"
                        :disabled="!tableData[scope.$index].arpSwitch"
                        @change="handleChangeAutoGetGatewayMac(scope.row, scope.$index)"
                    >
                    </el-checkbox>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_GATEWAY_MAC')"
                width="250px"
            >
                <template #default="scope">
                    <BaseMacInput
                        v-model:value="tableData[scope.$index].getGatewayMac"
                        :disable="!tableData[scope.$index].arpSwitch || tableData[scope.$index].autoGetGatewayMac"
                        @change="handleChangeMannualGatewayMac(scope.row, scope.$index)"
                    />
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DETECTION_DEFENSE')">
                <template #default="scope">
                    <el-checkbox
                        v-model="tableData[scope.$index].preventDetection"
                        :disabled="!tableData[scope.$index].arpSwitch"
                    >
                    </el-checkbox>
                </template>
            </el-table-column>
        </el-table>
        <div class="btns">
            <el-button
                :disabled="pageData.submitDisabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./NetworkSecurity.v.ts"></script>

<style lang="scss" scoped>
.NetworkSecurity {
    :deep(.el-table) {
        height: calc(100vh - 300px);
    }
    .btns {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
