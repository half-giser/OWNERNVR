<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-23 10:54:01
 * @Description: 系统撤防
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-29 10:53:17
-->
<template>
    <!-- 添加弹窗 -->
    <el-dialog
        v-model="pageData.showAddDialog"
        :title="Translate('IDCS_ADD')"
        width="520"
        @open="filterChlsSource()"
    >
        <el-table
            stripe
            border
            show-overflow-tooltip
            height="287"
            :data="pageData.filterChlsSourceList"
            @selection-change="handleSelectedAdd"
        >
            <el-table-column
                type="selection"
                width="55"
            >
            </el-table-column>
            <el-table-column :label="pageData.addDialogTitle">
                <template #default="scope">
                    {{ scope.row.value }}
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <div class="base-btn-box collapse">
                <el-button @click="addItem">
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="pageData.showAddDialog = false">
                    {{ Translate('IDCS_CANCEL') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
    <!-- 配置弹窗 -->
    <el-dialog
        v-model="pageData.showCfgDialog"
        :title="Translate('IDCS_RECOVER_LINK_ITEM')"
        width="520"
    >
        <el-table
            stripe
            border
            show-overflow-tooltip
            height="287"
            :data="cfgTableData"
            @select-all="handleSelectCfgAll"
        >
            <el-table-column width="55">
                <template #header>
                    <el-checkbox
                        v-model="pageData.isSelectAll"
                        @change="handleSelectCfgAll"
                    />
                </template>
                <template #default="scope">
                    <el-checkbox
                        v-model="scope.row.selected"
                        @change="handleSelectedCfg(scope.row)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                prop="value"
            >
            </el-table-column>
        </el-table>
        <template #footer>
            <el-row class="tips_text_pop">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</el-row>
            <el-row class="base-btn-box collapse">
                <el-button @click="cfgItem">
                    {{ Translate('IDCS_OK') }}
                </el-button>
                <el-button @click="pageData.showCfgDialog = false">
                    {{ Translate('IDCS_CANCEL') }}
                </el-button>
            </el-row>
        </template>
    </el-dialog>
    <div class="base-flex-box">
        <div class="base-subheading-box">{{ Translate('IDCS_CONTRL_MODEL') }}</div>
        <el-form
            ref="formRef"
            :model="formData"
            :style="{
                '--form-label-width': '172px',
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.sensorSwitch"
                    :label="Translate('IDCS_ALARM_SWITCH')"
                    @change="pageData.applyDisable = false"
                />
            </el-form-item>
            <el-form-item>
                <span class="tips_text">{{ Translate('IDCS_ALARM_SWITCH_TIP') }}</span>
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_INPUT_SOURCE')"
                label-width="fit-content"
            >
                <el-select
                    v-model="formData.inputSource"
                    @change="pageData.applyDisable = false"
                >
                    <el-option
                        v-for="item in pageData.sensorSourcelist"
                        :key="item.id"
                        :label="item.value"
                        :value="item.id"
                    />
                </el-select>
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
                <div
                    class="base-btn-box"
                    :span="2"
                >
                    <div>{{ Translate('IDCS_RECOVER_GUARD_CHANNEL') }}</div>
                    <div>
                        <el-button @click="pageData.showAddDialog = true">{{ Translate('IDCS_ADD') }}</el-button>
                    </div>
                </div>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                class="table"
                stripe
                border
                highlight-current-row
                show-overflow-tooltip
            >
                <el-table-column
                    :label="`${Translate('IDCS_CHANNEL')}/${Translate('IDCS_SENSOR')}`"
                    prop="chlName"
                >
                </el-table-column>
                <el-table-column
                    prop="disarmItemsStr"
                    :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                >
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
                                    stripe
                                    show-overflow-tooltip
                                    height="250"
                                    :data="pageData.totalDefenseParamList"
                                    @selection-change="handleSelectedDropDown"
                                >
                                    <el-table-column
                                        type="selection"
                                        width="55"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                        :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                                        prop="value"
                                    />
                                </el-table>
                                <el-row class="base-btn-box">
                                    <el-button @click="disarmCfgAll">
                                        {{ Translate('IDCS_OK') }}
                                    </el-button>
                                    <el-button @click="dropDownRef?.handleClose()">
                                        {{ Translate('IDCS_CANCEL') }}
                                    </el-button>
                                </el-row>
                            </div>
                        </el-popover>
                        <!-- <el-dropdown
                            ref="dropDownRef"
                            
                            :hide-on-click="false"
                            placement="top"
                        >
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_CONFIG') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <div class="cfg_table">
                                        <el-table
                                            stripe
                                            show-overflow-tooltip
                                            height="250"
                                            :data="pageData.totalDefenseParamList"
                                            @selection-change="handleSelectedDropDown"
                                        >
                                            <el-table-column
                                                type="selection"
                                                width="55"
                                            >
                                            </el-table-column>
                                            <el-table-column :label="Translate('IDCS_RECOVER_LINK_ITEM')">
                                                <template #default="scope">
                                                    <span>{{ scope.row.value }}</span>
                                                </template>
                                            </el-table-column>
                                        </el-table>
                                        <el-row class="base-btn-box">
                                            <el-button @click="disarmCfgAll">
                                                {{ Translate('IDCS_OK') }}
                                            </el-button>
                                            <el-button @click="dropDownRef?.handleClose()">
                                                {{ Translate('IDCS_CANCEL') }}
                                            </el-button>
                                        </el-row>
                                    </div>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown> -->
                    </template>
                    <template #default="scope">
                        <el-button @click="disarmCfg(scope.$index)">
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
                    <template #default="scope">
                        <el-button @click="deleteItem(scope.row)">
                            {{ Translate('IDCS_DELETE') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            span="start"
        >
            <span class="tips_text">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</span>
        </div>
        <div class="base-btn-box collapse">
            <el-button
                :disabled="pageData.applyDisable"
                @click="filterConfiguredDefParaList"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./SystemDisarm.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>

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
}
// :deep {
//     .el-checkbox {
//         --el-checkbox-font-size: 15px;
//     }
//     .el-form-item {
//         --font-size: 15px;
//     }
//     .el-form-item__label {
//         font-size: 15px;
//     }
// }
</style>
