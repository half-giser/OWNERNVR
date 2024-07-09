<template>
    <div id="ChannelOsd">
        <div class="main">
            <div class="left">
                <div class="playerWrap">
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
                    label-width="160px"
                    label-position="left"
                >
                    <el-form-item label-width="0">
                        <template #default>
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
                        </template>
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
            <div class="right">
                <el-table
                    ref="tableRef"
                    border
                    stripe
                    :data="tableData"
                    table-layout="fixed"
                    show-overflow-tooltip
                    empty-text=" "
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <div
                                v-if="scope.row.status === 'loading'"
                                class="table_status_col_loading"
                                :title="scope.row.statusInitToolTip"
                            ></div>
                            <BaseImgSprite
                                v-else-if="scope.row.status === 'success'"
                                file="success"
                                :chunk="1"
                                :index="0"
                                :title="scope.row.statusInitToolTip"
                            />
                            <BaseImgSprite
                                v-else-if="scope.row.status === 'error'"
                                file="error"
                                :chunk="1"
                                :index="0"
                                :title="scope.row.statusInitToolTip"
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
                                    {{ `${Translate('IDCS_NAME')}OSD` }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                                    {{ `${Translate('IDCS_TIME')}OSD` }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                                    {{ Translate('IDCS_DATE_FORMAT') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                                    {{ Translate('IDCS_TIME_FORMAT') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                                    {{ Translate('IDCS_WATER_MARK') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
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
                            />
                        </template>
                    </el-table-column>
                </el-table>
                <el-row class="row_pagination">
                    <el-pagination
                        v-model:current-page="pageIndex"
                        v-model:page-size="pageSize"
                        :page-sizes="DefaultPagerSizeOptions"
                        small
                        :background="false"
                        :layout="DefaultPagerLayout"
                        :total="pageTotal"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                    />
                </el-row>
                <el-row class="row_operation_btn">
                    <el-col class="el-col-flex-end">
                        <el-button
                            :disabled="btnOKDisabled"
                            @click="save"
                            >{{ Translate('IDCS_APPLY') }}
                        </el-button>
                    </el-col>
                </el-row>
            </div>
        </div>
        <div></div>
    </div>
</template>

<script lang="ts" src="./ChannelOsd.v.ts"></script>

<style scoped lang="scss">
#ChannelOsd {
    .main {
        display: flex;
        width: 100%;

        .left {
            width: 400px;
            margin-right: 10px;

            .playerWrap {
                width: 400px;
                height: 300px;
            }
        }
        .right {
            width: calc(100% - 410px);
            flex-grow: 1;

            :deep(.el-table) {
                width: 100%;
                height: calc(100vh - 335px);
            }

            .row_operation_btn {
                margin-top: 30px;
            }

            :deep(.custom_cell) {
                .cell {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            }
        }
    }
}
</style>
