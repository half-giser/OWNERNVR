<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 15:15:55
 * @Description: 通道 - 信号接入配置
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                border
                stripe
                :data="tableData"
                table-layout="fixed"
                show-overflow-tooltip
                highlight-current-row
            >
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL')"
                    min-width="300"
                />
                <el-table-column
                    v-if="switchableIpChlMaxCount !== 0"
                    :label="Translate('IDCS_ANALOG_IP')"
                    min-width="220"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ANALOG_IP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in analogIpOptions"
                                        :key="item.label"
                                        @click="handleAnalogIpChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.analogIp"
                            @change="handleAnalogIpChange(scope.row)"
                        >
                            <el-option
                                v-for="item in analogIpOptions"
                                :key="item.label"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_SIGNAL')"
                    min-width="220"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SIGNAL') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in chlSupSignalTypeList"
                                        :key="item.value"
                                        :class="{ signalItemCvi: item.value === 'CVI' }"
                                        @click="handleSignalChangeAll(item.value)"
                                        >{{ item.text }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-if="scope.row.showSignal"
                            v-model="scope.row.signal"
                            @change="btnOkDisabled = false"
                        >
                            <el-option
                                v-for="item in chlSupSignalTypeList"
                                :key="item.value"
                                :label="item.text"
                                :value="item.value"
                                :class="{ signalItemCvi: item.value === 'CVI' }"
                            />
                        </el-select>
                        <span v-else>--</span>
                    </template>
                </el-table-column>
                <el-table-column
                    v-if="supportLite"
                    :label="Translate('IDCS_SUPPORT_LITE')"
                    min-width="220"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SUPPORT_LITE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in switchOptions"
                                        :key="item.label"
                                        @click="handleLiteChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-if="scope.row.showLite"
                            v-model="scope.row.lite"
                            @change="btnOkDisabled = false"
                        >
                            <el-option
                                v-for="item in switchOptions"
                                :key="item.label"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                        <span v-else>--</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            span="start"
        >
            <div v-if="switchableIpChlMaxCount !== 0">
                <span>{{ Translate('IDCS_IP_NUM') }}: {{ ipChlMaxCount }}</span>
            </div>
        </div>
        <div
            class="base-btn-box collapse"
            :span="2"
        >
            <div>{{ Translate('IDCS_SIGNAL_TIPS') }}</div>
            <div>
                <el-button
                    :disabled="btnOkDisabled"
                    @click="save()"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelSignal.v.ts"></script>

<style scoped lang="scss">
.signalItemCvi {
    border-top: 1px solid var(--content-border);
}
</style>
