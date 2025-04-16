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
                <template #default="{ row }: TableColumn<AlarmSystemDisarmChlAndSensorSrcDto>">
                    {{ row.value }}
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
        <div class="tips_text_pop">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</div>
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
        <div class="base-subheading-box">{{ Translate('IDCS_CONTRL_MODEL') }}</div>
        <el-form
            v-title
            :style="{
                '--form-label-width': '172px',
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.sensorSwitch"
                    :label="Translate('IDCS_ALARM_SWITCH')"
                />
            </el-form-item>
            <el-form-item>
                <span class="tips_text">{{ Translate('IDCS_ALARM_SWITCH_TIP') }}</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_INPUT_SOURCE')"
                label-width="fit-content"
            >
                <el-select-v2
                    v-model="formData.inputSource"
                    :props="{
                        value: 'id',
                        label: 'value',
                    }"
                    :options="pageData.sensorSourcelist"
                />
            </el-form-item>
        </el-form>
        <div class="base-subheading-box subTitle2">
            {{ Translate('IDCS_SYSTEM_ARM_SET') }}
        </div>
        <el-form>
            <el-form-item>
                <span class="guard_text">{{ Translate('IDCS_STATE') }} :</span>
                <span class="guard_text">{{ pageData.defenseSwitch ? Translate('IDCS_GUARD_CLOSED') : Translate('IDCS_GUARD_OPENED') }}</span>
                <el-button @click="setdisarmAll">{{ pageData.defenseSwitch ? Translate('IDCS_RECOVER_GUARD') : Translate('IDCS_CLOSE_GUARD') }}</el-button>
            </el-form-item>
            <el-form-item>
                <div class="base-btn-box space-between">
                    <div>{{ Translate('IDCS_RECOVER_GUARD_CHANNEL') }}</div>
                    <el-button @click="pageData.showAddDialog = true">{{ Translate('IDCS_ADD') }}</el-button>
                </div>
            </el-form-item>
        </el-form>
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
                <el-table-column>
                    <template #header>
                        <el-popover
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
                                    :data="pageData.totalDefenseParamList"
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
                        </el-popover>
                    </template>
                    <template #default="{ $index }: TableColumn<AlarmSystemDisarmDto>">
                        <el-button @click="disarmCfg($index)">
                            {{ Translate('IDCS_CONFIG') }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <el-dropdown>
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
                        </el-dropdown>
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
            <span class="tips_text">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</span>
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
.guard_text {
    font-size: 15px;
    margin-right: 45px;
}

.cfg_table {
    width: 480px;
    padding: 10px;
}

.tips_text {
    font-size: 15px;
    color: var(--main-text-light);
}

.tips_text_pop {
    font-size: 14px;
    color: var(--main-text-light);
    margin-bottom: 5px;
    margin-top: 5px;
}
</style>
