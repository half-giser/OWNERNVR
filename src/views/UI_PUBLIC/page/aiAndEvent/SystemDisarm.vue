<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-23 10:54:01
 * @Description: 系统撤防
-->
<template>
    <!-- 添加弹窗 -->
    <el-dialog
        v-model="pageData.showAddDialog"
        :title="Translate('IDCS_ADD')"
        width="520"
    >
        <el-table
            ref="addTableRef"
            v-title
            show-overflow-tooltip
            height="287"
            :data="filterChlsSourceList"
        >
            <el-table-column
                type="selection"
                width="55"
            />
            <el-table-column :label="`${Translate('IDCS_CHANNEL')}/${Translate('IDCS_SENSOR')}`">
                <template #default="{ row }: TableColumn<AlaramSystemDisarmChlDto>">
                    {{ row.name }}
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button @click="addItem">
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="pageData.showAddDialog = false">
                {{ Translate('IDCS_CANCEL') }}
            </el-button>
        </div>
    </el-dialog>
    <!-- 配置弹窗 -->
    <el-dialog
        v-model="pageData.showCfgDialog"
        :title="Translate('IDCS_RECOVER_LINK_ITEM')"
        width="520"
        @open="openCfgDialog"
    >
        <el-table
            ref="cfgTableRef"
            v-title
            show-overflow-tooltip
            height="287"
            :data="cfgTableData"
        >
            <el-table-column
                type="selection"
                width="55"
            />
            <el-table-column
                :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                prop="value"
            />
        </el-table>
        <div class="base-btn-box flex-start text-tips">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</div>
        <div class="base-btn-box collapse">
            <el-button @click="cfgItem">
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="pageData.showCfgDialog = false">
                {{ Translate('IDCS_CANCEL') }}
            </el-button>
        </div>
    </el-dialog>
    <div class="base-flex-box">
        <el-form
            v-title
            class="stripe"
        >
            <div class="base-head-box">{{ Translate('IDCS_CONTRL_MODEL') }}</div>
            <el-form-item>
                <el-checkbox
                    v-model="formData.sensorSwitch"
                    :label="Translate('IDCS_ALARM_SWITCH')"
                />
            </el-form-item>
            <el-form-item>
                <span class="text-tips">{{ Translate('IDCS_ALARM_SWITCH_TIP') }}</span>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_INPUT_SOURCE')">
                <BaseSelect
                    v-model="formData.inputSource"
                    :props="{
                        value: 'id',
                        label: 'name',
                    }"
                    :options="pageData.sensorSourcelist"
                />
            </el-form-item>
        </el-form>
        <el-form
            v-title
            class="stripe"
            :style="{
                '--form-label-width': '250px',
            }"
        >
            <div class="base-head-box">
                {{ Translate('IDCS_SYSTEM_ARM_SET') }}
            </div>
            <el-form-item :label="Translate('IDCS_STATE')">
                <span class="state">{{ formData.defenseSwitch ? Translate('IDCS_GUARD_CLOSED') : Translate('IDCS_GUARD_OPENED') }}</span>
                <el-button @click="setDisarmAll">{{ formData.defenseSwitch ? Translate('IDCS_RECOVER_GUARD') : Translate('IDCS_CLOSE_GUARD') }}</el-button>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <el-checkbox
                        v-model="formData.autoResetSwitch"
                        :label="Translate('IDCS_TIMING_CLOSE_DISATRM')"
                    />
                </template>
                <BaseTimePicker
                    v-model="formData.resetTime"
                    :disabled="!formData.autoResetSwitch"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box space-between gap">
            <div>
                {{ Translate('IDCS_RECOVER_GUARD_CHANNEL') }}
            </div>
            <el-button @click="pageData.showAddDialog = true">{{ Translate('IDCS_ADD') }}</el-button>
        </div>
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
                class="table"
                highlight-current-row
                show-overflow-tooltip
            >
                <el-table-column
                    :label="`${Translate('IDCS_CHANNEL')}/${Translate('IDCS_SENSOR')}`"
                    prop="chlName"
                    width="200"
                />
                <el-table-column
                    prop="disarmItemsStr"
                    :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                    width="800"
                >
                    <template #default="{ row }: TableColumn<AlarmSystemDisarmDto>">
                        {{ displayDisarmItems(row) }}
                    </template>
                </el-table-column>
                <el-table-column min-width="120">
                    <template #header>
                        <BasePopover
                            v-model:visible="pageData.popoverVisible"
                            width="fit-content"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_CONFIG') }}
                                </BaseTableDropdownLink>
                            </template>
                            <div class="cfg_table">
                                <el-table
                                    ref="popTableRef"
                                    v-title
                                    show-overflow-tooltip
                                    height="250"
                                    :data="totalDefenseParamList"
                                >
                                    <el-table-column
                                        type="selection"
                                        width="55"
                                    />
                                    <el-table-column
                                        :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                                        prop="value"
                                    />
                                </el-table>
                                <div class="base-btn-box">
                                    <el-button @click="disarmCfgAll">
                                        {{ Translate('IDCS_OK') }}
                                    </el-button>
                                    <el-button @click="pageData.popoverVisible = false">
                                        {{ Translate('IDCS_CANCEL') }}
                                    </el-button>
                                </div>
                            </div>
                        </BasePopover>
                    </template>
                    <template #default="{ $index }: TableColumn<AlarmSystemDisarmDto>">
                        <el-button @click="disarmCfg($index)">
                            {{ Translate('IDCS_CONFIG') }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column min-width="120">
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteItemAll">
                                        {{ Translate('IDCS_DELETE_ALL') }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<AlarmSystemDisarmDto>">
                        <el-button @click="deleteItem(row)">
                            {{ Translate('IDCS_DELETE') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box flex-start">
            <span class="text-tips">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</span>
        </div>
        <div class="base-btn-box collapse">
            <el-button @click="filterConfiguredDefParaList">
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./SystemDisarm.v.ts"></script>

<style lang="scss" scoped>
.state {
    margin-right: 10px;
}

.cfg_table {
    width: 480px;
    padding: 10px;
}
</style>
