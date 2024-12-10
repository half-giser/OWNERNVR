<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 15:34:24
 * @Description: email通知
-->
<template>
    <div>
        <el-form
            ref="formRef"
            :model="pageData.form"
            :rules="rules"
            :style="{
                '--form-label-width': '240px',
                '--form-input-width': '180px',
            }"
            class="top"
        >
            <el-form-item
                :label="Translate('IDCS_RECIPIENT')"
                prop="recipient"
            >
                <el-input
                    v-model="pageData.form.recipient"
                    maxlength="63"
                />
                <el-select-v2
                    v-model="pageData.schedule"
                    :options="pageData.scheduleList"
                />
                <el-button @click="addRecipient()">
                    {{ Translate('IDCS_ADD') }}
                </el-button>
            </el-form-item>
        </el-form>
        <div class="main">
            <el-table
                ref="tableRef"
                :data="tableData"
                height="343"
                @row-click="handleRowClick"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80"
                    type="index"
                />
                <el-table-column
                    width="325"
                    :label="Translate('IDCS_RECIPIENT')"
                    show-overflow-tooltip
                >
                    <template #default="scope">
                        {{ formatAddress(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column width="205">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleList"
                                        :key="item.value"
                                        @click="changeAllSchedule(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.schedule"
                            :options="pageData.scheduleList"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="90"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="delAllReceiver()">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
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
                            @click="delReceiver(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <div class="base-btn-box space-between">
                <div>
                    <span>{{ Translate('IDCS_SENDER') }} :</span>
                    <span class="sender">{{ formatSender(pageData.sender) }}</span>
                    <BaseImgSprite
                        file="icon_mask"
                        :index="getIconStatus()"
                        :hover-index="getIconStatus()"
                        :chunk="4"
                        @click="toggleMask()"
                    />
                </div>
                <div>
                    <el-button @click="editSender()">
                        {{ Translate('IDCS_SENDER_EDIT') }}
                    </el-button>
                    <el-button @click="pageData.isSchedulePop = true">
                        {{ Translate('IDCS_SCHEDULE_MANAGE') }}
                    </el-button>
                    <el-button @click="setData()">
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
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
