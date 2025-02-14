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
                    <template #default="{ row }: TableColumn<UserNetworkSecurityForm>">
                        {{ formatNetworkCardName(row.id) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_ARP_GUARD')">
                    <template #default="{ row }: TableColumn<UserNetworkSecurityForm>">
                        <el-checkbox v-model="row.arpSwitch" />
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
                    <template #default="{ row }: TableColumn<UserNetworkSecurityForm>">
                        <el-checkbox
                            v-model="row.autoGetGatewayMac"
                            :disabled="!row.arpSwitch"
                            @change="changeAutoGetGatewayMac(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_GATEWAY_MAC')"
                    width="250"
                >
                    <template #default="{ row }: TableColumn<UserNetworkSecurityForm>">
                        <BaseMacInput
                            v-model="row.getGatewayMac"
                            :disabled="!row.arpSwitch || row.autoGetGatewayMac"
                            @change="changeMannualGatewayMac(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DETECTION_DEFENSE')">
                    <template #default="{ row }: TableColumn<UserNetworkSecurityForm>">
                        <el-checkbox
                            v-model="row.preventDetection"
                            :disabled="!row.arpSwitch"
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
