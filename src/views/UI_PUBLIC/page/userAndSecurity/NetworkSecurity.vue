<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:41:44
 * @Description: 网络安全
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column :label="Translate('IDCS_NETWORK_CARD')">
                    <template #default="scope">
                        {{ formatNetworkCardName(scope.row.id) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_ARP_GUARD')">
                    <template #default="scope">
                        <el-checkbox v-model="scope.row.arpSwitch" />
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
                            v-model="scope.row.autoGetGatewayMac"
                            :disabled="!scope.row.arpSwitch"
                            @change="changeAutoGetGatewayMac(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_GATEWAY_MAC')"
                    width="250"
                >
                    <template #default="scope">
                        <BaseMacInput
                            v-model="scope.row.getGatewayMac"
                            :disabled="!scope.row.arpSwitch || scope.row.autoGetGatewayMac"
                            @change="changeMannualGatewayMac(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DETECTION_DEFENSE')">
                    <template #default="scope">
                        <el-checkbox
                            v-model="scope.row.preventDetection"
                            :disabled="!scope.row.arpSwitch"
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
    </div>
</template>

<script lang="ts" src="./NetworkSecurity.v.ts"></script>
