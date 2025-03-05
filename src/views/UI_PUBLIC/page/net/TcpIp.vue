<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 18:56:00
 * @Description: TCP/IP配置页
-->
<template>
    <div class="tcp-ip">
        <div class="base-subheading-box">{{ Translate('IDCS_IP_ADDRESS_SET') }}</div>
        <el-form
            :style="{
                '--form-input-width': '220px',
            }"
        >
            <!-- 工作模式 -->
            <el-form-item
                v-show="formData.netConfig.curWorkMode !== 'work_mode_none'"
                :label="Translate('IDCS_WORK_PATTERN')"
            >
                <el-select-v2
                    v-model="formData.netConfig.curWorkMode"
                    :disabled="pageData.pppoeSwitch || !(formData.netConfig.supportNetworkMultiAddrSetting && formData.netConfig.supportNetworkFaultTolerance)"
                    :options="pageData.workModeOptions"
                />
                <el-text>{{ Translate('IDCS_WORK_PATTERN_TIP') }}</el-text>
            </el-form-item>
            <!-- BONDS -->
            <el-form-item
                v-show="formData.netConfig.curWorkMode === 'network_fault_tolerance' && formData.bonds.length > 1"
                :label="Translate('IDCS_BONDS')"
            >
                <el-select-v2
                    v-model="pageData.bondIndex"
                    :disabled="pageData.pppoeSwitch"
                    :options="bondsOptions"
                />
            </el-form-item>
            <!-- 网口 -->
            <div
                v-show="formData.netConfig.curWorkMode === 'multiple_address_setting' && !pageData.toleranceAndPoe"
                class="eth_list"
            >
                <div
                    v-for="item in formData.nicConfigs"
                    :key="item.id"
                    class="eth_list_btn"
                    :class="{
                        disabled: pageData.pppoeSwitch,
                        active: item.index === pageData.nicIndex,
                    }"
                    @click="pageData.nicIndex = item.index"
                >
                    {{ displayNicName(item) }} ({{ displayNicStatus(item) }})
                </div>
            </div>
            <div class="config">
                <el-button
                    class="advance-btn"
                    :disabled="pageData.pppoeSwitch"
                    @click="setAdvanceData"
                >
                    {{ Translate('IDCS_ADVANCED') }}
                </el-button>
                <!-- DHCP -->
                <div class="dhcp">
                    <el-form-item>
                        <el-checkbox
                            :model-value="current.dhcpSwitch"
                            :disabled="pageData.pppoeSwitch"
                            :label="Translate('IDCS_AUTO_GET_IP_ADDRESS')"
                            @update:model-value="changeSwitch($event, 'dhcpSwitch')"
                        />
                    </el-form-item>
                </div>
                <div class="ip">
                    <div class="ipv4">
                        <el-form-item label="IPv4" />
                        <!-- IPv4地址 -->
                        <el-form-item :label="Translate('IDCS_IP_ADDRESS')">
                            <BaseIpInput
                                :model-value="current.ip"
                                :disabled="current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'ip')"
                            />
                        </el-form-item>
                        <!-- IPv4子网掩码 -->
                        <el-form-item :label="Translate('IDCS_SUBNET_MASK')">
                            <BaseIpInput
                                :model-value="current.mask"
                                :disabled="current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'mask')"
                            />
                        </el-form-item>
                        <!-- IPv4网关 -->
                        <el-form-item
                            v-show="!isPoe"
                            :label="Translate('IDCS_GATEWAY')"
                        >
                            <BaseIpInput
                                :model-value="current.gateway"
                                :disabled="current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'gateway')"
                            />
                        </el-form-item>
                        <!-- IPv4 Poe模式 -->
                        <el-form-item
                            v-show="isPoe"
                            :label="Translate('IDCS_POE_MODE')"
                        >
                            <el-select-v2
                                v-model="formData.netConfig.poeMode"
                                :disabled="!poeEnabled"
                                :options="pageData.poeModeOptions"
                                @change="handleChangePoeMode"
                            />
                        </el-form-item>
                        <!-- IPv4 自动DNS -->
                        <el-form-item>
                            <el-checkbox
                                :model-value="current.ipv4DnsDhcpSwitch"
                                :disabled="!current.dhcpSwitch || !poeEnabled"
                                :label="Translate('IDCS_AUTO_GET_DNS_ADDRESS')"
                                @update:model-value="changeSwitch($event, 'ipv4DnsDhcpSwitch')"
                            />
                        </el-form-item>
                        <!-- IPv4首选DNS -->
                        <el-form-item :label="Translate('IDCS_FIRST_DNS')">
                            <BaseIpInput
                                :model-value="current.dns1"
                                :disabled="current.ipv4DnsDhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'dns1')"
                            />
                        </el-form-item>
                        <!-- IPv4备选DNS -->
                        <el-form-item :label="Translate('IDCS_SECOND_DNS')">
                            <BaseIpInput
                                :model-value="current.dns2"
                                :disabled="current.ipv4DnsDhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'dns2')"
                            />
                        </el-form-item>
                    </div>
                    <div class="ipv6">
                        <!-- 开启IPv6 -->
                        <el-form-item label="IPv6">
                            <el-checkbox
                                :model-value="current.ipV6Switch"
                                :disabled="!poeEnabled"
                                :label="Translate('IDCS_ENABLE')"
                                @update:model-value="changeSwitch($event, 'ipV6Switch')"
                                @change="handleChangeIpV6Switch"
                            />
                        </el-form-item>
                        <!-- IPv6地址 -->
                        <el-form-item :label="Translate('IDCS_IP_ADDRESS')">
                            <el-input
                                :model-value="current.ipV6"
                                :disabled="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'ipV6')"
                            />
                        </el-form-item>
                        <!-- IPv6子网前缀长度 -->
                        <el-form-item :label="Translate('IDCS_SUBNET_MASK_LENGTH')">
                            <el-input
                                v-if="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                disabled
                            />
                            <BaseNumberInput
                                v-else
                                :model-value="current.subLengthV6"
                                :min="0"
                                :max="128"
                                @update:model-value="changeData($event, 'subLengthV6')"
                            />
                        </el-form-item>
                        <!-- IPv6网关 -->
                        <el-form-item :label="Translate('IDCS_GATEWAY')">
                            <el-input
                                :model-value="current.gatewayV6"
                                :disabled="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'gatewayV6')"
                            />
                        </el-form-item>
                        <!-- IPv6 自动DNS -->
                        <el-form-item>
                            <el-checkbox
                                :model-value="current.ipv6DnsDhcpSwitch"
                                :disabled="!current.ipV6Switch || !current.dhcpSwitch || !poeEnabled"
                                :label="Translate('IDCS_AUTO_GET_DNS_IPV6_ADDRESS')"
                                @update:model-value="changeSwitch($event, 'ipv6DnsDhcpSwitch')"
                            />
                        </el-form-item>
                        <!-- IPv6首选DNS -->
                        <el-form-item :label="Translate('IDCS_FIRST_DNS')">
                            <el-input
                                :model-value="current.ipv6Dns1"
                                :disabled="!current.ipV6Switch || current.ipv6DnsDhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'ipv6Dns1')"
                            />
                        </el-form-item>
                        <!-- IPv6备选DNS -->
                        <el-form-item :label="Translate('IDCS_SECOND_DNS')">
                            <el-input
                                :model-value="current.ipv6Dns2"
                                :disabled="!current.ipV6Switch || current.ipv6DnsDhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'ipv6Dns2')"
                            />
                        </el-form-item>
                    </div>
                </div>
            </div>
            <!-- 主网卡 -->
            <el-form-item
                v-if="!current.isPoe"
                v-show="formData.netConfig.curWorkMode === 'network_fault_tolerance'"
                :label="Translate('IDCS_PRIMARY_NETWORK_CARD')"
            >
                <el-select-v2
                    :model-value="current.primaryNIC || ''"
                    :options="nicConfigOptions"
                    @update:model-value="changeData($event, 'primaryNIC')"
                />
            </el-form-item>
            <!-- 网口 -->
            <div
                v-if="!current.isPoe"
                v-show="formData.netConfig.curWorkMode === 'network_fault_tolerance'"
                class="eth"
            >
                <div
                    v-for="item in formData.nicConfigs"
                    :key="item.id"
                    class="eth-item"
                >
                    <el-form-item :label="displayNicName(item)" />
                    <el-form-item :label="Translate('IDCS_MAC_ADDRESS')">
                        <BaseMacInput
                            v-model="item.mac"
                            disabled
                        />
                    </el-form-item>
                </div>
            </div>
            <el-form-item
                v-show="formData.netConfig.curWorkMode === 'network_fault_tolerance'"
                :label="Translate('IDCS_PROMPT_DEFAULT_NIC')"
            >
                <el-select-v2
                    v-model="formData.ipDefaultBond"
                    :disabled="pageData.pppoeSwitch"
                    :options="bondsOptions"
                />
            </el-form-item>
            <el-form-item
                v-show="formData.netConfig.curWorkMode === 'multiple_address_setting'"
                :label="Translate('IDCS_PROMPT_DEFAULT_NIC')"
            >
                <el-select-v2
                    v-model="formData.netConfig.defaultNic"
                    :disabled="pageData.pppoeSwitch"
                    :options="nicConfigOptions"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="!poeEnabled"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <TcpIpAdvancePop
            v-model="pageData.isAdvancePop"
            :data="formData"
            @close="pageData.isAdvancePop = false"
            @confirm="confirmSetAdvanceData"
        />
    </div>
</template>

<script lang="ts" src="./TcpIp.v.ts"></script>

<style lang="scss" scoped>
.eth_list {
    display: flex;
    width: 100%;
    background-color: var(--table-stripe);
    align-items: center;
    border: 1px solid var(--table-border);
    box-sizing: border-box;
    padding: 4px 10px;

    &_btn {
        padding: 4px 10px;
        border-bottom: 5px solid transparent;
        font-size: 15px;
        cursor: pointer;

        &.active {
            border-bottom-color: var(--primary);
        }
    }
}

.advance-btn {
    position: absolute;
    top: -32px;
    right: 10px;
}

.config {
    border: 1px solid var(--table-border);
    box-sizing: border-box;
    padding: 5px 0;
    margin-bottom: 5px;
    position: relative;
}

.dhcp {
    padding: 5px 10px;
    background-color: var(--table-stripe);
    margin: 0 5px;
    width: calc(100% - 30px);

    & > div {
        margin-bottom: 0;
    }
}

.ip {
    width: 100%;
    display: flex;

    & > div {
        width: 50%;
    }

    .el-form-item {
        padding: 5px 15px;
        margin-bottom: 0;
    }
}

.eth {
    display: flex;
    flex-wrap: wrap;

    &-item {
        width: 50%;
    }

    .el-form-item {
        padding: 5px 15px;
        margin-bottom: 0;
    }
}
</style>
