<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 15:15:55
 * @Description:
-->
<template>
    <div id="ChannelSignal">
        <el-table
            ref="tableRef"
            border
            stripe
            :data="tableData"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            height="calc(100vh - 290px)"
        >
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL')"
                min-width="300px"
            />
            <el-table-column
                v-if="switchableIpChlMaxCount !== 0"
                prop="analogIp"
                :label="Translate('IDCS_ANALOG_IP')"
                min-width="220px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_ANALOG_IP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="handleAnalogIpChangeAll('Analog')">{{ Translate('IDCS_SIGNAL_ANALOG') }}</el-dropdown-item>
                                <el-dropdown-item @click="handleAnalogIpChangeAll('IP')">{{ Translate('IDCS_SIGNAL_IP') }}</el-dropdown-item>
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
                            value="Analog"
                            :label="Translate('IDCS_SIGNAL_ANALOG')"
                        />
                        <el-option
                            value="IP"
                            :label="Translate('IDCS_SIGNAL_IP')"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                prop="signal"
                :label="Translate('IDCS_SIGNAL')"
                min-width="220px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_SIGNAL') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                prop="lite"
                :label="Translate('IDCS_SUPPORT_LITE')"
                min-width="220px"
            >
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_SUPPORT_LITE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="handleLiteChangeAll(true)">{{ Translate('IDCS_ON') }}</el-dropdown-item>
                                <el-dropdown-item @click="handleLiteChangeAll(false)">{{ Translate('IDCS_OFF') }}</el-dropdown-item>
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
                            :label="Translate('IDCS_ON')"
                            :value="true"
                        />
                        <el-option
                            :label="Translate('IDCS_OFF')"
                            :value="false"
                        />
                    </el-select>
                    <span v-else>--</span>
                </template>
            </el-table-column>
        </el-table>
        <div class="footer">
            <el-row class="elRowIpNumTip">
                <el-col v-if="switchableIpChlMaxCount !== 0">
                    <span>{{ `${Translate('IDCS_IP_NUM')}: ${ipChlMaxCount}` }}</span>
                </el-col>
            </el-row>
            <el-row>
                <el-col
                    :span="21"
                    class="el-col-flex-start"
                >
                    <span>{{ Translate('IDCS_SIGNAL_TIPS') }}</span>
                </el-col>
                <el-col
                    :span="3"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="btnOkDisabled"
                        @click="save()"
                        >{{ Translate('IDCS_APPLY') }}</el-button
                    >
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelSignal.v.ts"></script>

<style scoped lang="scss">
:deep(.signalItemCvi) {
    border-top: 1px solid var(--border-color8);
}
.signalItemCvi {
    border-top: 1px solid var(--border-color8);
}
.footer {
    margin-top: 10px;
    font-size: 15px;

    .elRowIpNumTip {
        height: 20px;
    }
}
</style>
