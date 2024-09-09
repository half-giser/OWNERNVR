<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-16 18:56:00
 * @Description: TCP/IP配置页
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:45:42
-->
<template>
    <div class="tcp-ip">
        <div class="base-subheading-box">{{ Translate('IDCS_IP_ADDRESS_SET') }}</div>
        <el-form
            label-position="left"
            class="narrow"
            :style="{
                '--form-input-width': '220px',
            }"
        >
            <!-- 工作模式 -->
            <el-form-item
                v-show="formData.netConfig.curWorkMode !== 'work_mode_none'"
                :label="Translate('IDCS_WORK_PATTERN')"
            >
                <el-select
                    v-model="formData.netConfig.curWorkMode"
                    :disabled="pageData.pppoeSwitch || !(formData.netConfig.supportNetworkMultiAddrSetting && formData.netConfig.supportNetworkFaultTolerance)"
                >
                    <el-option
                        v-for="item in pageData.workModeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-text>{{ Translate('IDCS_WORK_PATTERN_TIP') }}</el-text>
            </el-form-item>
            <div class="eth_list">
                <!-- BONDS -->
                <el-form-item
                    v-show="formData.netConfig.curWorkMode === 'network_fault_tolerance'"
                    label="Bonds"
                >
                    <el-select
                        v-model="pageData.bondIndex"
                        :disabled="pageData.pppoeSwitch"
                    >
                        <el-option
                            v-for="(item, index) in formData.bonds"
                            :key="item.id"
                            :value="item.index"
                            :label="Translate('IDCS_FAULT_ETH_NAME').formatForLang(index + 1)"
                        />
                    </el-select>
                </el-form-item>
                <!-- 网口 -->
                <div
                    v-show="formData.netConfig.curWorkMode === 'multiple_address_setting' && !pageData.toleranceAndPoe"
                    class="nic"
                >
                    <div
                        v-for="item in formData.nicConfigs"
                        :key="item.id"
                        class="nic_btn"
                        :class="{
                            disabled: pageData.pppoeSwitch,
                            active: item.index === pageData.nicIndex,
                        }"
                        @click="pageData.nicIndex = item.index"
                    >
                        {{ displayNicName(item) }} ({{ displayNicStatus(item) }})
                    </div>
                </div>
                <el-button
                    :disabled="pageData.pppoeSwitch"
                    @click="setAdvanceData"
                    >{{ Translate('IDCS_ADVANCED') }}</el-button
                >
            </div>
            <div class="config">
                <!-- DHCP -->
                <div class="dhcp">
                    <el-form-item>
                        <el-checkbox
                            :model-value="current.dhcpSwitch"
                            :disabled="pageData.pppoeSwitch"
                            @update:model-value="changeSwitch($event, 'dhcpSwitch')"
                            >{{ Translate('IDCS_AUTO_GET_IP_ADDRESS') }}</el-checkbox
                        >
                    </el-form-item>
                </div>
                <div class="ip">
                    <div class="ipv4">
                        <el-form-item label="IPv4"></el-form-item>
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
                            <el-select
                                v-model="formData.netConfig.poeMode"
                                :disabled="!poeEnabled"
                                @change="handleChangePoeMode"
                            >
                                <el-option
                                    v-for="item in pageData.poeModeOptions"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </el-form-item>
                        <!-- IPv4 自动DNS -->
                        <el-form-item>
                            <el-checkbox
                                :model-value="current.ipv4DnsDhcpSwitch"
                                :disabled="!current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeSwitch($event, 'ipv4DnsDhcpSwitch')"
                                >{{ Translate('IDCS_AUTO_GET_DNS_ADDRESS') }}</el-checkbox
                            >
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
                                @update:model-value="changeSwitch($event, 'ipV6Switch')"
                                @change="handleChangeIpV6Switch"
                                >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                            >
                        </el-form-item>
                        <!-- IPv6地址 -->
                        <el-form-item :label="Translate('IDCS_IP_ADDRESS')">
                            <el-input
                                :model-value="current.ipV6"
                                spellcheck="false"
                                :disabled="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'ipV6')"
                            />
                        </el-form-item>
                        <!-- IPv6子网前缀长度 -->
                        <el-form-item :label="Translate('IDCS_SUBNET_MASK_LENGTH')">
                            <el-input-number
                                :model-value="current.subLengthV6"
                                :min="0"
                                :max="128"
                                value-on-clear="min"
                                :controls="false"
                                :disabled="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeData($event, 'subLengthV6')"
                            />
                        </el-form-item>
                        <!-- IPv6网关 -->
                        <el-form-item :label="Translate('IDCS_GATEWAY')">
                            <el-input
                                :model-value="current.gatewayV6"
                                :disabled="!current.ipV6Switch || current.dhcpSwitch || !poeEnabled"
                                spellcheck="false"
                                @update:model-value="changeData($event, 'gatewayV6')"
                            />
                        </el-form-item>
                        <!-- IPv6 自动DNS -->
                        <el-form-item>
                            <el-checkbox
                                :model-value="current.ipv6DnsDhcpSwitch"
                                :disabled="!current.ipV6Switch || !current.dhcpSwitch || !poeEnabled"
                                @update:model-value="changeSwitch($event, 'ipv6DnsDhcpSwitch')"
                                >{{ Translate('IDCS_AUTO_GET_DNS_IPV6_ADDRESS') }}</el-checkbox
                            >
                        </el-form-item>
                        <!-- IPv6首选DNS -->
                        <el-form-item :label="Translate('IDCS_FIRST_DNS')">
                            <el-input
                                :model-value="current.ipv6Dns1"
                                :disabled="!current.ipV6Switch || current.ipv6DnsDhcpSwitch || !poeEnabled"
                                spellcheck="false"
                                @update:model-value="changeData($event, 'ipv6Dns1')"
                            />
                        </el-form-item>
                        <!-- IPv6备选DNS -->
                        <el-form-item :label="Translate('IDCS_SECOND_DNS')">
                            <el-input
                                :model-value="current.ipv6Dns2"
                                :disabled="!current.ipV6Switch || current.ipv6DnsDhcpSwitch || !poeEnabled"
                                spellcheck="false"
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
                <el-select
                    :model-value="current.primaryNIC || ''"
                    @update:model-value="changeData($event, 'primaryNIC')"
                >
                    <el-option
                        v-for="item in formData.nicConfigs"
                        :key="item.id"
                        :value="item.id"
                        :label="displayNicName(item)"
                    />
                </el-select>
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
                    <el-form-item :label="displayNicName(item)"></el-form-item>
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
                <el-select
                    v-model="formData.ipDefaultBond"
                    :disabled="pageData.pppoeSwitch"
                >
                    <el-option
                        v-for="(item, index) in formData.bonds"
                        :key="item.id"
                        :value="item.id"
                        :label="Translate('IDCS_FAULT_ETH_NAME').formatForLang(index + 1)"
                    />
                </el-select>
            </el-form-item>
            <el-form-item
                v-show="formData.netConfig.curWorkMode === 'multiple_address_setting'"
                :label="Translate('IDCS_PROMPT_DEFAULT_NIC')"
            >
                <el-select
                    v-model="formData.netConfig.defaultNic"
                    :disabled="pageData.pppoeSwitch"
                >
                    <el-option
                        v-for="item in formData.nicConfigs"
                        :key="item.id"
                        :value="item.id"
                        :label="displayNicName(item)"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="!poeEnabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
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
    justify-content: space-between;
    background-color: var(--bg-color5);
    align-items: center;
    border: 1px solid var(--border-color8);
    box-sizing: border-box;
    & > div {
        width: 50%;
        padding-left: 15px;
        margin-top: 5px;
        margin-bottom: 5px;
    }
}

.nic {
    display: flex;

    &_btn {
        padding: 4px 20px;
        border-bottom: 5px solid transparent;
        font-size: 15px;
        cursor: pointer;

        &.active {
            border-bottom-color: var(--primary--04);
        }
    }
}

.config {
    border: 1px solid var(--border-color8);
    box-sizing: border-box;
    padding: 5px 0;
    margin-bottom: 5px;
}

.dhcp {
    padding: 5px 10px;
    background-color: var(--bg-color5);
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
