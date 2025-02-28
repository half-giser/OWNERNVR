<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 通道 - OSD配置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                    @time="onTime"
                    @message="notify"
                />
            </div>
            <el-form
                class="stripe"
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
                    <el-select-v2
                        v-model="selectedChlId"
                        :options="chlOptions"
                        @change="handleChlSel"
                    />
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
                    <el-select-v2
                        v-model="formData.remarkSwitch"
                        :disabled="formData.remarkDisabled"
                        :options="switchOptions"
                        @change="handleChangeSwitch(formData.remarkSwitch, formData.id, 'remarkSwitch')"
                    />
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
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="120"
                    >
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <el-input
                                v-model="row.name"
                                maxlength="63"
                                :disabled="row.disabled"
                                @focus="tempName = row.name"
                                @blur="handleNameBlur(row.id, row.name)"
                                @change="handleInputChange(row.id)"
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
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <el-select-v2
                                v-show="!row.isSpeco"
                                v-model="row.displayName"
                                :disabled="row.disabled"
                                :options="switchOptions"
                                @focus="handleRowClick(row)"
                                @change="handleChangeSwitch(row.displayName, row.id, 'displayName')"
                            />
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
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <el-select-v2
                                v-show="!row.isSpeco"
                                v-model="row.displayTime"
                                :disabled="row.disabled"
                                :options="switchOptions"
                                @focus="handleRowClick(row)"
                                @change="handleChangeSwitch(row.displayTime, row.id, 'displayTime')"
                            />
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
                                            v-for="(label, value) in dateFormatTip"
                                            :key="value"
                                            @click="changeDateFormatAll(value)"
                                        >
                                            {{ label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            {{ row.supportDateFormat ? dateFormatTip[row.dateFormat] : '--' }}
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
                                            v-for="(label, value) in timeFormatTip"
                                            :key="value"
                                            @click="changeTimeFormatAll(value)"
                                        >
                                            {{ label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            {{ row.supportTimeFormat ? timeFormatTip[row.timeFormat] : '--' }}
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
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <el-select-v2
                                v-model="row.remarkSwitch"
                                :disabled="row.remarkDisabled"
                                :options="switchOptions"
                                @focus="handleRowClick(row)"
                                @change="handleChangeSwitch(row.remarkSwitch, row.id, 'remarkSwitch')"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_WATER_MARK_CHAR')"
                        min-width="200"
                    >
                        <template #default="{ row }: TableColumn<ChannelOsdDto>">
                            <el-input
                                v-model="row.remarkNote"
                                :disabled="row.remarkDisabled"
                                maxlength="15"
                                :formatter="handleRemarkNoteInput"
                                :parser="handleRemarkNoteInput"
                                @blur="handleRemarkNoteBlur(row.remarkNote, row.id)"
                                @change="handleInputChange(row.id)"
                                @keyup.enter="blurInput"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-pagination-box">
                <BasePagination
                    v-model:current-page="pageIndex"
                    v-model:page-size="pageSize"
                    :total="pageTotal"
                    @size-change="getDataList"
                    @current-change="getDataList"
                />
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="!editRows.size()"
                    @click="save"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelOsd.v.ts"></script>
