<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-23 10:54:01
 * @Description: 
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 18:19:45
-->
<template>
    <el-dialog
        v-model="pageData.showAddDialog"
        :title="Translate('IDCS_ADD')"
        draggable
        center
        width="520px"
        @open="filterChlsSource()"
    >
        <el-table
            class="add_table"
            stripe
            border
            show-overflow-tooltip
            height="287px"
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
                    <span>{{ scope.row.value }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-row class="base-btn-box">
            <el-button @click="addItem">
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="pageData.showAddDialog = false">
                {{ Translate('IDCS_CANCEL') }}
            </el-button>
        </el-row>
    </el-dialog>
    <el-dialog
        v-model="pageData.showCfgDialog"
        :title="Translate('IDCS_RECOVER_LINK_ITEM')"
        draggable
        center
        width="520px"
    >
        <el-table
            class="add_table"
            stripe
            border
            show-overflow-tooltip
            height="287px"
            :data="cfgTableData"
            @select-all="handleSelectCfgAll"
        >
            <el-table-column width="55">
                <template #header>
                    <el-checkbox
                        v-model="pageData.isSelectAll"
                        @change="handleSelectCfgAll"
                    ></el-checkbox>
                </template>
                <template #default="scope">
                    <el-checkbox
                        v-model="scope.row.selected"
                        @change="handleSelectedCfg(scope.row)"
                    ></el-checkbox>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_RECOVER_LINK_ITEM')"
                prop="value"
            >
                <template #default="scope">
                    <span>{{ scope.row.value }}</span>
                </template>
            </el-table-column>
        </el-table>
        <el-row class="base-btn-box">
            <el-button @click="cfgItem">
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button @click="pageData.showCfgDialog = false">
                {{ Translate('IDCS_CANCEL') }}
            </el-button>
        </el-row>
    </el-dialog>
    <div class="base-subheading-box">{{ Translate('IDCS_CONTRL_MODEL') }}</div>
    <el-form
        ref="formRef"
        :model="formData"
        label-position="left"
        label-width="172px"
        :style="{
            '--form-input-width': '250px',
        }"
    >
        <el-form-item
            prop="alarmSwitch"
            label-width="0px"
        >
            <el-checkbox
                v-model="formData.sensorSwitch"
                @change="pageData.applyDisable = false"
                >{{ Translate('IDCS_ALARM_SWITCH') }}</el-checkbox
            >
        </el-form-item>
        <el-form-item label-width="0px">
            <span id="tips">{{ Translate('IDCS_ALARM_SWITCH_TIP') }}</span>
        </el-form-item>
        <el-form-item
            prop="inputSource"
            :label="Translate('IDCS_INPUT_SOURCE')"
            label-width="fit-content"
        >
            <el-select
                v-model="formData.inputSource"
                size="small"
                prop="inputSource"
                value-key="value"
                :options="pageData.sensorSourcelist"
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
    <div
        id="subTitle2"
        class="base-subheading-box"
    >
        {{ Translate('IDCS_SYSTEM_ARM_SET') }}
    </div>
    <div class="disarm_content">
        <el-form>
            <el-form-item>
                <span class="txt">{{ Translate('IDCS_STATE') }} :</span>
                <span class="txt">{{ pageData.defenseSwitch ? Translate('IDCS_GUARD_CLOSED') : Translate('IDCS_GUARD_OPENED') }}</span>
                <el-button @click="setdisarmAll">{{ pageData.defenseSwitch ? Translate('IDCS_RECOVER_GUARD') : Translate('IDCS_CLOSE_GUARD') }}</el-button>
            </el-form-item>
            <el-form-item>
                <el-row id="add_row">
                    <span class="txt">{{ Translate('IDCS_RECOVER_GUARD_CHANNEL') }}</span>
                    <el-button
                        id="btn_add"
                        @click="pageData.showAddDialog = true"
                        >{{ Translate('IDCS_ADD') }}</el-button
                    >
                </el-row>
            </el-form-item>
        </el-form>
        <el-table
            :data="tableData"
            class="table"
            stripe
            border
            height="313px"
            highlight-current-row
            show-overflow-tooltip
        >
            <el-table-column
                prop="chlName"
                width="250px"
            >
                <template #header>
                    <span>{{ `${Translate('IDCS_CHANNEL')}/${Translate('IDCS_SENSOR')}` }}</span>
                </template>
                <template #default="scope">
                    <span>{{ scope.row.chlName }}</span>
                </template>
            </el-table-column>
            <el-table-column
                prop="defenseSwitch"
                width="820px"
                :label="Translate('IDCS_RECOVER_LINK_ITEM')"
            >
                <template #default="scope">
                    <span>{{ scope.row.disarmItemsStr }}</span>
                </template>
            </el-table-column>
            <el-table-column width="165px">
                <template #header>
                    <el-dropdown
                        ref="dropDownRef"
                        trigger="click"
                        :hide-on-click="false"
                        placement="bottom-end"
                    >
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_CONFIG') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <div>
                                        <el-table
                                            class="cfg_table"
                                            stripe
                                            show-overflow-tooltip
                                            height="250px"
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
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-button @click="disarmCfg(scope.$index)">
                        {{ Translate('IDCS_CONFIG') }}
                    </el-button>
                </template>
            </el-table-column>
            <el-table-column width="165px">
                <template #header>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{ Translate('IDCS_DELETE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item>
                                    <span @click="deleteItemAll">{{ Translate('IDCS_DELETE_ALL') }}</span>
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
        <div class="bottom_box">
            <div>
                <span id="tips">{{ Translate('IDCS_CLOSE_GUARD_TIP') }}</span>
            </div>
            <el-row class="base-btn-box">
                <el-button
                    :disabled="pageData.applyDisable"
                    @click="filterConfiguredDefParaList"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts" src="./SystemDisarm.v.ts"></script>

<style lang="scss" scoped>
#n9web .el-form .el-form-item {
    padding: 1px 0px 2px 15px;
    margin-bottom: 0;
}
#tips {
    color: #8d8d8d;
    font-size: 15px;
}
.add_table {
    margin-top: -11px;
}
.el-form {
    margin-top: 10px;
    --el-form-label-font-size: 15px;
    .add_row {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .txt {
        font-size: 15px;
        margin-right: 45px;
    }
    .el-checkbox {
        color: black;
        --el-checkbox-font-size: 15px;
    }
    #add_row {
        width: 1400px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
}

#subTitle2 {
    margin-top: 36px;
}
.disarm_content {
    width: 1415px;
    .table {
        margin: 0px 0px 0px 15px;
        width: 1400px;
    }
    .bottom_box {
        margin: 7px 0px 0px 15px;
        .base-btn-box {
            margin-top: 1px;
        }
    }
}
.cfg_table {
    width: 400px;
}
</style>
