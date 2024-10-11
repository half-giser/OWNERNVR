<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 通道 - OSD配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-09 18:47:38
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
                class="narrow"
                label-position="left"
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
                        placeholder=" "
                        @change="handleChlSel"
                    >
                        <el-option
                            v-for="(item, index) in chlList"
                            :key="index"
                            :value="item.id"
                            :label="item.name || ' '"
                        >
                        </el-option>
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
                <el-form-item
                    prop="dateFormat"
                    :label="Translate('IDCS_DATE_FORMAT')"
                >
                    <span>{{ formData.supportDateFormat ? dateFormatTip[formData.dateFormat] : '--' }}</span>
                </el-form-item>
                <el-form-item
                    prop="timeFormat"
                    :label="Translate('IDCS_TIME_FORMAT')"
                >
                    <span>{{ formData.supportTimeFormat ? timeFormatTip[formData.timeFormat] : '--' }}</span>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK')">
                    <el-select
                        v-model="formData.remarkSwitch"
                        :disabled="formData.remarkDisabled"
                        placeholder=" "
                        @change="handleChangeSwitch(formData.remarkSwitch, formData.id, 'remarkSwitch')"
                    >
                        <el-option
                            :value="true"
                            :label="Translate('IDCS_ON')"
                        />
                        <el-option
                            :value="false"
                            :label="Translate('IDCS_OFF')"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_WATER_MARK_CHAR')">
                    <el-input
                        v-model="formData.remarkNote"
                        maxlength="15"
                        :disabled="formData.remarkDisabled"
                        @input="handleRemarkNoteInput(formData)"
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
                    table-layout="fixed"
                    show-overflow-tooltip
                    empty-text=" "
                    highlight-current-row
                    :row-class-name="(data) => (data.row.disabled ? 'disabled' : '')"
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
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
                        min-width="120px"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.name"
                                size="small"
                                maxlength="63"
                                :disabled="scope.row.disabled"
                                @focus="tempName = scope.row.name"
                                @blur="handleNameBlur(scope.row.id, scope.row.name)"
                                @change="handleInputChange(scope.row.id)"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${Translate('IDCS_NAME')}OSD`"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ `${Translate('IDCS_NAME')}OSD` }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="changeSwitchAll(true, 'displayName')">{{ Translate('IDCS_ON') }}</el-dropdown-item>
                                        <el-dropdown-item @click="changeSwitchAll(false, 'displayName')">{{ Translate('IDCS_OFF') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-show="!scope.row.isSpeco"
                                v-model="scope.row.displayName"
                                size="small"
                                placeholder=" "
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.displayName, scope.row.id, 'displayName')"
                            >
                                <el-option
                                    :value="true"
                                    :label="Translate('IDCS_ON')"
                                />
                                <el-option
                                    :value="false"
                                    :label="Translate('IDCS_OFF')"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="`${Translate('IDCS_TIME')}OSD`"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ `${Translate('IDCS_TIME')}OSD` }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="changeSwitchAll(true, 'displayTime')">{{ Translate('IDCS_ON') }}</el-dropdown-item>
                                        <el-dropdown-item @click="changeSwitchAll(false, 'displayTime')">{{ Translate('IDCS_OFF') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-show="!scope.row.isSpeco"
                                v-model="scope.row.displayTime"
                                size="small"
                                placeholder=" "
                                :disabled="scope.row.disabled"
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.displayTime, scope.row.id, 'displayTime')"
                            >
                                <el-option
                                    :value="true"
                                    :label="Translate('IDCS_ON')"
                                />
                                <el-option
                                    :value="false"
                                    :label="Translate('IDCS_OFF')"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_DATE_FORMAT')"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_DATE_FORMAT') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
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
                            <span>{{ scope.row.supportDateFormat ? dateFormatTip[scope.row.dateFormat] : '--' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_TIME_FORMAT')"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_TIME_FORMAT') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
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
                            <span>{{ scope.row.supportTimeFormat ? timeFormatTip[scope.row.timeFormat] : '--' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="ip"
                        :label="Translate('IDCS_ADDRESS')"
                        min-width="140px"
                    />
                    <el-table-column
                        :label="Translate('IDCS_WATER_MARK')"
                        min-width="120px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_WATER_MARK') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="changeSwitchAll(true, 'remarkSwitch')">{{ Translate('IDCS_ON') }}</el-dropdown-item>
                                        <el-dropdown-item @click="changeSwitchAll(false, 'remarkSwitch')">{{ Translate('IDCS_OFF') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.remarkSwitch"
                                :disabled="scope.row.remarkDisabled"
                                size="small"
                                placeholder=" "
                                @focus="handleRowClick(scope.row)"
                                @change="handleChangeSwitch(scope.row.remarkSwitch, scope.row.id, 'remarkSwitch')"
                            >
                                <el-option
                                    :value="true"
                                    :label="Translate('IDCS_ON')"
                                />
                                <el-option
                                    :value="false"
                                    :label="Translate('IDCS_OFF')"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_WATER_MARK_CHAR')"
                        min-width="200px"
                    >
                        <template #default="scope">
                            <el-input
                                v-model="scope.row.remarkNote"
                                :disabled="scope.row.remarkDisabled"
                                maxlength="15"
                                size="small"
                                @input="handleRemarkNoteInput(scope.row)"
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
                    :page-sizes="DefaultPagerSizeOptions"
                    size="small"
                    :background="false"
                    :layout="DefaultPagerLayout"
                    :total="pageTotal"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
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
