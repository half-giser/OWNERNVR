<template>
    <div>
        <div class="alarmEmail_top">
            <span id="lblReceiver">{{ Translate('IDCS_RECIPIENT') }}</span>
            <div id="txtReceiver">
                <el-form
                    ref="formRef"
                    :model="pageData.form"
                    :rules="rules"
                >
                    <el-form-item
                        id="form_item"
                        prop="recipient"
                    >
                        <el-input v-model="pageData.form.recipient" />
                    </el-form-item>
                </el-form>
            </div>
            <div id="cboSchedule">
                <el-select
                    v-model="pageData.schedule"
                    :options="pageData.scheduleList"
                >
                    <el-option
                        v-for="item in pageData.scheduleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                </el-select>
            </div>
            <div id="btnAdd">
                <el-button
                    type="primary"
                    @click="addRecipient()"
                >
                    {{ Translate('IDCS_ADD') }}
                </el-button>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.scheduleManagePopOpen"
            @close="pageData.scheduleManagePopOpen = false"
        >
        </ScheduleManagPop>
    </div>
    <div class="alarmEmail_main">
        <el-table
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
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_SCHEDULE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_DELETE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
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
    </div>
    <div class="alarmEmail_bottom">
        <el-row class="bottom_row">
            <el-col
                :span="12"
                class="sender_info"
            >
                <span>{{ Translate('IDCS_SENDER') }} :</span>
                <span id="sender">{{ formatSender(pageData.sender) }}</span>
                <span>
                    <BaseImgSprite
                        file="icon_mask"
                        :index="getIconStatus()"
                        :hover-index="getIconStatus()"
                        :chunk="4"
                        @click="maskShow()"
                    />
                </span>
            </el-col>
            <el-col
                :span="12"
                class="colOperateBtn"
            >
                <el-button @click="handleSenderEdit()">
                    {{ Translate('IDCS_SENDER_EDIT') }}
                </el-button>
                <el-button @click="handleScheduleManage()">
                    {{ Translate('IDCS_SCHEDULE_MANAGE') }}
                </el-button>
                <el-button @click="handleApply()">
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts" src="./EmailReceiver.v.ts"></script>

<style lang="scss" scoped>
.alarmEmail_top {
    width: 700px;
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: center;
    #lblReceiver {
        width: 210px;
        margin-right: 20px;
        margin-bottom: 8px;
    }
    #txtReceiver {
        margin-right: -11px;
        width: 237px;
        #form_item {
            height: 30px;
        }
    }
    #cboSchedule {
        margin-right: 4px;
        margin-bottom: 8px;
        width: 180px;
    }
    #btnAdd {
        margin-bottom: 8px;
    }
}
.alarmEmail_main {
    width: 700px;
    height: 343px;
}
.alarmEmail_bottom {
    .bottom_row {
        display: flex;
        width: 700px;
        .sender_info {
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            font-size: 15px;
            margin-top: 5px;
            #sender {
                margin-left: 5px;
                margin-right: 5px;
            }
        }
        .colOperateBtn {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 5px;
        }
    }
}
</style>
