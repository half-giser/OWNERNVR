<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-12 15:34:24
 * @Description: email通知
-->
<template>
    <div>
        <el-form
            ref="formRef"
            v-title
            :model="pageData.form"
            :rules="rules"
            :style="{
                '--form-label-width': '105px',
            }"
            class="top"
        >
            <el-form-item
                :label="Translate('IDCS_RECIPIENT')"
                prop="recipient"
            >
                <BaseTextInput
                    v-model="pageData.form.recipient"
                    :maxlength="pageData.receiverNameMaxByteLen"
                />
                <BaseScheduleSelect
                    v-model="pageData.schedule"
                    :options="pageData.scheduleList"
                    @edit="openSchedulePop"
                />
                <el-button @click="addRecipient()">
                    {{ Translate('IDCS_ADD') }}
                </el-button>
            </el-form-item>
        </el-form>
        <div class="main">
            <el-table
                ref="tableRef"
                v-title
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
                    <template #default="{ row }: TableColumn<AlarmEmailReceiverDto>">
                        {{ formatAddress(row) }}
                    </template>
                </el-table-column>
                <el-table-column width="205">
                    <template #header>
                        <BaseScheduleTableDropdown
                            :options="pageData.scheduleList"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<AlarmEmailReceiverDto>">
                        <BaseScheduleSelect
                            v-model="row.schedule"
                            :options="pageData.scheduleList"
                            @edit="openSchedulePop"
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
                    <template #default="{ row }: TableColumn<AlarmEmailReceiverDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="delReceiver(row)"
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
                    <el-button @click="setData()">
                        {{ Translate('IDCS_APPLY') }}
                    </el-button>
                </div>
            </div>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./EmailReceiver.v.ts"></script>

<style lang="scss" scoped>
.top {
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
