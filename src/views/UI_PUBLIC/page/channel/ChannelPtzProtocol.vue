<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:05
 * @Description: 云台-协议
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 14:52:29
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                v-if="tableData.length"
                label-position="left"
                :style="{
                    '--form-label-width': '150px',
                }"
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.tableIndex"
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].ptz"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in pageData.ptzOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PROTOCOL')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].protocol"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in tableData[pageData.tableIndex].protocolOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BAUD_RATE')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].baudRate"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in tableData[pageData.tableIndex].baudRateOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADDRESS')">
                    <el-input-number
                        v-model="tableData[pageData.tableIndex].address"
                        :min="tableData[pageData.tableIndex].addressMin"
                        :max="tableData[pageData.tableIndex].addressMax"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                        :controls="false"
                        value-on-clear="min"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    :data="tableData"
                    border
                    stripe
                    highlight-current-row
                    flexible
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus :icon="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                    />
                    <el-table-column :label="Translate('IDCS_PTZ')">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_PTZ') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.ptzOptions"
                                            :key="item.label"
                                            @click="changeAllPtz(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>

                        <template #default="scope">
                            <el-select
                                v-model="scope.row.ptz"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in pageData.ptzOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_PROTOCOL')">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.protocol"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in scope.row.protocolOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_BAUD_RATE')">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.baudRate"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in scope.row.baudRateOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="Translate('IDCS_ADDRESS')"
                        prop="address"
                    >
                        <template #default="scope">
                            <el-input-number
                                v-model="scope.row.address"
                                :min="scope.row.addressMin"
                                :max="scope.row.addressMax"
                                value-on-clear="min"
                                :disabled="scope.row.status !== 'success'"
                                :controls="false"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelPtzProtocol.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>

<style lang="scss" scoped>
.time {
    width: 80px;
    text-align: center;
}
</style>
