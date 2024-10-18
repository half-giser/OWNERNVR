<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 15:34:24
 * @Description: email通知
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-09 11:49:02
-->
<template>
    <div>
        <!-- <span class="lblReceiver">{{ Translate('IDCS_RECIPIENT') }}</span> -->
        <el-form
            ref="formRef"
            :model="pageData.form"
            :rules="rules"
            :style="{
                '--form-label-width': '260px',
                '--form-input-width': '180px',
            }"
            class="top"
            label-position="left"
            hide-required-asterisk
        >
            <el-form-item
                :label="Translate('IDCS_RECIPIENT')"
                prop="recipient"
            >
                <el-input v-model="pageData.form.recipient" />
                <el-select v-model="pageData.schedule">
                    <el-option
                        v-for="item in pageData.scheduleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
                <el-button
                    type="primary"
                    @click="addRecipient()"
                >
                    {{ Translate('IDCS_ADD') }}
                </el-button>
            </el-form-item>
        </el-form>
        <div class="main">
            <el-table
                ref="tableRef"
                :data="tableData"
                stripe
                border
                height="343px"
                highlight-current-row
                show-overflow-tooltip
                @row-click="handleRowClick($event)"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80"
                >
                    <template #default="{ $index }">
                        {{ $index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="addressShow"
                    width="325px"
                    :label="Translate('IDCS_RECIPIENT')"
                >
                    <template #default="scope">
                        <span>{{ formatAddress(scope.row) }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="schedule"
                    width="205px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleScheduleChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.schedule"
                            prop="schedule"
                            value-key="value"
                            :options="pageData.scheduleList"
                            @focus="handleScheduleChange(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.scheduleList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="90px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleDelReceiverAll()">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            :class="{ disabled: scope.row.delDisabled }"
                            @click="handleDelReceiver(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <div
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <span>{{ Translate('IDCS_SENDER') }} :</span>
                    <span class="sender">{{ formatSender(pageData.sender) }}</span>
                    <BaseImgSprite
                        file="icon_mask"
                        :index="getIconStatus()"
                        :hover-index="getIconStatus()"
                        :chunk="4"
                        @click="maskShow()"
                    />
                </div>
                <div>
                    <el-button @click="handleSenderEdit()">
                        {{ Translate('IDCS_SENDER_EDIT') }}
                    </el-button>
                    <el-button @click="handleScheduleManage()">
                        {{ Translate('IDCS_SCHEDULE_MANAGE') }}
                    </el-button>
                    <el-button @click="handleApply()">
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="handleSchedulePopClose"
        >
        </ScheduleManagPop>
    </div>
</template>

<script lang="ts" src="./EmailReceiver.v.ts"></script>

<style lang="scss" scoped>
.top {
    width: 700px;
    height: 50px;
    :deep(.el-form-item) {
        padding-inline: 0 !important;
    }
    :deep(.el-select) {
        --el-color-danger: var(--input-border);
    }
}
.main {
    width: 700px;
}
.sender {
    margin-left: 5px;
    margin-right: 5px;
}
</style>
