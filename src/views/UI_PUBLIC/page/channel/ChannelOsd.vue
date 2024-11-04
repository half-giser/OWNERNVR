<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 通道 - OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-31 19:33:46
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    :split="1"
                    @onready="onReady"
                    @ontime="onTime"
                />
            </div>
            <el-form
                ref="formRef"
                :model="formData"
                :style="{
                    '--form-label-width': '160px',
                }"
            >
                <el-form-item>
                    <el-checkbox
                        v-model="formData.displayName"
                        :label="`${Translate('IDCS_NAME')}OSD`"
                        :disabled="nameDisabled || formData.isSpeco"
                        @change="handleChangeSwitch(formData.displayName, formData.id, 'displayName')"
                    />
                    <el-checkbox
                        v-model="formData.displayTime"
                        :label="`${Translate('IDCS_TIME')}OSD`"
                        :disabled="nameDisabled || formData.isSpeco"
                        @change="handleChangeSwitch(formData.displayTime, formData.id, 'displayTime')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="selectedChlId"
                        @change="handleChlSel"
                    >
                        <el-option
                            v-for="(item, index) in chlList"
                            :key="index"
                            :value="item.id"
                            :label="item.name || ' '"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CHANNEL_NAME')">
                    <el-input
                        v-model="formData.name"
                        maxlength="63"
                        :disabled="nameDisabled || formData.isSpeco"
                        @blur="handleNameBlur(formData.id, formData.name)"
                        @change="handleInputChange(formData.id)"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_DATE_FORMAT')">
                    {{ formData.supportDateFormat ? dateFormatTip[formData.dateFormat] : '--' }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TIME_FORMAT')">
                    {{ formData.supportTimeFormat ? timeFormatTip[formData.timeFormat] : '--' }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK')">
                    <el-select
                        v-model="formData.remarkSwitch"
                        :disabled="formData.remarkDisabled"
                        @change="handleChangeSwitch(formData.remarkSwitch, formData.id, 'remarkSwitch')"
                    >
                        <el-option
                            v-for="item in switchOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK_CHAR')">
                    <el-input
                        v-model="formData.remarkNote"
                        maxlength="15"
                        :disabled="formData.remarkDisabled"
                        :formatter="handleRemarkNoteInput"
                        :parser="handleRemarkNoteInput"
                        @blur="handleRemarkNoteBlur(formData.remarkNote, formData.id)"
                        @change="handleInputChange(formData.id)"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    border
                    stripe
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="scope">
                            <BaseTableRowStatus
                                :icon="scope.row.status"
                                :error-text="scope.row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="120"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.name"
                                maxlength="63"
                                :disabled="scope.row.disabled"
                                @focus="tempName = scope.row.name"
                                @blur="handleNameBlur(scope.row.id, scope.row.name)"
                                @change="handleInputChange(scope.row.id)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${Translate('IDCS_NAME')}OSD`"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink> {{ Translate('IDCS_NAME') }}OSD </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="changeSwitchAll(item.value, 'displayName')"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-show="!scope.row.isSpeco"
                                v-model="scope.row.displayName"
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.displayName, scope.row.id, 'displayName')"
                            >
                                <el-option
                                    v-for="item in switchOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${Translate('IDCS_TIME')}OSD`"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink> {{ Translate('IDCS_TIME') }}OSD </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="changeSwitchAll(item.value, 'displayTime')"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-show="!scope.row.isSpeco"
                                v-model="scope.row.displayTime"
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.displayTime, scope.row.id, 'displayTime')"
                            >
                                <el-option
                                    v-for="item in switchOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_DATE_FORMAT')"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_DATE_FORMAT') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(item, index) in dateFormatOptions"
                                            :key="index"
                                            @click="changeDateFormatAll(item.value)"
                                            >{{ item.text }}</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            {{ scope.row.supportDateFormat ? dateFormatTip[scope.row.dateFormat] : '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TIME_FORMAT')"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_TIME_FORMAT') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="(value, key) in timeFormatTip"
                                            :key="key"
                                            @click="changeTimeFormatAll(key)"
                                            >{{ value }}</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            {{ scope.row.supportTimeFormat ? timeFormatTip[scope.row.timeFormat] : '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="ip"
                        :label="Translate('IDCS_ADDRESS')"
                        min-width="140"
                    />
                    <el-table-column
                        :label="Translate('IDCS_WATER_MARK')"
                        min-width="120"
                    >
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_WATER_MARK') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="changeSwitchAll(item.value, 'remarkSwitch')"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.remarkSwitch"
                                :disabled="scope.row.remarkDisabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.remarkSwitch, scope.row.id, 'remarkSwitch')"
                            >
                                <el-option
                                    v-for="item in switchOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_WATER_MARK_CHAR')"
                        min-width="200"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.remarkNote"
                                :disabled="scope.row.remarkDisabled"
                                maxlength="15"
                                :formatter="handleRemarkNoteInput"
                                :parser="handleRemarkNoteInput"
                                @blur="handleRemarkNoteBlur(scope.row.remarkNote, scope.row.id)"
                                @change="handleInputChange(scope.row.id)"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="row_pagination">
                <el-pagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="btnOKDisabled"
                    @click="save"
                    >{{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelOsd.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/channel.scss';
</style>
