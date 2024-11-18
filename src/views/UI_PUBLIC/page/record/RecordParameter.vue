<!--
 * @Description: 录像——参数配置
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-02 16:12:01
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="highRecord"
            class="stripe"
            :style="{
                '--form-input-width': '215px',
            }"
            inline-message
        >
            <div class="base-subheading-box">{{ Translate('IDCS_HIGH_RECORD_PARAM') }}</div>
            <!-- <el-form-item
                v-show="false"
                :label="Translate('IDCS_MAIN_STREAM_RECORD_TIME')"
            >
                <BaseNumberInput
                    v-model="pageData.txtMSRecDuration"
                    type="number"
                    :min="1"
                    :max="31"
                />
            </el-form-item> -->
            <el-form-item>
                <el-checkbox
                    v-model="pageData.chkLoopRec"
                    :label="Translate('IDCS_CYCLE_RECORD_TIP')"
                />
            </el-form-item>
            <el-form-item>
                <el-select v-model="pageData.doubleStreamRecSwitch">
                    <el-option
                        v-for="item in pageData.chkDoubleStreamRec"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="base-subheading-box msgbox">{{ Translate('IDCS_CHANNEL_RECORD_PARAM') }}</div>
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                border
                stripe
                :data="tableData"
                show-overflow-tooltip
                highlight-current-row
            >
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="280"
                    prop="name"
                />
                <!-- 预录像时间 -->
                <el-table-column
                    :label="Translate('IDCS_BEFOREHAND_RECORD_TIME')"
                    min-width="180"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BEFOREHAND_RECORD_TIME') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.perList"
                                        :key="item.value"
                                        @click="changeAllPerList(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.per">
                            <el-option
                                v-for="item in pageData.perList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 警后录像时间 -->
                <el-table-column
                    :label="Translate('IDCS_RECORD_TIME_DELAY')"
                    min-width="180"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_RECORD_TIME_DELAY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.postList"
                                        :key="item.value"
                                        @click="changeAllPostList(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.post">
                            <el-option
                                v-for="item in pageData.postList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 断网补录 -->
                <el-table-column
                    v-if="supportANR"
                    :label="Translate('IDCS_OFFLINE_RECORDING')"
                    min-width="180"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_OFFLINE_RECORDING') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOption"
                                        :key="item.value"
                                        @click="changeAllANRSwitchList(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.ANRSwitch"
                            :disabled="!scope.row.manufacturerEnable"
                            :placeholder="Translate('IDCS_OFF')"
                        >
                            <el-option
                                v-for="item in pageData.switchOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 过期时间 -->
                <el-table-column
                    :label="Translate('IDCS_EXPIRE_TIME')"
                    min-width="180"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_EXPIRE_TIME') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.expirationList"
                                        :key="item.value"
                                        @click="changeAllExpirationList(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.expirationDisplay"
                            @change="changeExpirationList(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.expirationList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            span="2"
        >
            <div>
                <span v-show="supportANR">{{ Translate('IDCS_OFFLINE_RECORDING_TIPS') }}</span>
            </div>
            <div>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </div>
        <RecordParameterCustomPop
            v-model="pageData.isSetCustomization"
            :expiration-type="pageData.expirationType"
            :expiration-data="pageData.expirationData"
            @confirm="handleGetExpirationData"
            @close="pageData.isSetCustomization = false"
        />
    </div>
</template>

<script lang="ts" src="./RecordParameter.v.ts"></script>

<style scoped>
.msgbox {
    margin: 10px 0;
}
</style>
